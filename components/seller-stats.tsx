"use client"

import { useState, useEffect } from "react"
import { DollarSign, ShoppingBag, Ticket } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface SellerStatsData {
  activeEvents: number
  pendingEvents: number
  totalTicketsSold: number
  totalRevenue: number
}

export function SellerStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<SellerStatsData>({
    activeEvents: 0,
    pendingEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSellerStats()
    }
  }, [user])

  const fetchSellerStats = async () => {
    try {
      // Fetch events created by this seller
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, status")
        .eq("organizer_id", user?.id)

      if (eventsError) {
        console.error("Error fetching events:", eventsError)
        return
      }

      const activeEvents = eventsData?.filter((event) => event.status === "approved").length || 0
      const pendingEvents = eventsData?.filter((event) => event.status === "pending").length || 0

      // Fetch ticket sales for all seller's events
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map((event) => event.id)

        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select("quantity, total_price")
          .in("event_id", eventIds)

        if (ticketsError) {
          console.error("Error fetching tickets:", ticketsError)
        } else {
          const totalTicketsSold = ticketsData?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0
          const totalRevenue = ticketsData?.reduce((sum, ticket) => sum + ticket.total_price, 0) || 0

          setStats({
            activeEvents,
            pendingEvents,
            totalTicketsSold,
            totalRevenue,
          })
        }
      } else {
        setStats({
          activeEvents,
          pendingEvents,
          totalTicketsSold: 0,
          totalRevenue: 0,
        })
      }
    } catch (error) {
      console.error("Error fetching seller stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-gray-800 bg-gray-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 animate-pulse bg-gray-600 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse bg-gray-600 rounded mb-1" />
              <div className="h-3 w-24 animate-pulse bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          <ShoppingBag className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.activeEvents}</div>
          <p className="text-xs text-gray-400">
            {stats.pendingEvents > 0 ? `${stats.pendingEvents} pending approval` : "All events approved"}
          </p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
          <Ticket className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalTicketsSold}</div>
          <p className="text-xs text-gray-400">
            {stats.totalTicketsSold === 0 ? "No tickets sold yet" : "Across all events"}
          </p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-400">{stats.totalRevenue === 0 ? "No revenue yet" : "After platform fees"}</p>
        </CardContent>
      </Card>
    </>
  )
}
