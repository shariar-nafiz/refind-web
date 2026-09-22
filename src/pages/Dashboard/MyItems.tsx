import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  Compass,
  ExternalLink,
  MapPin,
  PlusCircle,
  Tag,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { itemsApi } from '@/api/items.api'
import type { Item, ItemStatus, ItemType } from '@/api/types'
import { ItemStatusBadge, ItemTypeBadge } from '@/components/items/ItemStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const MyItems = () => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<ItemType | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<ItemStatus | 'ALL'>('ALL')

  const fetchItems = () => {
    setLoading(true)
    itemsApi
      .getMyItems(
        filterType !== 'ALL' ? filterType : undefined,
        filterStatus !== 'ALL' ? filterStatus : undefined
      )
      .then((res) => {
        setItems(res.items || [])
      })
      .catch(() => {
        setItems([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchItems()
  }, [filterType, filterStatus])

  const handleMarkResolved = async (id: number) => {
    try {
      await itemsApi.updateStatus(id, 'RESOLVED')
      toast.success('Report updated to Resolved / Recovered!')
      fetchItems()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return
    try {
      await itemsApi.delete(id)
      toast.success('Report deleted.')
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {
      toast.error('Failed to delete report.')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            My Lost & Found Reports
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your reports and update recovery status when items are claimed or returned
          </p>
        </div>

        <Button asChild className="gap-1.5 shadow-sm">
          <Link to="/report">
            <PlusCircle className="size-4" />
            Report New Item
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-muted p-1 text-xs font-semibold">
          {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterType === t
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t === 'LOST' ? 'Lost Items' : 'Found Items'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-muted p-1 text-xs font-semibold">
          {(['ALL', 'OPEN', 'RESOLVED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                filterStatus === s
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s === 'OPEN' ? 'Active / Open' : 'Recovered'}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border-border/80 p-4 transition-all hover:border-primary/40">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                    {item.primaryImageUrl ? (
                      <img src={item.primaryImageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Tag className="size-6 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ItemTypeBadge type={item.type} />
                      <ItemStatusBadge status={item.status} />
                    </div>

                    <Link
                      to={`/items/${item.id}`}
                      className="text-base font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {item.title}
                      <ExternalLink className="size-3 text-muted-foreground" />
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 text-primary" />
                        {[item.thana, item.district].filter(Boolean).join(', ') || 'Bangladesh'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(item.incidentDateTime || item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.status !== 'RESOLVED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkResolved(item.id)}
                      className="gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Mark Resolved
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="size-8 p-0 text-muted-foreground hover:text-destructive"
                    title="Delete report"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-border">
          <CardContent className="space-y-3 p-0">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Compass className="size-6 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No reports found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t posted any lost or found reports matching the current filter.
            </p>
            <Button asChild size="sm">
              <Link to="/report">Create a Report</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
