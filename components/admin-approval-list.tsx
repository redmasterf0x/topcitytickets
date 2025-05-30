"use client"

import { useState, useEffect } from "react"
import { Calendar, Check, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface SellerApplication {
  id: string
  user_id: string
  business_name: string
  business_type: string
  website: string | null
  experience: string
  event_types: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  user: {
    email: string
    full_name: string
  }
}

interface EventRequest {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  price: number
  capacity: number
  category: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  organizer_id: string
  organizer: {
    email: string
    full_name: string
  }
}

export function AdminApprovalList() {
  const [sellerApplications, setSellerApplications] = useState<SellerApplication[]>([])
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true) // Ensure loading is true at the start
    try {
      console.log("Fetching admin approval data...")

      // Fetch PENDING seller applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("seller_applications")
        .select(`
          *,
          user:users(email, full_name)
        `)
        .eq("status", "pending") // Fetch only pending
        .order("created_at", { ascending: false })

      if (applicationsError) {
        console.error("Error fetching PENDING applications:", applicationsError)
      } else {
        console.log("PENDING Seller applications fetched:", applicationsData)
        setSellerApplications(applicationsData || [])
      }

      // Fetch PENDING event requests
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          organizer:users!organizer_id(email, full_name)
        `)
        .eq("status", "pending") // Fetch only pending
        .order("created_at", { ascending: false })

      if (eventsError) {
        console.error("Error fetching PENDING events:", eventsError)
      } else {
        console.log("PENDING Event requests fetched:", eventsData)
        setEventRequests(eventsData || [])
      }
    } catch (error) {
      console.error("Error in fetchData (AdminApprovalList):", error)
    } finally {
      setLoading(false)
    }
  }

  const approveSeller = async (id: string, userId: string) => {
    try {
      console.log("Approving seller application:", id, "for user:", userId)

      // Update application status
      const { error: appError } = await supabase.from("seller_applications").update({ status: "approved" }).eq("id", id)

      if (appError) {
        console.error("Error approving application:", appError)
        return
      }

      // Update user role and seller status
      const { error: userError } = await supabase
        .from("users")
        .update({ role: "seller", seller_status: "approved" })
        .eq("id", userId)

      if (userError) {
        console.error("Error updating user:", userError)
        return
      }

      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const rejectSeller = async (id: string, userId: string) => {
    try {
      console.log("Rejecting seller application:", id, "for user:", userId)

      // Update application status
      const { error: appError } = await supabase.from("seller_applications").update({ status: "rejected" }).eq("id", id)

      if (appError) {
        console.error("Error rejecting application:", appError)
        return
      }

      // Update user seller status
      const { error: userError } = await supabase.from("users").update({ seller_status: "rejected" }).eq("id", userId)

      if (userError) {
        console.error("Error updating user:", userError)
        return
      }

      // Refresh data
      fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const approveEvent = async (id: string) => {
    try {
      console.log("Approving event:", id)

      const { error } = await supabase.from("events").update({ status: "approved" }).eq("id", id)

      if (error) {
        console.error("Error approving event:", error)
        return
      }

      fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const rejectEvent = async (id: string) => {
    try {
      console.log("Rejecting event:", id)

      const { error } = await supabase.from("events").update({ status: "rejected" }).eq("id", id)

      if (error) {
        console.error("Error rejecting event:", error)
        return
      }

      fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  // No need to filter again here, as fetchData already gets pending items
  // const pendingApplications = sellerApplications;
  // const pendingEvents = eventRequests;

  return (
    <Tabs defaultValue="sellers" className="space-y-6">
      <TabsList className="bg-gray-800">
        <TabsTrigger value="sellers" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
          Seller Applications ({sellerApplications.length}) {/* Direct length from fetched pending */}
        </TabsTrigger>
        <TabsTrigger value="events" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
          Event Requests ({eventRequests.length}) {/* Direct length from fetched pending */}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sellers" className="space-y-4">
        {sellerApplications.length === 0 ? (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Pending Applications</h3>
              <p className="text-gray-400 text-center">All seller applications have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          sellerApplications.map((application) => (
            // ... Card rendering for seller application (ensure application.user is safely accessed)
            <Card key={application.id} className="border-gray-800 bg-gray-900/50">
              <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-900/30 text-purple-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {application.user?.full_name || application.user?.email || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-400">{application.user?.email || "No email"}</p>
                      <p className="text-sm text-gray-400">
                        {application.business_name} • {application.business_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Applied on {new Date(application.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveSeller(application.id, application.user_id)}
                    >
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                      onClick={() => rejectSeller(application.id, application.user_id)}
                    >
                      <X className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-white mb-2">Experience</h4>
                    <p className="text-sm text-gray-300">{application.experience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Event Types</h4>
                    <p className="text-sm text-gray-300">{application.event_types}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="events" className="space-y-4">
        {eventRequests.length === 0 ? (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Pending Events</h3>
              <p className="text-gray-400 text-center">All event requests have been reviewed.</p>
            </CardContent>
          </Card>
        ) : (
          eventRequests.map((event) => (
            // ... Card rendering for event request (ensure event.organizer is safely accessed)
            <Card key={event.id} className="border-gray-800 bg-gray-900/50">
              <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-900/30 text-purple-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{event.title}</h3>
                      <p className="text-sm text-gray-400">
                        by {event.organizer?.full_name || event.organizer?.email || "N/A"} • {event.category}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>
                      ${event.price} • {event.capacity} capacity
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveEvent(event.id)}
                    >
                      <Check className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                      onClick={() => rejectEvent(event.id)}
                    >
                      <X className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium text-white mb-2">Description</h4>
                  <p className="text-sm text-gray-300">{event.description}</p>
                  <p className="text-sm text-gray-400 mt-2">Location: {event.location}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
