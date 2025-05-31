"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export function SellerApplicationForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user, fetchProfile, updateUserProfileInContext } = useAuth()
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [checkingExisting, setCheckingExisting] = useState(true)

  useEffect(() => {
    if (user) {
      checkExistingApplication()
    }
  }, [user])

  const checkExistingApplication = async () => {
    try {
      const { data, error } = await supabase
        .from("seller_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error checking existing application:", error)
      } else {
        setExistingApplication(data?.[0] || null)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setCheckingExisting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const { error } = await supabase.from("seller_applications").insert({
        user_id: user.id,
        user_email: user.email, // Add this line to store the user's email
        business_name: formData.get("business-name") as string,
        business_type: formData.get("business-type") as string,
        website: (formData.get("website") as string) || null,
        experience: formData.get("experience") as string,
        event_types: formData.get("event-types") as string,
        status: "pending",
      })

      if (error) {
        console.error("Error submitting application:", error)
        setError("Failed to submit application. Please try again.")
      } else {
        // Update user's seller_status to pending
        const { error: userUpdateError } = await supabase
          .from("users")
          .update({ seller_status: "pending" })
          .eq("id", user.id)

        if (userUpdateError) {
          console.error("Error updating user seller_status to pending:", userUpdateError)
          setError("Failed to update your user status. Please contact support.")
          // Potentially revert application or notify admin
        } else {
          setSubmitted(true)
          // Optimistically update profile in context
          updateUserProfileInContext({ seller_status: "pending" })
          // Or, for a full refresh:
          // await fetchProfile();
        }
      }
    } catch (error) {
      console.error("Error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  // If user has a pending application
  if (existingApplication?.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-yellow-900/30 p-3">
          <CheckCircle2 className="h-12 w-12 text-yellow-400" />
        </div>
        <h3 className="text-2xl font-bold text-white">Application Under Review</h3>
        <p className="mt-2 text-gray-400">
          Your seller application is currently being reviewed. We'll get back to you within 2-3 business days.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Applied on: {new Date(existingApplication.created_at).toLocaleDateString()}
        </p>
      </div>
    )
  }

  // If user is already an approved seller
  if (existingApplication?.status === "approved") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-green-900/30 p-3">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white">You're Already a Seller!</h3>
        <p className="mt-2 text-gray-400">
          Your seller application has been approved. You can now create and manage events.
        </p>
        <Button
          className="mt-6 bg-purple-600 hover:bg-purple-700"
          onClick={() => (window.location.href = "/seller/events")}
        >
          Go to Seller Dashboard
        </Button>
      </div>
    )
  }

  // If user had a rejected application, show option to reapply
  if (existingApplication?.status === "rejected") {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-900/50 bg-red-900/20 p-4">
          <h3 className="font-medium text-red-400">Previous Application Rejected</h3>
          <p className="mt-2 text-sm text-gray-400">
            Your previous seller application was not approved. You can submit a new application below.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Previous application: {new Date(existingApplication.created_at).toLocaleDateString()}
          </p>
        </div>
        {/* Show the form below this message */}
        {renderApplicationForm()}
      </div>
    )
  }

  // If no existing application or first time, show the form
  return renderApplicationForm()

  // Move the existing form JSX into this function:
  function renderApplicationForm() {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business or Organization Name</Label>
            <Input
              id="business-name"
              name="business-name"
              required
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type</Label>
            <RadioGroup defaultValue="individual" name="business-type" className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="font-normal">
                  Individual / Sole Proprietor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="font-normal">
                  Registered Company
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nonprofit" id="nonprofit" />
                <Label htmlFor="nonprofit" className="font-normal">
                  Non-profit Organization
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Event Experience</Label>
            <Textarea
              id="experience"
              name="experience"
              placeholder="Tell us about your experience organizing events..."
              required
              className="min-h-[120px] border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-types">Types of Events You Plan to Host</Label>
            <Textarea
              id="event-types"
              name="event-types"
              placeholder="Concerts, sports events, workshops, etc..."
              required
              className="min-h-[100px] border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
            <h3 className="mb-2 font-medium text-white">Terms and Conditions</h3>
            <p className="text-sm text-gray-400">
              By submitting this application, you agree to our seller terms and conditions, including our commission
              structure and payout schedule. You also confirm that all information provided is accurate and complete.
            </p>
            <div className="mt-4 flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the terms and conditions
              </label>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    )
  }
}
