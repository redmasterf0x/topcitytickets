"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // Update the handleSubmit function to use the correct production URL
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Always use production URL for password reset
    const redirectTo = "https://v0-dark-themed-ticket-app.vercel.app/reset-password"

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setEmailSent(true)
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container relative mx-auto flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg space-y-8 rounded-2xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-900/20">
            {/* Header with logo */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <img src="/logo.png" alt="Top City Tickets Logo" className="h-16 w-auto" />
              </div>
              <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
                <CheckCircle className="h-10 w-10 text-purple-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Check Your Email
              </h1>
              <p className="mt-3 text-gray-300">We've sent a password reset link to</p>
              <p className="mt-1 text-lg font-semibold text-white break-all">{email}</p>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-3">What's next?</h3>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold">
                      1
                    </span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold">
                      2
                    </span>
                    <span>Click the "Reset Password" link in the email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold">
                      3
                    </span>
                    <span>Create your new password</span>
                  </li>
                </ol>
              </div>

              {/* Troubleshooting */}
              <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4">
                <p className="text-sm text-gray-400 mb-2">
                  <strong className="text-gray-300">Didn't receive the email?</strong>
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Wait a few minutes and refresh your inbox</li>
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setEmailSent(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Different Email
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Link href="/sign-in">Back to Sign In</Link>
              </Button>
            </div>

            {/* Footer note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">This link will expire in 1 hour for security reasons</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container relative mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-900/20">
          {/* Header with logo */}
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <img src="/logo.png" alt="Top City Tickets Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Forgot Password?
            </h1>
            <p className="mt-2 text-gray-400">No worries! Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Button asChild variant="ghost" className="text-gray-400 hover:text-white">
                <Link href="/sign-in">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
