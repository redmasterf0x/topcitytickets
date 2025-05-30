"use client"

import type React from "react"

import { useState } from "react"
import { Building, Mail, Phone, User, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BusinessOpportunitiesForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [inquiryType, setInquiryType] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)

    const businessInquiry = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      inquiryType: inquiryType,
      message: formData.get("message") as string,
      submittedAt: new Date().toISOString(),
    }

    try {
      // Send email to admins (you'll need to implement this endpoint)
      const response = await fetch("/api/business-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(businessInquiry),
      })

      if (!response.ok) {
        throw new Error("Failed to submit inquiry")
      }

      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting inquiry:", error)
      setError("Failed to submit inquiry. Please try again or contact us directly.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-purple-900/30 p-3">
          <CheckCircle2 className="h-12 w-12 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white">Thank You!</h3>
        <p className="mt-2 text-gray-400 max-w-md">
          We've received your business inquiry and will contact you within 24-48 hours to discuss opportunities.
        </p>
        <Button className="mt-6 bg-purple-600 hover:bg-purple-700" onClick={() => setSubmitted(false)}>
          Submit Another Inquiry
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              name="name"
              required
              placeholder="John Doe"
              className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john@company.com"
              className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company/Organization</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="company"
              name="company"
              placeholder="Your Company Name"
              className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inquiry-type">Type of Inquiry *</Label>
        <Select required value={inquiryType} onValueChange={setInquiryType}>
          <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
            <SelectValue placeholder="Select inquiry type" />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-800 text-white">
            <SelectItem value="partnership">Partnership Opportunities</SelectItem>
            <SelectItem value="sponsorship">Event Sponsorship</SelectItem>
            <SelectItem value="venue">Venue Partnership</SelectItem>
            <SelectItem value="corporate">Corporate Events</SelectItem>
            <SelectItem value="marketing">Marketing Collaboration</SelectItem>
            <SelectItem value="investment">Investment Opportunities</SelectItem>
            <SelectItem value="other">Other Business Inquiry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Tell us about your business opportunity or partnership idea..."
          className="min-h-[120px] border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
        <p className="text-sm text-gray-400">
          By submitting this form, you agree to be contacted by our business development team regarding potential
          opportunities. We typically respond within 24-48 hours.
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
        {loading ? "Submitting..." : "Submit Business Inquiry"}
      </Button>
    </form>
  )
}
