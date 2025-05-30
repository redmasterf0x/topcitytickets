"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Clock, Ticket, Download, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface TicketWithEvent {
  id: string
  quantity: number
  total_price: number
  purchase_date: string
  event: {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    category: string
    image_url: string
    status: string
  }
}

export default function TicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketWithEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserTickets()
    }
  }, [user])

  const fetchUserTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          event:events(*)
        `)
        .eq("user_id", user?.id)
        .order("purchase_date", { ascending: false })

      if (error) {
        console.error("Error fetching tickets:", error)
      } else {
        setTickets(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingTickets = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event.date)
    return eventDate >= new Date()
  })

  const pastTickets = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event.date)
    return eventDate < new Date()
  })

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">My Tickets</h1>
          <p className="text-gray-400">Manage your event tickets and downloads</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Upcoming Events ({upcomingTickets.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Past Events ({pastTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingTickets.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Ticket className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
                  <p className="text-gray-400 text-center mb-4">You don't have any tickets for upcoming events yet.</p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <a href="/events">Browse Events</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} isUpcoming={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastTickets.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Past Events</h3>
                  <p className="text-gray-400 text-center">Your past event tickets will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} isUpcoming={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}

function TicketCard({ ticket, isUpcoming }: { ticket: TicketWithEvent; isUpcoming: boolean }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={ticket.event.image_url || "/placeholder.svg?height=200&width=400"}
          alt={ticket.event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={isUpcoming ? "default" : "secondary"} className="bg-purple-600">
            {ticket.quantity} {ticket.quantity === 1 ? "Ticket" : "Tickets"}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="border-gray-600 bg-black/50 text-white">
            {ticket.event.category}
          </Badge>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-white">{ticket.event.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-gray-400">
            <Calendar className="mr-2 h-4 w-4 text-purple-400" />
            <span>{formatDate(ticket.event.date)}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Clock className="mr-2 h-4 w-4 text-purple-400" />
            <span>{formatTime(ticket.event.time)}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <MapPin className="mr-2 h-4 w-4 text-purple-400" />
            <span>{ticket.event.location}</span>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Total Paid</span>
            <span className="text-white font-semibold">${ticket.total_price}</span>
          </div>

          <div className="flex gap-2">
            {isUpcoming && (
              <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                <QrCode className="mr-2 h-4 w-4" />
                Show QR
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
