"use client"

import Link from "next/link"
import { ArrowRight, Calendar, Ticket, Users } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"
import { BusinessOpportunitiesForm } from "@/components/business-opportunities-form"

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/events")
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Video Background */}
      <div className="relative overflow-hidden">
        {/* Video Background */}
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/background-video.webm" type="video/webm" />
          {/* Fallback for browsers that don't support webm */}
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30" />

        <div className="container relative mx-auto px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8">
          <div className="text-center lg:text-left">
            {/* Logo */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <img src="/logo.png" alt="Top City Tickets Logo" className="h-32 w-auto md:h-40" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className="block text-white drop-shadow-lg">Your Premier</span>
              <span className="block bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                Event Experience
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-xl text-gray-200 sm:mx-auto lg:mx-0 drop-shadow-md">
              Your premier destination for the hottest events in the city. Buy, sell, and experience unforgettable
              moments.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                <Link href="/events">
                  Browse Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-purple-700 text-purple-400 hover:bg-purple-950/50 backdrop-blur-sm"
              >
                <Link href="/sign-up">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Why Choose Top City Tickets?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-300">
            The ultimate platform for event enthusiasts and organizers
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-purple-900/50 bg-gray-900/50 p-8 text-center shadow-lg shadow-purple-900/20 transition-all hover:shadow-purple-700/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/30">
              <Ticket className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mt-6 text-xl font-medium text-white">Secure Ticketing</h3>
            <p className="mt-4 text-gray-400">
              Our platform ensures secure transactions and authentic tickets for all events.
            </p>
          </div>

          <div className="rounded-xl border border-pink-900/50 bg-gray-900/50 p-8 text-center shadow-lg shadow-pink-900/20 transition-all hover:shadow-pink-700/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-900/30">
              <Calendar className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="mt-6 text-xl font-medium text-white">Exclusive Events</h3>
            <p className="mt-4 text-gray-400">
              Access to the most sought-after events in your city, from concerts to sports and more.
            </p>
          </div>

          <div className="rounded-xl border border-purple-900/50 bg-gray-900/50 p-8 text-center shadow-lg shadow-purple-900/20 transition-all hover:shadow-purple-700/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/30">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mt-6 text-xl font-medium text-white">Become a Seller</h3>
            <p className="mt-4 text-gray-400">
              Create and manage your own events. Apply to become a verified seller today.
            </p>
          </div>
        </div>
      </div>

      {/* Business Opportunities Section */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Explore Business Opportunities</h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-300">
              Partner with us to create amazing experiences and grow your business in the events industry.
            </p>
          </div>
          <BusinessOpportunitiesForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Top City Tickets
              </h3>
              <p className="mt-2 text-gray-400">Your premier event ticketing platform</p>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link
                href="https://facebook.com/topcitytickets"
                className="text-gray-300 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Top City Tickets LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
