import { Link } from 'react-router-dom'
import { FolderTree, ShieldCheck, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const AdminDashboard = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-border/80 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
          <ShieldCheck className="size-3.5" />
          <span>Moderator & Admin Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Platform Administration
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage system categories, user account statuses, and system moderation policies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Management */}
        <Card className="border-border/80 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderTree className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Category Management</CardTitle>
              <CardDescription className="text-xs">
                Create and organize item categories, slug identifiers, and icon names
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-0 pt-2 space-y-4">
            <p className="text-xs text-muted-foreground">
              Configure standard item classifications used across the Bangladesh directory search
              and the 3-step reporting wizard.
            </p>
            <Button asChild size="sm">
              <Link to="/admin/categories">Manage Categories</Link>
            </Button>
          </CardContent>
        </Card>

        {/* User Moderation */}
        <Card className="border-border/80 p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">User Moderation</CardTitle>
              <CardDescription className="text-xs">
                Inspect user accounts, block abusive reporters, and assign moderator roles
              </CardDescription>
            </div>
          </div>
          <CardContent className="p-0 pt-2 space-y-4">
            <p className="text-xs text-muted-foreground">
              Search registered community members by phone or email, manage account locks, and review
              moderation roles.
            </p>
            <Button asChild size="sm">
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
