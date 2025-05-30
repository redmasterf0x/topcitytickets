import Link from "next/link"
import { Calendar, MapPin, Share, Star, Ticket, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // Mock event data - in a real app, this would be fetched based on the ID
  const event = {
    id: params.id,
    title: "Summer Music Festival",
    description:
      "Join us for three days of amazing music featuring top artists from around the world. Experience unforgettable performances across multiple stages in the heart of the city.",
    longDescription:
      "The Summer Music Festival is the premier music event of the season, bringing together an incredible lineup of artists spanning multiple genres. From rock and pop to electronic and hip-hop, there's something for every music lover.\n\nWith three main stages, food vendors, art installations, and more, this festival offers a complete experience beyond just the music. Come for the performances, stay for the community and atmosphere that make this event special year after year.",
    date: "June 15-17, 2023",
    time: "12:00 PM - 11:00 PM",
    location: "Central Park, New York",
    address: "Central Park, 5th Ave, New York, NY 10022",
    organizer: "City Events Productions",
    image: "/placeholder.svg?height=600&width=1200",
    price: "$75",
    category: "Music",
    tags: ["Festival", "Live Music", "Outdoor"],
    lineup: [
      "The Groove Masters",
      "Electric Pulse",
      "Melody Makers",
      "Rhythm Collective",
      "Sound Pioneers",
      "Harmony Heights",
    ],
    ticketTypes: [
      { name: "General Admission", price: "$75", available: true },
      { name: "VIP Pass", price: "$150", available: true },
      { name: "Weekend Pass", price: "$120", available: true },
      { name: "Backstage Experience", price: "$250", available: false },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Event Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/events" className="text-sm text-purple-400 hover:text-purple-300">
              Events
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-sm text-gray-400">{event.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">{event.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-purple-900/30 px-3 py-1 text-sm font-medium text-purple-400">
              {event.category}
            </span>
            <div className="flex items-center text-yellow-400">
              <Star className="mr-1 h-4 w-4 fill-yellow-400" />
              <Star className="mr-1 h-4 w-4 fill-yellow-400" />
              <Star className="mr-1 h-4 w-4 fill-yellow-400" />
              <Star className="mr-1 h-4 w-4 fill-yellow-400" />
              <Star className="mr-1 h-4 w-4" />
              <span className="ml-1 text-sm text-gray-400">(124 reviews)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Share className="h-5 w-5" />
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Ticket className="mr-2 h-5 w-5" /> Get Tickets
          </Button>
        </div>
      </div>

      {/* Event Image */}
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <img
          src={event.image || "/placeholder.svg"}
          alt={event.title}
          className="h-[300px] w-full object-cover md:h-[400px]"
        />
      </div>

      {/* Event Details */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="details" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
                Details
              </TabsTrigger>
              <TabsTrigger value="lineup" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
                Lineup
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-900 data-[state=active]:text-white">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-300">
                  <p>{event.description}</p>
                  <p>{event.longDescription}</p>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Event Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lineup" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Event Lineup</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {event.lineup.map((artist, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/30 text-purple-400">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{artist}</h3>
                          <p className="text-sm text-gray-400">Performing on Day {Math.floor(index / 2) + 1}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card className="border-gray-800 bg-gray-900/50">
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-purple-900/30 text-purple-400"></div>
                          <span className="font-medium text-white">Sarah Johnson</span>
                        </div>
                        <div className="flex text-yellow-400">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400" />
                        </div>
                      </div>
                      <p className="text-gray-300">
                        Absolutely amazing experience! The lineup was incredible and the atmosphere was electric. Can't
                        wait for next year!
                      </p>
                      <p className="mt-2 text-sm text-gray-400">Posted 2 days ago</p>
                    </div>

                    <div className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-purple-900/30 text-purple-400"></div>
                          <span className="font-medium text-white">Michael Chen</span>
                        </div>
                        <div className="flex text-yellow-400">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <Star className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-gray-300">
                        Great event overall! The music was fantastic and the venue was perfect. Only giving 4 stars
                        because the food options were a bit limited.
                      </p>
                      <p className="mt-2 text-sm text-gray-400">Posted 1 week ago</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    View All Reviews
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info Card */}
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Date & Time</h3>
                  <p className="text-gray-400">{event.date}</p>
                  <p className="text-gray-400">{event.time}</p>
                </div>
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Location</h3>
                  <p className="text-gray-400">{event.location}</p>
                  <p className="text-gray-400">{event.address}</p>
                </div>
              </div>
              <Separator className="bg-gray-800" />
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-white">Organizer</h3>
                  <p className="text-gray-400">{event.organizer}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Purchase Card */}
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle>Get Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="ticket-type" className="block text-sm font-medium text-gray-300">
                  Ticket Type
                </label>
                <Select>
                  <SelectTrigger id="ticket-type" className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800 text-white">
                    {event.ticketTypes.map((ticket) => (
                      <SelectItem key={ticket.name} value={ticket.name} disabled={!ticket.available}>
                        {ticket.name} - {ticket.price} {!ticket.available && "(Sold Out)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
                  Quantity
                </label>
                <Select defaultValue="1">
                  <SelectTrigger id="quantity" className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800 text-white">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 rounded-lg bg-gray-800 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Ticket Price</span>
                  <span className="text-white">$75.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Service Fee</span>
                  <span className="text-white">$10.00</span>
                </div>
                <Separator className="my-2 bg-gray-700" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-300">Total</span>
                  <span className="text-white">$85.00</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Ticket className="mr-2 h-5 w-5" /> Purchase Tickets
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
