"use client"

import { useState, useEffect } from "react"
import { CreditCard, ShoppingBag, Ticket } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface UserStatsData {
  ticketsPurchased: number
  upcomingEventsCount: number
  totalSpent: number
}

export function UserStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { count: ticketsPurchased, error: ticketsError } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        const { data: upcomingTicketsData, error: upcomingError } = await supabase
          .from("tickets")
          .select("event:events(date)")
          .eq("user_id", user.id)

        let upcomingEventsCount = 0
        if (upcomingTicketsData) {
          const today = new Date().toISOString().split("T")[0]
          upcomingEventsCount = upcomingTicketsData.filter(
            (ticket) => ticket.event && new Date(ticket.event.date) >= new Date(today),
          ).length
        }

        const { data: spentData, error: spentError } = await supabase
          .from("tickets")
          .select("total_price")
          .eq("user_id", user.id)

        const totalSpent = spentData?.reduce((sum, item) => sum + item.total_price, 0) || 0

        if (ticketsError || upcomingError || spentError) {
          console.error("Error fetching user stats:", { ticketsError, upcomingError, spentError })
        }

        setStats({
          ticketsPurchased: ticketsPurchased || 0,
          upcomingEventsCount: upcomingEventsCount || 0,
          totalSpent: totalSpent,
        })
      } catch (error) {
        console.error("Unexpected error fetching user stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserStats()
  }, [user])

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-gray-800 bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
              <div className="h-4 w-4 animate-pulse rounded bg-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 animate-pulse rounded bg-gray-600" />
              <div className="mt-1 h-3 w-32 animate-pulse rounded bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  if (!stats) {
    return <p className="text-gray-400 col-span-3 text-center">Could not load user statistics.</p>
  }

  return (
    <>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tickets Purchased</CardTitle>
          <Ticket className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.ticketsPurchased}</div>
          <p className="text-xs text-gray-400">Total tickets bought</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <ShoppingBag className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.upcomingEventsCount}</div>
          <p className="text-xs text-gray-400">Events you have tickets for</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <CreditCard className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</div>
          <p className="text-xs text-gray-400">On tickets and services</p>
        </CardContent>
      </Card>
    </>
  )
}
