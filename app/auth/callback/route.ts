import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("Auth callback called with:", { code: !!code, error, errorDescription, url: requestUrl.toString() })

  // If there's an error in the URL params, redirect to sign-in with error
  if (error) {
    console.error("Auth callback error from URL params:", error, errorDescription)
    return NextResponse.redirect(new URL(`/sign-in?error=${error}&description=${errorDescription}`, request.url))
  }

  if (code) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    try {
      console.log("Attempting to exchange code for session...")
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        return NextResponse.redirect(
          new URL(
            `/sign-in?error=confirmation_failed&message=${encodeURIComponent(exchangeError.message)}`,
            request.url,
          ),
        )
      }

      console.log("Successfully exchanged code for session, user:", data.user?.email)

      // Redirect to dashboard after successful email confirmation
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(new URL("/sign-in?error=confirmation_failed&message=unexpected_error", request.url))
    }
  }

  // No code parameter, redirect to sign-in
  console.log("No code parameter found, redirecting to sign-in")
  return NextResponse.redirect(new URL("/sign-in?error=no_code", request.url))
}
