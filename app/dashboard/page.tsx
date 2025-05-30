"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Calendar, LayoutDashboard, PlusCircle, Settings, ShoppingBag, Ticket, Users } from "lucide-react"

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
  const { profile, user } = useAuth()
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Get user role from the actual profile data
  const userRole = profile?.role || "user"
  const sellerStatus = profile?.seller_status || "none"

  useEffect(() => {
    if (user && profile) {
      fetchDashboardData()
    }
  }, [user, profile])

  const fetchDashboardData = async () => {
    try {
      await Promise.all([fetchRecentActivity(), fetchUpcomingEvents()])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    const activities: RecentActivity[] = []

    try {
      if (userRole === "user") {
        // Fetch recent ticket purchases
        const { data: ticketsData } = await supabase
          .from("tickets")
          .select(`
            id,
            purchase_date,
            event:events(title)
          `)
          .eq("user_id", user?.id)
          .order("purchase_date", { ascending: false })
          .limit(3)

        ticketsData?.forEach((ticket) => {
          activities.push({
            id: ticket.id,
            type: "ticket_sold",
            title: "Purchased Ticket",
            description: `${ticket.event?.title} - ${new Date(ticket.purchase_date).toLocaleDateString()}`,
            date: ticket.purchase_date,
          })
        })

        // Check for seller application
        if (sellerStatus === "pending") {
          activities.push({
            id: "seller-app",
            type: "application_submitted",
            title: "Seller Application Submitted",
            description: "Your application is under review",
            date: new Date().toISOString(),
          })
        }
      } else if (userRole === "seller" || userRole === "admin") {
        // Fetch recent events created
        const { data: eventsData } = await supabase
          .from("events")
          .select("id, title, created_at, status")
          .eq("organizer_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(3)

        eventsData?.forEach((event) => {
          activities.push({
            id: event.id,
            type: event.status === "approved" ? "event_approved" : "event_created",
            title: event.status === "approved" ? "Event Approved" : "Event Created",
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
    try {
      if (userRole === "user") {
        // Fetch events user has tickets for
        const { data: ticketsData } = await supabase
          .from("tickets")
          .select(`
            event:events(id, title, date, location, status)
          `)
          .eq("user_id", user?.id)

        const userEvents =
          ticketsData
            ?.map((ticket) => ticket.event)
            .filter((event) => event && new Date(event.date) >= new Date())
            .slice(0, 3) || []

        setUpcomingEvents(userEvents as UpcomingEvent[])
      } else if (userRole === "seller" || userRole === "admin") {
        // Fetch seller's upcoming events
        const { data: eventsData } = await supabase
          .from("events")
          .select("id, title, date, location, status")
          .eq("organizer_id", user?.id)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true })
          .limit(3)

        setUpcomingEvents(eventsData || [])
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error)
    }
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto p-4 py-6 lg:p-8">
        <div className="mb-8 flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <img src="/logo.png" alt="Top City Tickets Logo" className="h-24 w-auto" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {userRole === "admin" ? "Admin Dashboard" : userRole === "seller" ? "Seller Dashboard" : "Dashboard"}
            </h1>
            <p className="text-gray-400">
              {userRole === "admin"
                ? "Manage users, sellers, and events"
                : userRole === "seller"
                  ? "Manage your events and sales"
                  : "Manage your account and activities"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Overview
            </TabsTrigger>

            {/* Show "Become a Seller" tab only for regular users who haven't applied */}
            {userRole === "user" && sellerStatus === "none" && (
              <TabsTrigger
                value="become-seller"
                className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
              >
                Become a Seller
              </TabsTrigger>
            )}

            {/* Show seller-specific tabs for sellers and admins */}
            {(userRole === "seller" || userRole === "admin") && (
              <TabsTrigger
                value="create-event"
                className="data-[state=active]:bg-purple-900 data-[state=active]:text-white"
              >
                Create Event
              </TabsTrigger>
            )}

            {/* Show admin-specific tabs only for admins */}
            {userRole === "admin" && (
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

          {/* Overview Tab - Different for each role */}
          <TabsContent value="overview" className="space-y-6">
            {/* Show seller status for users who have applied */}
            {userRole === "user" && sellerStatus !== "none" && (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Seller Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        sellerStatus === "approved"
                          ? "bg-green-500"
                          : sellerStatus === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-white">
                      {sellerStatus === "approved"
                        ? "Congratulations! Your seller application has been approved."
                        : sellerStatus === "pending"
                          ? "Your seller application is under review."
                          : "Your seller application was rejected. Please contact support for more information."}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userRole === "user" && <UserStats />}
              {userRole === "seller" && <SellerStats />}
              {userRole === "admin" && <AdminStats />}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400">Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    // Loading state
                    <>
                      {[1, 2, 3].map((i) => (
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
                      ))}
                    </>
                  ) : recentActivity.length === 0 ? (
                    // Empty state
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Recent Activity</h3>
                      <p className="text-gray-400 text-sm">
                        {userRole === "user"
                          ? "Start by browsing events and purchasing tickets!"
                          : "Create your first event to see activity here."}
                      </p>
                    </div>
                  ) : (
                    // Activity list
                    recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        {activity.type === "ticket_sold" && <Ticket className="h-8 w-8 text-purple-400" />}
                        {activity.type === "event_created" && <PlusCircle className="h-8 w-8 text-purple-400" />}
                        {activity.type === "event_approved" && <Calendar className="h-8 w-8 text-green-400" />}
                        {activity.type === "application_submitted" && <Users className="h-8 w-8 text-yellow-400" />}
                        <div>
                          <p className="font-medium text-white">{activity.title}</p>
                          <p className="text-sm text-gray-400">{activity.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    disabled={recentActivity.length === 0}
                  >
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription className="text-gray-400">Frequently used features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userRole === "user" && (
                    <>
                      <Button asChild className="w-full justify-start bg-gray-800 hover:bg-gray-700">
                        <Link href="/events">
                          <Ticket className="mr-2 h-4 w-4" /> Browse Events
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start bg-gray-800 hover:bg-gray-700">
                        <Link href="/tickets">
                          <ShoppingBag className="mr-2 h-4 w-4" /> My Tickets
                        </Link>
                      </Button>
                    </>
                  )}

                  {(userRole === "seller" || userRole === "admin") && (
                    <>
                      <Button asChild className="w-full justify-start bg-gray-800 hover:bg-gray-700">
                        <Link href="/seller/events">
                          <PlusCircle className="mr-2 h-4 w-4" /> Manage Events
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start bg-gray-800 hover:bg-gray-700">
                        <Link href="/seller/events">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Event Analytics
                        </Link>
                      </Button>
                    </>
                  )}

                  {userRole === "admin" && (
                    <>
                      <Button asChild className="w-full justify-start bg-gray-800 hover:bg-gray-700">
                        <Link href="/admin/applications">
                          <Users className="mr-2 h-4 w-4" /> Manage Applications
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start bg-gray-800 hover:bg-gray-700">
                        <Link href="/admin-dashboard">
                          <Calendar className="mr-2 h-4 w-4" /> Admin Dashboard
                        </Link>
                      </Button>
                    </>
                  )}

                  <Button asChild className="w-full justify-start bg-gray-800 hover:bg-gray-700">
                    <Link href="#settings">
                      <Settings className="mr-2 h-4 w-4" /> Account Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-900/50 md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription className="text-gray-400">
                    {userRole === "user"
                      ? "Events you have tickets for"
                      : userRole === "seller"
                        ? "Your upcoming events"
                        : "Recently added events"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    // Loading state
                    <>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                        >
                          <div className="h-12 w-12 animate-pulse bg-gray-600 rounded-md" />
                          <div className="flex-1">
                            <div className="h-4 w-32 animate-pulse bg-gray-600 rounded mb-1" />
                            <div className="h-3 w-48 animate-pulse bg-gray-700 rounded" />
                          </div>
                          <div className="h-8 w-16 animate-pulse bg-gray-600 rounded" />
                        </div>
                      ))}
                    </>
                  ) : upcomingEvents.length === 0 ? (
                    // Empty state
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Events</h3>
                      <p className="text-gray-400 text-sm">
                        {userRole === "user"
                          ? "Purchase tickets to see your upcoming events here."
                          : "Create your first event to see it here."}
                      </p>
                    </div>
                  ) : (
                    // Events list
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-900/30 text-purple-400">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{event.title}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </p>
                        </div>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          {userRole === "user" ? "View" : userRole === "seller" ? "Edit" : "Review"}
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
                    <Link href="/events">{upcomingEvents.length === 0 ? "Browse Events" : "View All Events"}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Become a Seller Tab - Only for users who haven't applied */}
          {userRole === "user" && sellerStatus === "none" && (
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

          {/* Create Event Tab - Only for sellers and admins */}
          {(userRole === "seller" || userRole === "admin") && (
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

          {/* Approvals Tab - Only for admins */}
          {userRole === "admin" && (
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

          {/* Settings Tab - For all roles */}
          <TabsContent value="settings">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription className="text-gray-400">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Profile Information</h3>
                    <p className="text-sm text-gray-400">Update your personal details</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue={profile?.full_name || ""}
                        className="border-gray-700 bg-gray-800 text-white"
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
                        defaultValue={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        className="border-gray-700 bg-gray-800 text-white"
                        disabled
                      />
                    </div>
                    {userRole !== "user" && (
                      <div className="space-y-2">
                        <Label htmlFor="seller-status">Seller Status</Label>
                        <Input
                          id="seller-status"
                          defaultValue={sellerStatus.charAt(0).toUpperCase() + sellerStatus.slice(1)}
                          className="border-gray-700 bg-gray-800 text-white"
                          disabled
                        />
                      </div>
                    )}
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
