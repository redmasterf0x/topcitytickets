"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Production mode - set to false for production
const DEVELOPMENT_MODE = false

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const STORAGE_KEY = "auth_last_activity"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Update last activity timestamp
  const updateLastActivity = () => {
    const now = Date.now()
    lastActivityRef.current = now
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, now.toString())
    }
  }

  // Check if session has expired due to inactivity
  const isSessionExpired = () => {
    if (typeof window === "undefined") return false

    const lastActivity = localStorage.getItem(STORAGE_KEY)
    if (!lastActivity) return false

    const timeSinceLastActivity = Date.now() - Number.parseInt(lastActivity)
    return timeSinceLastActivity > SESSION_TIMEOUT
  }

  // Clear session due to timeout
  const handleSessionTimeout = async () => {
    console.log("Session expired due to inactivity, signing out...")
    await signOut()
  }

  // Set up activity listeners
  useEffect(() => {
    if (typeof window === "undefined") return

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const resetTimeout = () => {
      updateLastActivity()

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout only if user is logged in
      if (user) {
        timeoutRef.current = setTimeout(handleSessionTimeout, SESSION_TIMEOUT)
      }
    }

    // Add event listeners for user activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true)
    })

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab became visible, check if session expired
        if (user && isSessionExpired()) {
          handleSessionTimeout()
        } else if (user) {
          // Reset timeout if still valid
          resetTimeout()
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Initial setup if user exists
    if (user) {
      resetTimeout()
    }

    return () => {
      // Cleanup
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true)
      })
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true)

      try {
        // Check if session expired before attempting to get session
        if (isSessionExpired()) {
          console.log("Session expired, clearing auth state")
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session on initial load:", error.message)
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          updateLastActivity() // Update activity on successful session load
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (e) {
        console.error("Unexpected error in getInitialSession:", e)
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error("Error during emergency signOut:", signOutError)
        }
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change event:", event, "Session user:", session?.user?.email)

      // Don't set loading for SIGNED_OUT events to avoid infinite loading
      if (event !== "SIGNED_OUT") {
        setLoading(true)
      }

      if (session?.user) {
        setUser(session.user)
        updateLastActivity()
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        // Clear activity tracking when signed out
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY)
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)

      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
      } else if (data) {
        setProfile(data)
      } else {
        console.warn("Profile not found for user:", userId)
        setProfile(null)
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error)
    } finally {
      console.log("fetchProfile: Setting loading to false for user:", userId)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error) {
        updateLastActivity()
      }

      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://v0-dark-themed-ticket-app.vercel.app"
      const redirectTo = `${origin}/auth/callback`

      console.log("Sign up with redirect URL:", redirectTo)

      if (DEVELOPMENT_MODE) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        return { error }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: redirectTo,
          },
        })
        return { error }
      }
    } catch (error) {
      console.error("Error in signUp:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      // Clear timeout and activity tracking immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY)
      }

      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error in signOut:", error)
      // Even if signOut fails, clear local state
      setUser(null)
      setProfile(null)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("No user logged in") }

    try {
      const { error } = await supabase.from("users").update(updates).eq("id", user.id)

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : null))
        updateLastActivity() // Update activity on profile changes
      }

      return { error }
    } catch (error) {
      console.error("Error in updateProfile:", error)
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
