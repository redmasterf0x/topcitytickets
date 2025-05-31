"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: Array<"user" | "seller" | "admin">
}

export function AuthGuard({ children, requireAuth = true, allowedRoles }: AuthGuardProps) {
  const { user, profile, initialLoading } = useAuth() // Use initialLoading
  const router = useRouter()

  useEffect(() => {
    if (initialLoading) {
      return // Wait for auth state and profile to be loaded
    }

    if (requireAuth && !user) {
      router.push("/sign-in")
      return
    }

    if (user && allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        // User is authenticated but doesn't have the required role
        // Redirect to a general access page like dashboard or home,
        // or a specific "access denied" page.
        router.push("/dashboard") // Or "/" or "/access-denied"
      }
    }
  }, [user, profile, initialLoading, requireAuth, allowedRoles, router])

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    // This case should ideally be caught by useEffect redirect,
    // but as a fallback, don't render children.
    return null
  }

  if (user && allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Also as a fallback, don't render children if role not allowed.
    // The redirect in useEffect should handle navigation.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-xl mb-4">Access Denied</p>
        <p className="text-gray-400 mb-4">You do not have permission to view this page.</p>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  return <>{children}</>
}
