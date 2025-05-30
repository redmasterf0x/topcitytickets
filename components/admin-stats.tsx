import { Calendar, DollarSign } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminStats() {
  return (
    <>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          <Calendar className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">0</div>
          <p className="text-xs text-gray-400">No events at the moment, check back later!</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">$0</div>
          <p className="text-xs text-gray-400">Stripe integration coming soon</p>
        </CardContent>
      </Card>
    </>
  )
}
