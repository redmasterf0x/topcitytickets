"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, X, Calendar, Clock, MapPin, Tag, DollarSign, UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type EventRow = Database["public"]["Tables"]["events"]["Row"]
type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface EventRequest extends EventRow {
  organizer: Pick<UserProfile, "id" | "full_name" | "email"> | null
}

export default function AdminEventRequestsPage() {
  const { user: adminUser } = useAuth() // Renamed to adminUser to avoid conflict
  const [requests, setRequests] = useState<EventRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending")

  useEffect(() => {
    if (adminUser) {
      fetchEventRequests(activeTab)
    }
  }, [adminUser, activeTab])

  const fetchEventRequests = async (status: "pending" | "approved" | "rejected") => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          organizer:users!organizer_id (id, full_name, email)
        `)
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) {
        console.error(`Error fetching ${status} event requests:`, error)
        setRequests([])
      } else {
        setRequests((data as EventRequest[]) || [])
      }
    } catch (err) {
      console.error("Error in fetchEventRequests:", err)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleEventAction = async (eventId: string, action: "approved" | "rejected") => {
    if (!adminUser) {
      console.error("Admin user not found for event action.")
      return
    }
    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: action,
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", eventId)

      if (error) {
        console.error(`Error ${action === "approved" ? "approving" : "rejecting"} event:`, error)
        // TODO: Show error toast to admin
      } else {
        // TODO: Show success toast to admin
        fetchEventRequests(activeTab) // Refresh the current list
      }
    } catch (err) {
      console.error("Error in handleEventAction:", err)
      // TODO: Show error toast to admin
    }
  }

  const currentRequests = requests // Filtered by activeTab in fetchEventRequests

  if (loading && requests.length === 0) {
    // Show loader only if no data yet for the tab
    return (
      <AuthGuard requireAuth={true} allowedRoles={["admin"]}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Event Requests</h1>
          <p className="text-gray-400">Review and manage event creation requests from sellers.</p>
        </div>

        <Tabs
          defaultValue="pending"
          onValueChange={(value) => setActiveTab(value as "pending" | "approved" | "rejected")}
          className="space-y-6"
        >
          <TabsList className="bg-gray-800">
            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Pending Review
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Approved Events
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Rejected Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading && <div className="text-center text-gray-400 py-4">Loading requests...</div>}
            {!loading && currentRequests.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No {activeTab} Event Requests</h3>
                  <p className="text-gray-400 text-center">There are currently no event requests with this status.</p>
                </CardContent>
              </Card>
            ) : (
              currentRequests.map((request) => (
                <EventRequestCard
                  key={request.id}
                  eventRequest={request}
                  onAction={handleEventAction}
                  showActions={activeTab === "pending"}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}

function EventRequestCard({
  eventRequest,
  onAction,
  showActions,
}: {
  eventRequest: EventRequest
  onAction: (id: string, action: "approved" | "rejected") => void
  showActions: boolean
}) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "N/A"
    // Assuming timeString is in "HH:mm" or "HH:mm:ss" format
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-white">{eventRequest.title}</CardTitle>
            <CardDescription className="text-gray-400">
              Requested by: {eventRequest.organizer?.full_name || eventRequest.organizer?.email || "Unknown Organizer"}
            </CardDescription>
          </div>
          <Badge
            className={
              eventRequest.status === "approved"
                ? "bg-green-600"
                : eventRequest.status === "rejected"
                  ? "bg-red-600"
                  : "bg-yellow-600"
            }
          >
            {eventRequest.status.charAt(0).toUpperCase() + eventRequest.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventRequest.image_url && (
          <div className="aspect-video w-full max-w-sm overflow-hidden rounded-md border border-gray-700">
            <img
              src={eventRequest.image_url || "/placeholder.svg"}
              alt={eventRequest.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <p className="text-gray-300">{eventRequest.description || "No description provided."}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <InfoItem
            icon={<Calendar className="h-4 w-4 text-purple-400" />}
            label="Date"
            value={formatDate(eventRequest.date)}
          />
          <InfoItem
            icon={<Clock className="h-4 w-4 text-purple-400" />}
            label="Time"
            value={formatTime(eventRequest.time)}
          />
          <InfoItem
            icon={<MapPin className="h-4 w-4 text-purple-400" />}
            label="Location"
            value={eventRequest.location}
          />
          <InfoItem icon={<Tag className="h-4 w-4 text-purple-400" />} label="Category" value={eventRequest.category} />
          <InfoItem
            icon={<DollarSign className="h-4 w-4 text-purple-400" />}
            label="Price"
            value={`$${eventRequest.price}`}
          />
          <InfoItem
            icon={<UsersIcon className="h-4 w-4 text-purple-400" />}
            label="Capacity"
            value={`${eventRequest.capacity} attendees`}
          />
        </div>
        <p className="text-xs text-gray-500 pt-2 border-t border-gray-800">
          Submitted on: {formatDate(eventRequest.created_at)}
        </p>
        {eventRequest.reviewed_at && (
          <p className="text-xs text-gray-500">
            Reviewed on: {formatDate(eventRequest.reviewed_at)} by admin ID: {eventRequest.reviewed_by || "N/A"}
          </p>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="flex gap-2 border-t border-gray-800 pt-4">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onAction(eventRequest.id, "approved")}
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-700 text-red-400 hover:bg-red-900/20"
            onClick={() => onAction(eventRequest.id, "rejected")}
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium text-gray-400">{label}:</span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}
