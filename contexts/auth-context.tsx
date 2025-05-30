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
    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          // If there's an auth error, clear any invalid session
          if (error.message?.includes("refresh_token_not_found")) {
            await supabase.auth.signOut()
          }
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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
      // Always use production URL for email confirmation
      const redirectTo = "https://v0-dark-themed-ticket-app.vercel.app/auth/callback"

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
        // Production: Use email confirmation with correct URL
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
