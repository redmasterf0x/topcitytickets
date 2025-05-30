"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, loading } = useAuth() // Added loading

  const isActive = (path: string) => {
    return pathname === path
  }

  // Base navigation links
  const baseNavLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
  ]

  // Dynamically build navLinks
  const navLinks = [...baseNavLinks]
  if (!loading && user && profile) {
    if (profile.role === "user") {
      navLinks.push({ name: "Dashboard", href: "/dashboard" })
      navLinks.push({ name: "My Tickets", href: "/tickets" })
    } else if (profile.role === "seller") {
      navLinks.push({ name: "Seller Dashboard", href: "/dashboard" })
      navLinks.push({ name: "My Events", href: "/seller/events" })
    } else if (profile.role === "admin") {
      navLinks.push(
        { name: "Dashboard", href: "/dashboard" }, // Generic dashboard link
        { name: "Seller Mgt.", href: "/seller/events" }, // Link to seller event management
        { name: "Admin Mgt.", href: "/admin-dashboard" }, // Link to admin specific dashboard
        { name: "Applications", href: "/admin/applications" }, // Link to seller applications
        { name: "Event Requests", href: "/admin/event-requests" }, // Add this line
      )
    }
  }

  const handleSignOut = async () => {
    console.log("Sign out button clicked!")
    try {
      await supabase.auth.signOut()
      // AuthProvider will handle user/profile state update
      // Forcing a reload or redirect might be too abrupt, let AuthProvider handle it.
      // router.push("/") // Or window.location.href = "/" if needed
      setIsMenuOpen(false)
      window.location.href = "/" // Force redirect to ensure state clears
    } catch (error) {
      console.error("Error in handleSignOut:", error)
      setIsMenuOpen(false)
      window.location.href = "/" // Fallback redirect
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Top City Tickets Logo" className="h-10 w-auto" />
              <span className="sr-only text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Top City Tickets
              </span>
              <span className="rounded bg-purple-600/20 border border-purple-500/30 px-2 py-0.5 text-xs font-semibold text-purple-400">
                BETA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-purple-400",
                      isActive(link.href) ? "text-purple-400" : "text-gray-300",
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {loading ? (
              <div className="h-5 w-20 animate-pulse rounded bg-gray-700" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Welcome, {profile?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  isActive(link.href)
                    ? "bg-gray-800 text-purple-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col space-y-2 px-3">
              {loading ? (
                <div className="h-8 w-full animate-pulse rounded bg-gray-700" />
              ) : user ? (
                <>
                  <span className="text-sm text-gray-300 px-3 py-2">
                    Welcome, {profile?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
