"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true) // Set loading true at the start of session check
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session on initial load:", error.message)
          // An error here suggests the stored session is problematic (e.g., invalid token).
          // Attempt to sign out to clear it. This will trigger onAuthStateChange.
          await supabase.auth.signOut()
          // Explicitly clear state here as a fallback in case onAuthStateChange doesn't immediately fire
          // or if signOut itself had an issue (though unlikely to throw here).
          setUser(null)
          setProfile(null)
          setLoading(false) // Ensure loading is false after handling error
          return
        }

        if (session?.user) {
          // Session is valid, set user and fetch profile
          setUser(session.user)
          // fetchProfile will set loading to false in its finally block
          await fetchProfile(session.user.id)
        } else {
          // No session, user is not logged in
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (e) {
        console.error("Unexpected error in getInitialSession:", e)
        // Fallback in case of other errors during initial session check
        try {
          await supabase.auth.signOut() // Attempt to clear any session
        } catch (signOutError) {
          console.error("Error during emergency signOut in getInitialSession catch:", signOutError)
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
      setLoading(true) // Indicate loading state while processing auth change

      if (session?.user) {
        // This covers SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED if they result in a valid user session.
        // It also handles the case where getInitialSession found a valid session.
        setUser(session.user)
        await fetchProfile(session.user.id) // fetchProfile will set loading to false
      } else {
        // This covers SIGNED_OUT or any event/situation resulting in no session user (e.g., token revoked).
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Keep the dependency array empty as this effect should run once on mount

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)

      // First, check if profile exists
      const { data, error, count } = await supabase.from("users").select("*", { count: "exact" }).eq("id", userId)

      console.log("Profile query result:", { data, error, count })

      if (error) {
        console.error("Error fetching profile:", error)

        // If no profile exists, create one
        if (error.code === "PGRST116" || count === 0) {
          console.log("No profile found, creating one...")
          await createUserProfile(userId)
          return
        }
      } else if (data && data.length > 0) {
        // If we have data, use the first record
        setProfile(data[0])
      } else if (count === 0) {
        // No profile exists, create one
        console.log("No profile found (count=0), creating one...")
        await createUserProfile(userId)
        return
      }
    } catch (error) {
      console.error("Error in fetchProfile:", error)
    } finally {
      console.log("fetchProfile: Setting loading to false for user:", userId)
      setLoading(false)
    }
  }

  const createUserProfile = async (userId: string) => {
    try {
      console.log("Creating profile for user:", userId)

      const { data: userData } = await supabase.auth.getUser()
      const userEmail = userData.user?.email || ""
      const userFullName = userData.user?.user_metadata?.full_name || ""

      const { data, error } = await supabase
        .from("users")
        .insert({
          id: userId,
          email: userEmail,
          full_name: userFullName,
          role: "user",
          seller_status: "none",
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating profile:", error)
      } else {
        console.log("Profile created successfully:", data)
        setProfile(data)
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Error in signIn:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Get the current origin dynamically
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://v0-dark-themed-ticket-app.vercel.app"
      const redirectTo = `${origin}/auth/callback`

      console.log("Sign up with redirect URL:", redirectTo)

      if (DEVELOPMENT_MODE) {
        // Development: Skip email confirmation
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
        // Production: Use email confirmation with dynamic URL
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
