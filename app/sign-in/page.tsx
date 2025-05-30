"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user } = useAuth()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "confirmation_failed") {
      setError("Email confirmation failed. Please try signing up again.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signIn(email, password)

    if (error) {
      // Check if the error is related to email confirmation
      if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
        setShowEmailConfirmation(true)
      } else {
        setError(error.message)
      }
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const resendConfirmationEmail = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Get the current origin dynamically
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://v0-dark-themed-ticket-app.vercel.app"
      const redirectTo = `${origin}/auth/callback`

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        // Show success message or update UI to indicate email was sent
        setError("")
        // You could add a success state here if needed
      }
    } catch (error) {
      console.error("Error resending confirmation email:", error)
      setError("Failed to resend confirmation email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // If user is already signed in but email not confirmed, show confirmation message
  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      setShowEmailConfirmation(true)
    }
  }, [user])

  if (showEmailConfirmation) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900/50 p-8 shadow-lg shadow-purple-900/10 text-center">
          <div className="mb-4 rounded-full bg-purple-900/30 p-3 mx-auto w-fit">
            <CheckCircle className="h-12 w-12 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Check Your Email</h1>
          <p className="text-gray-400">
            We've sent a confirmation link to <strong>{email || user?.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in your email to confirm your account and you'll be automatically redirected to your
            dashboard.
          </p>

          {/* Add error display for resend functionality */}
          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Button
              onClick={resendConfirmationEmail}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Sending..." : "Resend Confirmation Email"}
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setShowEmailConfirmation(false)}
            >
              Try Different Email
            </Button>
            <Button asChild variant="ghost" className="w-full text-gray-400 hover:text-white">
              <Link href="/sign-up">Create New Account</Link>
            </Button>
          </div>

          {/* Troubleshooting section */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2">
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="text-xs text-gray-400 space-y-1 text-left">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes and refresh your inbox</li>
              <li>• Try clicking "Resend Confirmation Email" above</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900/50 p-8 shadow-lg shadow-purple-900/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Sign In</h1>
          <p className="mt-2 text-gray-400">Welcome back to Top City Tickets</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-700 bg-gray-800 pl-10 pr-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <Separator className="my-4 bg-gray-700" />

          <div className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-purple-400 hover:text-purple-300">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
