"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Calendar, PlusCircle, Ticket, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SellerApplicationForm } from "@/components/seller-application-form"
import { EventRequestForm } from "@/components/event-request-form"
import { AdminApprovalList } from "@/components/admin-approval-list"
import { UserStats } from "@/components/user-stats"
import { SellerStats } from "@/components/seller-stats"
import { AdminStats } from "@/components/admin-stats"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

interface RecentActivity {
  id: string
  type: "event_created" | "event_approved" | "ticket_sold" | "application_submitted"
  title: string
  description: string
  date: string
}

interface UpcomingEvent {
  id: string
  title: string
  date: string
  location: string
  status: string
}

export default function DashboardPage() {
  const { profile, user, loading: authLoading } = useAuth() // Added authLoading
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true) // Renamed to avoid conflict

  // Get user role from the actual profile data
  const userRole = profile?.role || "user"
  const sellerStatus = profile?.seller_status || "none"

  useEffect(() => {
    if (!authLoading && user && profile) {
      fetchDashboardData()
    } else if (!authLoading && (!user || !profile)) {
      // If auth is done loading and no user/profile, stop dashboard loading
      setDashboardLoading(false)
    }
  }, [authLoading, user, profile]) // Depend on authLoading

  const fetchDashboardData = async () => {
    setDashboardLoading(true) // Start dashboard loading
    try {
      await Promise.all([fetchRecentActivity(), fetchUpcomingEvents()])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setDashboardLoading(false) // End dashboard loading
    }
  }

  const fetchRecentActivity = async () => {
    if (!user || !profile) return
    const activities: RecentActivity[] = []

    try {
      if (profile.role === "user") {
        const { data: ticketsData, error: ticketsErr } = await supabase
          .from("tickets")
          .select(`
        id,
        purchase_date,
        event:events(title)
      `)
          .eq("user_id", user.id)
          .order("purchase_date", { ascending: false })
          .limit(3)
        if (ticketsErr) console.error("Error fetching user tickets for activity:", ticketsErr)
        else
          ticketsData?.forEach((ticket) => {
            activities.push({
              id: ticket.id,
              type: "ticket_sold",
              title: "Purchased Ticket",
              description: `${ticket.event?.title || "Event"} - ${new Date(ticket.purchase_date).toLocaleDateString()}`,
              date: ticket.purchase_date,
            })
          })

        if (profile.seller_status === "pending") {
          // Find the application to get its date
          const { data: appData, error: appErr } = await supabase
            .from("seller_applications")
            .select("created_at")
            .eq("user_id", user.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          activities.unshift({
            // Add to the beginning
            id: "seller-app-pending",
            type: "application_submitted",
            title: "Seller Application Submitted",
            description: "Your application is under review.",
            date: appData?.created_at || new Date().toISOString(),
          })
        }
      } else if (profile.role === "seller" || profile.role === "admin") {
        const { data: eventsData, error: eventsErr } = await supabase
          .from("events")
          .select("id, title, created_at, status")
          .eq("organizer_id", user.id) // For admin, this might need adjustment if they see all events
          .order("created_at", { ascending: false })
          .limit(3)
        if (eventsErr) console.error("Error fetching seller/admin events for activity:", eventsErr)
        else
          eventsData?.forEach((event) => {
            activities.push({
              id: event.id,
              type: event.status === "approved" ? "event_approved" : "event_created",
              title:
                event.status === "approved"
                  ? "Event Approved"
                  : event.status === "pending"
                    ? "Event Pending"
                    : "Event Created",
              description: `${event.title} - ${new Date(event.created_at).toLocaleDateString()}`,
              date: event.created_at,
            })
          })
      }
      setRecentActivity(activities.slice(0, 3))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    }
  }

  const fetchUpcomingEvents = async () => {
    if (!user || !profile) return
    try {
      if (profile.role === "user") {
        const { data: ticketsData, error: ticketsErr } = await supabase
          .from("tickets")
          .select(`
        event:events!inner(id, title, date, location, status)
      `)
          .eq("user_id", user.id)
        if (ticketsErr) console.error("Error fetching user upcoming events:", ticketsErr)

        const userEvents =
          ticketsData
            ?.map((ticket) => ticket.event)
            .filter((event) => event && new Date(event.date) >= new Date() && event.status === "approved")
            .slice(0, 3) || []
        setUpcomingEvents(userEvents as UpcomingEvent[])
      } else if (profile.role === "seller" || profile.role === "admin") {
        const { data: eventsData, error: eventsErr } = await supabase
          .from("events")
          .select("id, title, date, location, status")
          .eq("organizer_id", user.id) // Admin might want to see all upcoming events
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(3)
        if (eventsErr) console.error("Error fetching seller/admin upcoming events:", eventsErr)
        setUpcomingEvents(eventsData || [])
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error)
    }
  }

  // Show main loading spinner if auth or dashboard data is loading
  if (authLoading || dashboardLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <AuthGuard requireAuth={true}>
      {" "}
      {/* AuthGuard will handle redirect if not authenticated */}
      <div className="container mx-auto p-4 py-6 lg:p-8">
        <div className="mb-8 flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              {/* Consider a smaller logo for dashboard or none if navbar is prominent */}
              {/* <img src="/logo.png" alt="Top City Tickets Logo" className="h-16 w-auto" /> */}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {profile?.role === "admin"
                ? "Admin Dashboard"
                : profile?.role === "seller"
                  ? "Seller Dashboard"
                  : "My Dashboard"}
            </h1>
            <p className="text-gray-400">Welcome back, {profile?.full_name || user?.email}!</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Overview
            </TabsTrigger>

            {profile?.role === "user" && profile?.seller_status === "none" && (
              <TabsTrigger
                value="become-seller"
                className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
              >
                Become a Seller
              </TabsTrigger>
            )}

            {((profile?.role === "seller" && profile?.seller_status === "approved") || profile?.role === "admin") && (
              <TabsTrigger
                value="create-event"
                className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
              >
                Create Event
              </TabsTrigger>
            )}

            {profile?.role === "admin" && (
              <TabsTrigger
                value="approvals"
                className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
              >
                Approvals
              </TabsTrigger>
            )}

            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {profile?.role === "user" && profile.seller_status !== "none" && profile.seller_status !== "approved" && (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Seller Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        profile.seller_status === "approved"
                          ? "bg-green-500"
                          : profile.seller_status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-white">
                      {profile.seller_status === "pending"
                        ? "Your seller application is under review."
                        : profile.seller_status === "rejected"
                          ? "Your seller application was rejected. Please contact support for more information."
                          : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {profile?.role === "user" && <UserStats />}
              {profile?.role === "seller" && <SellerStats />}
              {profile?.role === "admin" && <AdminStats />}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {" "}
              {/* Adjusted grid for better layout */}
              <Card className="border-gray-800 bg-gray-900/50 lg:col-span-2">
                {" "}
                {/* Recent activity takes more space */}
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardLoading ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        <div className="h-8 w-8 animate-pulse bg-gray-600 rounded" />
                        <div className="flex-1">
                          <div className="h-4 w-32 animate-pulse bg-gray-600 rounded mb-1" />
                          <div className="h-3 w-48 animate-pulse bg-gray-700 rounded" />
                        </div>
                      </div>
                    ))
                  ) : recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Recent Activity</h3>
                      <p className="text-gray-400 text-sm">
                        {profile?.role === "user"
                          ? "Start by browsing events or purchasing tickets!"
                          : "Create your first event or manage approvals to see activity here."}
                      </p>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        {activity.type === "ticket_sold" && (
                          <Ticket className="h-8 w-8 text-purple-400 flex-shrink-0" />
                        )}
                        {activity.type === "event_created" && (
                          <PlusCircle className="h-8 w-8 text-blue-400 flex-shrink-0" />
                        )}
                        {activity.type === "event_approved" && (
                          <Calendar className="h-8 w-8 text-green-400 flex-shrink-0" />
                        )}
                        {activity.type === "application_submitted" && (
                          <Users className="h-8 w-8 text-yellow-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{activity.title}</p>
                          <p className="text-sm text-gray-400 truncate">{activity.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                {/* Footer can be added if needed */}
              </Card>
              <Card className="border-gray-800 bg-gray-900/50 lg:col-span-1">
                {" "}
                {/* Upcoming events */}
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription className="text-gray-400">
                    {profile?.role === "user" ? "Events you have tickets for" : "Your upcoming events"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardLoading ? (
                    [1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        <div className="h-12 w-12 animate-pulse bg-gray-600 rounded-md flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="h-4 w-3/4 animate-pulse bg-gray-600 rounded mb-1" />
                          <div className="h-3 w-full animate-pulse bg-gray-700 rounded" />
                        </div>
                      </div>
                    ))
                  ) : upcomingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Events</h3>
                      <p className="text-gray-400 text-sm">
                        {profile?.role === "user"
                          ? "Purchase tickets to see your upcoming events here."
                          : "Create an event to see it here."}
                      </p>
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-900/30 text-purple-400 flex-shrink-0">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{event.title}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </p>
                        </div>
                        <Button size="sm" asChild className="bg-purple-600 hover:bg-purple-700 ml-auto flex-shrink-0">
                          <Link href={`/events/${event.id}`}>View</Link>
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Link href="/events">
                      {upcomingEvents.length === 0 && profile?.role === "user" ? "Browse Events" : "View All My Events"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Become a Seller Tab */}
          {profile?.role === "user" && profile.seller_status === "none" && (
            <TabsContent value="become-seller">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Apply to Become a Seller</CardTitle>
                  <CardDescription className="text-gray-400">
                    Create and manage your own events on Top City Tickets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SellerApplicationForm />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Create Event Tab */}
          {((profile?.role === "seller" && profile.seller_status === "approved") || profile?.role === "admin") && (
            <TabsContent value="create-event">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Request a New Event</CardTitle>
                  <CardDescription className="text-gray-400">Submit your event for approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <EventRequestForm />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Approvals Tab */}
          {profile?.role === "admin" && (
            <TabsContent value="approvals">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription className="text-gray-400">
                    Review and manage seller applications and event requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminApprovalList />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription className="text-gray-400">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Settings form can be added here later */}
                <p className="text-gray-400">Account settings form will be here. (Coming Soon)</p>
                <div className="space-y-6 mt-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Profile Information</h3>
                    <p className="text-sm text-gray-400">Your personal details.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue={profile?.full_name || ""}
                        className="border-gray-700 bg-gray-800 text-white"
                        disabled // For now, or implement update logic
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        defaultValue={profile?.email || ""}
                        className="border-gray-700 bg-gray-800 text-white"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Account Type</Label>
                      <Input
                        id="role"
                        defaultValue={profile?.role.charAt(0).toUpperCase() + profile?.role.slice(1) || ""}
                        className="border-gray-700 bg-gray-800 text-white"
                        disabled
                      />
                    </div>
                    {profile?.role !== "user" && (
                      <div className="space-y-2">
                        <Label htmlFor="seller-status">Seller Status</Label>
                        <Input
                          id="seller-status"
                          defaultValue={
                            profile?.seller_status.charAt(0).toUpperCase() + profile?.seller_status.slice(1) || ""
                          }
                          className="border-gray-700 bg-gray-800 text-white"
                          disabled
                        />
                      </div>
                    )}
                  </div>
                  {/* <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button> */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
