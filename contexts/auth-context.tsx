"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type {
  User,
  AuthError,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase" // Your Supabase client
import type { Database } from "@/lib/supabase" // Your Database types

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialLoading: boolean // To track initial session/profile load
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>
  signUp: (
    credentials: SignUpWithPasswordCredentials & { data: { full_name: string } },
  ) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void> // Allow manual profile refresh
  updateUserProfileInContext: (updatedProfile: Partial<UserProfile>) => void // For optimistic updates or after direct DB changes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false) // For specific actions like sign-in/out
  const [initialLoading, setInitialLoading] = useState(true) // For initial auth check and profile load

  const fetchUserProfile = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", currentUser.id).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          setProfile(null)
        } else {
          setProfile(data as UserProfile)
        }
      } catch (e) {
        console.error("Exception fetching user profile:", e)
        setProfile(null)
      }
    } else {
      setProfile(null) // No user, no profile
    }
  }, [])

  useEffect(() => {
    setInitialLoading(true)
    const getSessionAndProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) {
        console.error("Error getting initial session:", sessionError)
      }
      setUser(session?.user ?? null)
      await fetchUserProfile(session?.user ?? null)
      setInitialLoading(false)
    }
    getSessionAndProfile()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true) // General loading for auth state change
      setUser(session?.user ?? null)
      await fetchUserProfile(session?.user ?? null)
      setLoading(false)
      if (event !== "INITIAL_SESSION") {
        // INITIAL_SESSION is handled above
        setInitialLoading(false)
      }
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(credentials)
    // Profile will be fetched by onAuthStateChange
    setLoading(false)
    return { error }
  }

  const signUp = async (credentials: SignUpWithPasswordCredentials & { data: { full_name: string } }) => {
    setLoading(true)
    // Supabase handles inserting into auth.users.
    // The public.users table is populated by a trigger (handle_new_user).
    const { error } = await supabase.auth.signUp(credentials)
    // Profile will be fetched by onAuthStateChange after email confirmation and first sign-in
    setLoading(false)
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    // User and profile will be set to null by onAuthStateChange
    setLoading(false)
  }

  const refreshProfileManually = async () => {
    if (user) {
      setLoading(true)
      await fetchUserProfile(user)
      setLoading(false)
    }
  }

  const updateUserProfileInContext = (updatedProfile: Partial<UserProfile>) => {
    setProfile((prevProfile) => (prevProfile ? { ...prevProfile, ...updatedProfile } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        initialLoading,
        signIn,
        signUp,
        signOut,
        fetchProfile: refreshProfileManually,
        updateUserProfileInContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
