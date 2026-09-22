import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Ban, CheckCircle, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi } from '@/api/users.api'
import type { User, UserRole } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchUsers = () => {
    setLoading(true)
    usersApi
      .adminGetAllUsers({
        query: query.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      .then((res) => {
        setUsers(res.users || [])
      })
      .catch(() => {
        setUsers([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
    try {
      await usersApi.adminUpdateUserStatus(user.id, nextStatus)
      toast.success(`User status updated to ${nextStatus}`)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      )
    } catch {
      toast.error('Failed to update user status.')
    }
  }

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await usersApi.adminUpdateUserRole(userId, newRole)
      toast.success(`User role updated to ${newRole}`)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } catch {
      toast.error('Failed to update user role.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground gap-1.5">
        <Link to="/admin">
          <ArrowLeft className="size-4" />
          Back to Admin Portal
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            User Moderation
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage account status, block spam or abusive accounts, and assign moderation privileges
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or phone number..."
            className="pl-10 h-10 text-sm"
          />
        </form>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44 h-10">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active Users</SelectItem>
            <SelectItem value="BLOCKED">Blocked Accounts</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={fetchUsers} size="sm" className="h-10 px-4 shrink-0">
          Filter
        </Button>
      </div>

      {/* Users Table / List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="border-border/80 p-4 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{u.fullName}</span>
                      <Badge
                        variant={u.status === 'BLOCKED' ? 'destructive' : 'outline'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {u.status || 'ACTIVE'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email} • {u.phone}</p>
                  </div>
                </div>

                {/* Role and Status Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Select
                    value={u.role}
                    onValueChange={(val: UserRole) => handleRoleChange(u.id, val)}
                  >
                    <SelectTrigger className="h-8 text-xs w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROLE_USER">User</SelectItem>
                      <SelectItem value="ROLE_MODERATOR">Moderator</SelectItem>
                      <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant={u.status === 'BLOCKED' ? 'outline' : 'destructive'}
                    onClick={() => handleToggleStatus(u)}
                    className="h-8 text-xs gap-1.5"
                  >
                    {u.status === 'BLOCKED' ? (
                      <>
                        <CheckCircle className="size-3.5 text-emerald-600" />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban className="size-3.5" />
                        Block
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-border">
          <CardContent className="space-y-3 p-0">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Users className="size-5 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No users found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No registered user accounts matched your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
