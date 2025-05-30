"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Edit, Eye, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  price: number
  capacity: number
  category: string
  image_url: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

interface EventStats {
  totalTicketsSold: number
  totalRevenue: number
}

export default function SellerEventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [eventStats, setEventStats] = useState<Record<string, EventStats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSellerEvents()
    }
  }, [user])

  const fetchSellerEvents = async () => {
    try {
      // Fetch events created by this seller
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user?.id)
        .order("created_at", { ascending: false })

      if (eventsError) {
        console.error("Error fetching events:", eventsError)
        return
      }

      setEvents(eventsData || [])

      // Fetch ticket sales stats for each event
      if (eventsData && eventsData.length > 0) {
        const statsPromises = eventsData.map(async (event) => {
          const { data: ticketsData, error: ticketsError } = await supabase
            .from("tickets")
            .select("quantity, total_price")
            .eq("event_id", event.id)

          if (ticketsError) {
            console.error("Error fetching tickets for event:", event.id, ticketsError)
            return { eventId: event.id, stats: { totalTicketsSold: 0, totalRevenue: 0 } }
          }

          const totalTicketsSold = ticketsData?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0
          const totalRevenue = ticketsData?.reduce((sum, ticket) => sum + ticket.total_price, 0) || 0

          return {
            eventId: event.id,
            stats: { totalTicketsSold, totalRevenue },
          }
        })

        const statsResults = await Promise.all(statsPromises)
        const statsMap = statsResults.reduce(
          (acc, { eventId, stats }) => {
            acc[eventId] = stats
            return acc
          },
          {} as Record<string, EventStats>,
        )

        setEventStats(statsMap)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const pendingEvents = events.filter((event) => event.status === "pending")
  const approvedEvents = events.filter((event) => event.status === "approved")
  const rejectedEvents = events.filter((event) => event.status === "rejected")

  if (loading) {
    return (
      <AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Events</h1>
            <p className="text-gray-400">Manage your events and track performance</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Event
          </Button>
        </div>

        <Tabs defaultValue="approved" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="approved" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Live Events ({approvedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Pending Approval ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Rejected ({rejectedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="space-y-6">
            {approvedEvents.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Live Events</h3>
                  <p className="text-gray-400 text-center mb-4">You don't have any approved events yet.</p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {approvedEvents.map((event) => (
                  <EventCard key={event.id} event={event} stats={eventStats[event.id]} showActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {pendingEvents.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Pending Events</h3>
                  <p className="text-gray-400 text-center">All your events have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingEvents.map((event) => (
                  <EventCard key={event.id} event={event} stats={eventStats[event.id]} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            {rejectedEvents.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-2">No Rejected Events</h3>
                  <p className="text-gray-400 text-center">Great! None of your events have been rejected.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rejectedEvents.map((event) => (
                  <EventCard key={event.id} event={event} stats={eventStats[event.id]} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}

function EventCard({
  event,
  stats,
  showActions,
}: {
  event: Event
  stats?: EventStats
  showActions: boolean
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-600"
      case "pending":
        return "bg-yellow-600"
      case "rejected":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={event.image_url || "/placeholder.svg?height=200&width=400"}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(event.status)}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="border-gray-600 bg-black/50 text-white">
            {event.category}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-white">{event.title}</CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{formatDate(event.date)}</span>
          <span>${event.price}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {stats && event.status === "approved" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalTicketsSold}</div>
              <div className="text-xs text-gray-400">Tickets Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">${stats.totalRevenue}</div>
              <div className="text-xs text-gray-400">Revenue</div>
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
