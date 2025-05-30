import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Anon Key exists:", !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "user" | "seller" | "admin"
          seller_status: "none" | "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "user" | "seller" | "admin"
          seller_status?: "none" | "pending" | "approved" | "rejected"
        }
        Update: {
          full_name?: string | null
          role?: "user" | "seller" | "admin"
          seller_status?: "none" | "pending" | "approved" | "rejected"
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          time: string
          location: string
          price: number
          capacity: number
          category: string
          image_url: string | null
          organizer_id: string | null
          status: "pending" | "approved" | "rejected"
          created_at: string
        }
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          user_id: string
          quantity: number
          total_price: number
          purchase_date: string
        }
      }
      seller_applications: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_type: string
          website: string | null
          experience: string
          event_types: string
          status: "pending" | "approved" | "rejected"
          created_at: string
        }
      }
    }
  }
}
