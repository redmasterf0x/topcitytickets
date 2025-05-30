import { CreditCard, ShoppingBag, Ticket } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserStats() {
  return (
    <>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tickets Purchased</CardTitle>
          <Ticket className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">5</div>
          <p className="text-xs text-gray-400">+2 from last month</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <ShoppingBag className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">3</div>
          <p className="text-xs text-gray-400">Next event in 5 days</p>
        </CardContent>
      </Card>
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <CreditCard className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">$420</div>
          <p className="text-xs text-gray-400">Over the past 6 months</p>
        </CardContent>
      </Card>
    </>
  )
}
