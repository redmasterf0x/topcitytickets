import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback called with:", {
    code: !!code,
    error,
    errorDescription,
    url: requestUrl.toString(),
    origin: requestUrl.origin,
  })

  // If there's an error in the URL params, redirect to sign-in with error
  if (error) {
    console.error("Auth callback error from URL params:", error, errorDescription)
    const redirectUrl = new URL("/sign-in", requestUrl.origin)
    redirectUrl.searchParams.set("error", error)
    if (errorDescription) {
      redirectUrl.searchParams.set("description", errorDescription)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    try {
      console.log("Attempting to exchange code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        const redirectUrl = new URL("/sign-in", requestUrl.origin)
        redirectUrl.searchParams.set("error", "confirmation_failed")
        redirectUrl.searchParams.set("message", exchangeError.message)
        return NextResponse.redirect(redirectUrl)
      }

      if (data.user) {
        console.log("Successfully exchanged code for session, user:", data.user.email)
        console.log("Redirecting to dashboard...")

        // Create the dashboard redirect URL
        const dashboardUrl = new URL("/dashboard", requestUrl.origin)
        console.log("Dashboard redirect URL:", dashboardUrl.toString())

        return NextResponse.redirect(dashboardUrl)
      } else {
        console.error("No user data after successful code exchange")
        const redirectUrl = new URL("/sign-in", requestUrl.origin)
        redirectUrl.searchParams.set("error", "no_user_data")
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      const redirectUrl = new URL("/sign-in", requestUrl.origin)
      redirectUrl.searchParams.set("error", "confirmation_failed")
      redirectUrl.searchParams.set("message", "unexpected_error")
      return NextResponse.redirect(redirectUrl)
    }
  }

  // No code parameter, redirect to sign-in
  console.log("No code parameter found, redirecting to sign-in")
  const redirectUrl = new URL("/sign-in", requestUrl.origin)
  redirectUrl.searchParams.set("error", "no_code")
  return NextResponse.redirect(redirectUrl)
}
