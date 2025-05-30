import { AuthGuard } from "@/components/auth-guard"
import { AdminApprovalList } from "@/components/admin-approval-list"
import { AdminStats } from "@/components/admin-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  return (
    <AuthGuard requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto p-4 py-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, sellers, and events</p>
        </div>

        {/* Admin Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AdminStats />
        </div>

        {/* Admin Approvals */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription className="text-gray-400">
              Review and manage seller applications and event requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminApprovalList />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
