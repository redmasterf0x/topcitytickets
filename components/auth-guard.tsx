"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: ("user" | "seller" | "admin")[]
}

export function AuthGuard({ children, requireAuth = true, allowedRoles }: AuthGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        console.log("AuthGuard: No user found, redirecting to sign-in")
        router.push("/sign-in")
        return
      }

      if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        console.log("AuthGuard: User role not allowed, redirecting to dashboard")
        router.push("/dashboard")
        return
      }
    }
  }, [user, profile, loading, requireAuth, allowedRoles, router])

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is required but no user, don't render children (redirect will happen)
  if (requireAuth && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-gray-400">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // If role is required but user doesn't have it, don't render children
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
