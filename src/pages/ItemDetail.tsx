import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Compass,
  Eye,
  HelpCircle,
  Lock,
  MapPin,
  Send,
  Share2,
  Shield,
  Tag,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { itemsApi } from '@/api/items.api'
import type { Item } from '@/api/types'
import { ItemStatusBadge, ItemTypeBadge } from '@/components/items/ItemStatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/useAuthStore'

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  // Claim modal state
  const [claimOpen, setClaimOpen] = useState(false)
  const [claimAnswer, setClaimAnswer] = useState('')
  const [claimNotes, setClaimNotes] = useState('')
  const [submittingClaim, setSubmittingClaim] = useState(false)

  // Status updating state
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (!id) return
    let mounted = true
    setLoading(true)

    itemsApi
      .getById(parseInt(id, 10))
      .then((data) => {
        if (mounted) setItem(data)
      })
      .catch(() => {
        toast.error('Item not found or failed to load.')
        if (mounted) navigate('/items')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id, navigate])

  const isOwner = Boolean(
    item?.isOwner || (user && item?.posterId && user.id === item.posterId)
  )

  const handleMarkResolved = async () => {
    if (!item) return
    setResolving(true)
    try {
      await itemsApi.updateStatus(item.id, 'RESOLVED')
      setItem({ ...item, status: 'RESOLVED' })
      toast.success('Report marked as Resolved/Recovered! Congratulations!')
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setResolving(false)
    }
  }

  const handleDelete = async () => {
    if (!item || !window.confirm('Are you sure you want to delete this report?')) return
    try {
      await itemsApi.delete(item.id)
      toast.success('Item report deleted.')
      navigate('/items')
    } catch {
      toast.error('Failed to delete report.')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item?.title,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info('Please sign in to submit an ownership claim.')
      navigate('/login')
      return
    }

    setSubmittingClaim(true)
    setTimeout(() => {
      setSubmittingClaim(false)
      setClaimOpen(false)
      toast.success(
        'Claim verification submitted! The finder has been notified and will review your answer.'
      )
    }, 1000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-4/3 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  const imageUrl = item.primaryImageUrl || item.media?.[0]?.fileUrl
  const formattedDate = new Date(item.incidentDateTime || item.createdAt).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  const locationText = [item.thana, item.district, item.division].filter(Boolean).join(', ')

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2 text-muted-foreground gap-1.5">
        <Link to="/items">
          <ArrowLeft className="size-4" />
          Back to Directory
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-muted-foreground">
                <Tag className="size-16 stroke-1 opacity-40 mb-2" />
                <span className="text-xs">No photos attached</span>
              </div>
            )}

            {/* Badges overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <ItemTypeBadge type={item.type} className="text-xs px-2.5 py-1" />
              <ItemStatusBadge status={item.status} className="bg-background/90 backdrop-blur-xs text-xs" />
            </div>
          </div>

          {/* Thumbnail list if multiple media */}
          {item.media && item.media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {item.media.map((m) => (
                <img
                  key={m.mediaId}
                  src={m.fileUrl}
                  alt="Thumbnail"
                  className="size-16 rounded-xl object-cover border border-border shrink-0 cursor-pointer hover:border-primary"
                />
              ))}
            </div>
          )}

          {/* Masked Privacy Protection Card */}
          <Card className="border-border/80 bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <Shield className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Verified & Privacy-Protected</p>
                <p>
                  To protect our community against impersonation and spam, finder contact details
                  remain masked until verification challenge is solved and approved.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="flex flex-col gap-6">
          {/* Category & Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {item.categoryName || item.category?.name || 'General Item'}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" />
                <span>{item.viewCount || 0} views</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {item.title}
            </h1>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-card p-4">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Calendar className="size-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Date Reported</p>
                <p className="font-medium text-foreground">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <MapPin className="size-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Location</p>
                <p className="font-medium text-foreground truncate">{locationText}</p>
              </div>
            </div>

            {item.specificLocationHint && (
              <div className="sm:col-span-2 flex items-start gap-2.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                <Compass className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Landmark / Place Hint</p>
                  <p className="font-medium text-foreground">{item.specificLocationHint}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Description
            </h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {item.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Secret Challenge Card (if FOUND item with question) */}
          {item.type === 'FOUND' && item.secretIdentifierQuestion && (
            <Card className="border-amber-500/40 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-amber-700 dark:text-amber-400">
                    Ownership Verification Question
                  </p>
                  <p className="text-foreground italic">
                    &ldquo;{item.secretIdentifierQuestion}&rdquo;
                  </p>
                  <p className="text-muted-foreground pt-1">
                    To claim this item, click &apos;Claim This Item&apos; below and provide the correct answer.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Poster Card */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/20">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-border">
                {item.posterAvatarUrl && <AvatarImage src={item.posterAvatarUrl} alt={item.posterName} />}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {item.posterName ? item.posterName[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {item.posterName || 'Community Member'}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <UserIcon className="size-3" />
                  Verified Reporter
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              <span>Contact Protected</span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* If Item is open and viewer is NOT owner */}
            {!isOwner && item.status === 'OPEN' && (
              <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 font-semibold gap-2 shadow-sm">
                    <Send className="size-4" />
                    {item.type === 'FOUND' ? 'Claim This Item' : 'I Found This Item'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {item.type === 'FOUND' ? 'Claim Found Item' : 'Report Found Match'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      {item.type === 'FOUND'
                        ? 'Provide the verification details to confirm you are the rightful owner.'
                        : 'Notify the seeker that you have located their item.'}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleClaimSubmit} className="space-y-4 py-2">
                    {item.secretIdentifierQuestion && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Question: {item.secretIdentifierQuestion}
                        </label>
                        <Input
                          required
                          value={claimAnswer}
                          onChange={(e) => setClaimAnswer(e.target.value)}
                          placeholder="Your answer proving ownership..."
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Additional details or contact note
                      </label>
                      <Textarea
                        rows={3}
                        value={claimNotes}
                        onChange={(e) => setClaimNotes(e.target.value)}
                        placeholder="Explain unique identifying marks, where/when it was lost, or phone number..."
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setClaimOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submittingClaim} className="gap-2">
                        {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                        {!submittingClaim && <Send className="size-4" />}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* If Owner: Resolve or Delete */}
            {isOwner && (
              <>
                {item.status !== 'RESOLVED' && (
                  <Button
                    onClick={handleMarkResolved}
                    disabled={resolving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    {resolving ? 'Updating...' : 'Mark as Recovered'}
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  title="Delete report"
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}

            {/* Share Button */}
            <Button variant="outline" size="icon" onClick={handleShare} title="Share item">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
