"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, CheckCircle2, Clock, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export function EventRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [category, setCategory] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const { user } = useAuth()

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `event-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("event-images").upload(filePath, file)

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        return null
      }

      const { data } = supabase.storage.from("event-images").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      let imageUrl = null

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
        if (!imageUrl) {
          setError("Failed to upload image. Please try again.")
          setLoading(false)
          return
        }
      }

      const { error } = await supabase.from("events").insert({
        title: formData.get("event-name") as string,
        description: formData.get("event-description") as string,
        date: formData.get("event-date") as string,
        time: formData.get("event-time") as string,
        location: formData.get("event-location") as string,
        price: Number.parseFloat(formData.get("ticket-price") as string),
        capacity: Number.parseInt(formData.get("event-capacity") as string),
        category: category,
        image_url: imageUrl,
        organizer_id: user.id,
        status: "pending",
      })

      if (error) {
        console.error("Error submitting event:", error)
        setError("Failed to submit event. Please try again.")
      } else {
        setSubmitted(true)
      }
    } catch (error) {
      console.error("Error:", error)
      setError("An unexpected error occurred. Please try again.")
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
        <h3 className="text-2xl font-bold text-white">Event Submitted!</h3>
        <p className="mt-2 text-gray-400">
          Your event request has been submitted successfully. An admin will review your event and approve it shortly.
        </p>
        <Button className="mt-6 bg-purple-600 hover:bg-purple-700" onClick={() => window.location.reload()}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-900/20 border border-red-900/50 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-name">Event Name</Label>
          <Input
            id="event-name"
            name="event-name"
            required
            placeholder="e.g., Summer Music Festival"
            className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event-category">Event Category</Label>
            <Select required value={category} onValueChange={setCategory}>
              <SelectTrigger id="event-category" className="border-gray-700 bg-gray-800 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800 text-white">
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="arts">Arts & Theater</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="food">Food & Drink</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-capacity">Expected Capacity</Label>
            <Input
              id="event-capacity"
              name="event-capacity"
              type="number"
              required
              placeholder="e.g., 500"
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-description">Event Description</Label>
          <Textarea
            id="event-description"
            name="event-description"
            placeholder="Describe your event in detail..."
            required
            className="min-h-[120px] border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event-date">Event Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="event-date"
                name="event-date"
                type="date"
                required
                className="border-gray-700 bg-gray-800 pl-10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-time">Event Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="event-time"
                name="event-time"
                type="time"
                required
                className="border-gray-700 bg-gray-800 pl-10 text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-location">Event Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="event-location"
              name="event-location"
              required
              placeholder="Venue name and address"
              className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ticket-price">Ticket Price ($)</Label>
            <Input
              id="ticket-price"
              name="ticket-price"
              type="number"
              step="0.01"
              required
              placeholder="e.g., 49.99"
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-quantity">Number of Tickets</Label>
            <Input
              id="ticket-quantity"
              name="ticket-quantity"
              type="number"
              required
              placeholder="e.g., 200"
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <ImageUpload onImageSelect={setSelectedImage} className="space-y-2" />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
        {loading ? "Submitting..." : "Submit Event for Approval"}
      </Button>
    </form>
  )
}
