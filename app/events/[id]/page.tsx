"use client" // Add this if not present

import { useState, useEffect } from "react" // Added
import Link from "next/link"
import { Calendar, MapPin, Share, Star, Ticket, Users, AlertCircle } from "lucide-react" // Added AlertCircle

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase" // Added

// Define an interface for the event data
interface EventData {
  id: string
  title: string
  description: string
  long_description?: string // Assuming this might be in your DB or you'll use description
  date: string
  time: string
  location: string
  address?: string // Assuming this might be in your DB
  organizer_id: string | null
  image_url: string | null
  price: number
  category: string
  tags?: string[] // Assuming this might be in your DB or derived
  lineup?: string[] // Assuming this might be in your DB or derived
  organizer?: { full_name?: string | null; email?: string | null } | null // For joined data
}

// Mock ticket types (can be replaced with DB data if available)
const mockTicketTypes = [
  { name: "General Admission", price: "$75", available: true },
  { name: "VIP Pass", price: "$150", available: true },
  { name: "Weekend Pass", price: "$120", available: true },
  { name: "Backstage Experience", price: "$250", available: false },
]

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: dbError } = await supabase
          .from("events")
          .select(`
            *,
            organizer:users!organizer_id (full_name, email)
          `)
          .eq("id", params.id)
          .eq("status", "approved") // Only show approved events
          .single()

        if (dbError) {
          console.error("Error fetching event:", dbError)
          setError("Failed to load event details. It might not exist or is not available.")
          setEvent(null)
        } else {
          setEvent(data as EventData)
        }
      } catch (err) {
        console.error("Unexpected error fetching event:", err)
        setError("An unexpected error occurred.")
        setEvent(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center min-h-[calc(100vh-10rem)] flex flex-col justify-center items-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
        <p className="text-gray-400 mb-6">
          {error || "The event you are looking for does not exist or is no longer available."}
        </p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/events">Browse Other Events</Link>
        </Button>
      </div>
    )
  }

  // Use event data, with fallbacks for potentially missing fields
  const displayTags = event.tags || (event.category ? [event.category] : ["Event"])
  const displayLineup = event.lineup || ["Lineup details coming soon."]
  const displayLongDescription = event.long_description || event.description
  const displayOrganizerName = event.organizer?.full_name || event.organizer?.email || "Top City Tickets"

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Event Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/events" className="text-sm text-purple-400 hover:text-purple-300">
              Events
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-sm text-gray-400">{event.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">{event.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-purple-900/30 px-3 py-1 text-sm font-medium text-purple-400">
              {event.category}
            </span>
            {/* Placeholder for reviews, as it's not in the DB schema */}
            <div className="flex items-center text-yellow-400">
              <Star className="mr-1 h-4 w-4 fill-yellow-400" />
              <Star className="mr-1 h-4 w-4 fill-yellow-400" />
              <Star className="mr-1 h-4 w-4 fill-yellow-400" />
              <Star className="mr-1 h-4 w-4" />
              <Star className="mr-1 h-4 w-4" />
              <span className="ml-1 text-sm text-gray-400">(No reviews yet)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Share className="h-5 w-5" />
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Ticket className="mr-2 h-5 w-5" /> Get Tickets
          </Button>
        </div>
      </div>

      {/* Event Image */}
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <img
          src={event.image_url || "/placeholder.svg?height=600&width=1200&query=event+banner"}
          alt={event.title}
          className="h-[300px] w-full object-cover md:h-[400px]"
        />
      </div>

      {/* Event Details */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="details" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
                Details
              </TabsTrigger>
              <TabsTrigger value="lineup" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
                Lineup
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-300">
                  <p>{event.description}</p>
                  {event.long_description && event.long_description !== event.description && (
                    <p>{event.long_description}</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Event Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lineup" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Event Lineup</CardTitle>
                </CardHeader>
                <CardContent>
                  {displayLineup[0] === "Lineup details coming soon." ? (
                    <p className="text-gray-400">{displayLineup[0]}</p>
                  ) : (
                    <ul className="space-y-4">
                      {displayLineup.map((artist, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/30 text-purple-400">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{artist}</h3>
                            {/* <p className="text-sm text-gray-400">Performing on Day {Math.floor(index / 2) + 1}</p> */}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">No reviews yet for this event. Be the first to write one!</p>
                  {/* Placeholder for review submission form or list */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info Card */}
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Date & Time</h3>
                  <p className="text-gray-400">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-400">
                    {new Date(`1970-01-01T${event.time}`).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Location</h3>
                  <p className="text-gray-400">{event.location}</p>
                  {event.address && <p className="text-gray-400">{event.address}</p>}
                </div>
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Organizer</h3>
                  <p className="text-gray-400">{displayOrganizerName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Purchase Card */}
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle>Get Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ticket-type" className="block text-sm font-medium text-gray-300">
                  Ticket Type
                </label>
                <Select>
                  <SelectTrigger id="ticket-type" className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800 text-white">
                    {/* Using mockTicketTypes for now */}
                    {mockTicketTypes.map((ticket) => (
                      <SelectItem key={ticket.name} value={ticket.name} disabled={!ticket.available}>
                        {ticket.name} - {ticket.price} {!ticket.available && "(Sold Out)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
                  Quantity
                </label>
                <Select defaultValue="1">
                  <SelectTrigger id="quantity" className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800 text-white">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 rounded-lg bg-gray-800 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Ticket Price</span>
                  <span className="text-white">${event.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Service Fee</span>
                  <span className="text-white">${(event.price * 0.1).toFixed(2)}</span> {/* Example fee */}
                </div>
                <Separator className="my-2 bg-gray-700" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Total</span>
                  <span className="text-white">${(event.price * 1.1).toFixed(2)}</span> {/* Example total */}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Ticket className="mr-2 h-5 w-5" /> Purchase Tickets
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
