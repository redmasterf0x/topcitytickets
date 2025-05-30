"use client"

import { useState, useEffect } from "react"
import { Users, Calendar, FileText } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface AdminStatsData {
  totalUsers: number
  totalEvents: number
  pendingApplications: number
  pendingEvents: number
  // totalRevenue: number; // Placeholder for now
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true)
      try {
        const { count: totalUsers, error: usersError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })

        const { count: totalEvents, error: eventsError } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved")

        const { count: pendingApplications, error: appError } = await supabase
          .from("seller_applications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        const { count: pendingEvents, error: pendingEventsError } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")

        if (usersError || eventsError || appError || pendingEventsError) {
          console.error("Error fetching admin stats:", { usersError, eventsError, appError, pendingEventsError })
        }

        setStats({
          totalUsers: totalUsers || 0,
          totalEvents: totalEvents || 0,
          pendingApplications: pendingApplications || 0,
          pendingEvents: pendingEvents || 0,
          // totalRevenue: 0 // Placeholder
        })
      } catch (error) {
        console.error("Unexpected error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAdminStats()
  }, [])

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
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
    return <p className="text-gray-400">Could not load admin statistics.</p>
  }

  return (
    <>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          <p className="text-xs text-gray-400">Registered users on the platform</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Approved Events</CardTitle>
          <Calendar className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
          <p className="text-xs text-gray-400">Currently live events</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Seller Apps</CardTitle>
          <FileText className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.pendingApplications}</div>
          <p className="text-xs text-gray-400">Applications needing review</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
          <Calendar className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.pendingEvents}</div>
          <p className="text-xs text-gray-400">Event requests needing approval</p>
        </CardContent>
      </Card>
      {/* Revenue card can be added later when Stripe is integrated */}
      {/*
  <Card className="border-gray-800 bg-gray-900/50">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
      <DollarSign className="h-4 w-4 text-green-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
      <p className="text-xs text-gray-400">Stripe integration coming soon</p>
    </CardContent>
  </Card>
  */}
    </>
  )
}
