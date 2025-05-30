"use client"

import { AuthGuard } from "@/components/auth-guard"
import { EventRequestForm } from "@/components/event-request-form"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CreateEventPage() {
  const { profile } = useAuth()

  // Ensure only sellers or admins can access this page.
  // EventRequestForm itself uses useAuth to get organizer_id.
  if (!profile || (profile.role !== "seller" && profile.role !== "admin")) {
    // AuthGuard will also handle redirection if not authorized,
    // but this provides an immediate content block.
    return (
      <AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-400">You are not authorized to create events.</p>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" asChild>
            <Link href="/seller/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Events
            </Link>
          </Button>
        </div>
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Request New Event Creation</CardTitle>
            <p className="text-gray-400">
              Fill out the details below to submit your event for approval by an administrator.
            </p>
          </CardHeader>
          <CardContent>
            <EventRequestForm />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
