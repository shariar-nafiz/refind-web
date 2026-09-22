import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  Compass,
  MapPin,
  PlusCircle,
  Settings,
} from 'lucide-react'
import { usersApi } from '@/api/users.api'
import type { DashboardOverview } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/useAuthStore'

export const DashboardHome = () => {
  const { user } = useAuthStore()
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    usersApi
      .getDashboard()
      .then((data) => {
        if (mounted) setDashboard(data)
      })
      .catch(() => {
        // Fallback placeholder data if endpoint is fresh
        if (mounted) {
          setDashboard({
            userId: user?.id || 1,
            fullName: user?.fullName || 'User',
            avatarUrl: user?.avatarUrl,
            isProfileCompleted: true,
            totalAddresses: 1,
            activeReportsCount: 0,
            profileCompletenessPercentage: 100,
          })
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [user])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user?.fullName || 'Community Member'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your lost & found reports, track recovery status, and update address preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="gap-1.5 shadow-sm">
            <Link to="/report">
              <PlusCircle className="size-4" />
              Report New Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <Card className="border-border/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Active Reports</p>
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Compass className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">
                {dashboard?.activeReportsCount || 0}
              </p>
              <Link to="/dashboard/my-items" className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                View reports <ArrowRight className="size-3" />
              </Link>
            </Card>

            <Card className="border-border/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Saved Addresses</p>
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">
                {dashboard?.totalAddresses || 0}
              </p>
              <Link to="/dashboard/addresses" className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                Manage address book <ArrowRight className="size-3" />
              </Link>
            </Card>

            <Card className="border-border/80 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Profile Status</p>
                <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <CheckCircle className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">
                {dashboard?.profileCompletenessPercentage || 100}%
              </p>
              <Link to="/dashboard/settings" className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                Account settings <ArrowRight className="size-3" />
              </Link>
            </Card>
          </>
        )}
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="size-4 text-primary" />
              My Lost & Found Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review reports you have created, update status to RESOLVED when items are safely
              returned, or edit item descriptions.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/my-items">Open My Reports</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="size-4 text-primary" />
              Notifications & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Customize email and push alert preferences, change password, or adjust privacy
              settings for claim contact disclosures.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/settings">Open Preferences</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
