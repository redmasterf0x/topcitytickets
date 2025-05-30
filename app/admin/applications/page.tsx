"use client"

import { useState, useEffect } from "react"
import { Check, X, User, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthGuard } from "@/components/auth-guard"
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

export default function AdminApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<SellerApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      console.log("Fetching seller applications...")

      const { data, error } = await supabase
        .from("seller_applications")
        .select(`
          *,
          user:users(email, full_name)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching applications:", error)
      } else {
        console.log("Applications fetched:", data)
        setApplications(data || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: "approved" | "rejected") => {
    try {
      console.log(`${action} application:`, applicationId)

      const { error } = await supabase.from("seller_applications").update({ status: action }).eq("id", applicationId)

      if (error) {
        console.error("Error updating application:", error)
        return
      }

      // If approved, also update the user's role and seller_status
      if (action === "approved") {
        const application = applications.find((app) => app.id === applicationId)
        if (application) {
          await supabase
            .from("users")
            .update({
              role: "seller",
              seller_status: "approved",
            })
            .eq("id", application.user_id)
        }
      }

      // Refresh the applications list
      fetchApplications()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const approvedApplications = applications.filter((app) => app.status === "approved")
  const rejectedApplications = applications.filter((app) => app.status === "rejected")

  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Seller Applications</h1>
          <p className="text-gray-400">Review and manage seller applications</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Pending ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Approved ({approvedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
              Rejected ({rejectedApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApplications.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Pending Applications</h3>
                  <p className="text-gray-400 text-center">All seller applications have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              pendingApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onAction={handleApplicationAction}
                  showActions={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onAction={handleApplicationAction}
                showActions={false}
              />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onAction={handleApplicationAction}
                showActions={false}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}

function ApplicationCard({
  application,
  onAction,
  showActions,
}: {
  application: SellerApplication
  onAction: (id: string, action: "approved" | "rejected") => void
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
    <Card className="border-gray-800 bg-gray-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-900/30 text-purple-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-white">{application.user?.full_name || "No name provided"}</CardTitle>
              <p className="text-sm text-gray-400">{application.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(application.status)}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Badge>
            <span className="text-sm text-gray-400">{formatDate(application.created_at)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-white mb-2">Business Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-400" />
                <span className="text-gray-300">{application.business_name}</span>
              </div>
              <p className="text-sm text-gray-400">Type: {application.business_type}</p>
              {application.website && <p className="text-sm text-gray-400">Website: {application.website}</p>}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-2">Event Types</h4>
            <p className="text-sm text-gray-300">{application.event_types}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-white mb-2">Experience</h4>
          <p className="text-sm text-gray-300">{application.experience}</p>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onAction(application.id, "approved")}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-700 text-red-400 hover:bg-red-900/20"
              onClick={() => onAction(application.id, "rejected")}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
