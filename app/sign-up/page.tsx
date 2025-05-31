"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, User, CheckCircle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"

// Production mode flag - set to false for production
const DEVELOPMENT_MODE = false

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      options: {
        // Supabase requires options for additional data
        data: {
          full_name: formData.fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (DEVELOPMENT_MODE) {
        // Development: Go directly to dashboard
        router.push("/dashboard")
      } else {
        // Production: Show email confirmation
        setEmailSent(true)
        setLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (emailSent && !DEVELOPMENT_MODE) {
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
              <p className="mt-3 text-gray-300">We've sent a confirmation link to</p>
              <p className="mt-1 text-lg font-semibold text-white break-all">{formData.email}</p>
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
                    <span>Click the confirmation link in the email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold">
                      3
                    </span>
                    <span>You'll be automatically redirected to your dashboard</span>
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
                <Link href="/sign-in">Already have an account? Sign In</Link>
              </Button>
            </div>

            {/* Footer note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">This link will expire in 24 hours for security reasons</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-800 bg-gray-900/50 p-8 shadow-lg shadow-purple-900/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create an Account</h1>
          <p className="mt-2 text-gray-400">
            Join Top City Tickets today
            {DEVELOPMENT_MODE && <span className="block text-xs text-yellow-400 mt-1">(Development Mode)</span>}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="border-gray-700 bg-gray-800 pl-10 pr-10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the{" "}
                <Link href="#" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <Separator className="my-4 bg-gray-700" />

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
