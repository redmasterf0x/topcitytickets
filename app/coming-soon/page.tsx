import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container relative mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8 rounded-2xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-xl p-8 shadow-2xl shadow-purple-900/20 text-center">
          {/* Header with logo */}
          <div className="mb-6 flex justify-center">
            <img src="/logo.png" alt="Top City Tickets Logo" className="h-16 w-auto" />
          </div>

          <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
            <Clock className="h-10 w-10 text-purple-400" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Coming Soon
          </h1>

          <p className="text-gray-300 text-lg">
            We're working hard to bring you something amazing. This feature will be available soon!
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-400">In the meantime, check out our current events and features.</p>

            <Button
              asChild
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
