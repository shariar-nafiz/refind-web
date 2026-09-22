import { Link } from 'react-router-dom'
import { Calendar, Eye, MapPin, Tag } from 'lucide-react'
import type { Item } from '@/api/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ItemStatusBadge, ItemTypeBadge } from './ItemStatusBadge'

interface ItemCardProps {
  item: Item
}

export const ItemCard = ({ item }: ItemCardProps) => {
  const imageUrl = item.primaryImageUrl || item.media?.[0]?.fileUrl
  const formattedDate = new Date(item.incidentDateTime || item.createdAt).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  )

  const locationText = [item.thana, item.district].filter(Boolean).join(', ') || item.division || 'Bangladesh'

  return (
    <Link to={`/items/${item.id}`} className="group block focus-visible:outline-hidden">
      <Card className="overflow-hidden border border-border/80 bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md">
        {/* Thumbnail Image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-muted-foreground">
              <Tag className="size-10 stroke-1 opacity-40" />
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <ItemTypeBadge type={item.type} />
            {item.status !== 'OPEN' && <ItemStatusBadge status={item.status} className="bg-background/90 backdrop-blur-xs" />}
          </div>

          {item.hasSecretQuestion && (
            <div className="absolute top-2.5 right-2.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-xs">
              Verification Required
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {item.categoryName && (
            <p className="mb-1 text-xs font-medium text-primary uppercase tracking-wider">
              {item.categoryName}
            </p>
          )}

          {/* Title */}
          <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Description Snippet */}
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {item.descriptionSnippet || item.description || 'No description provided.'}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
          {/* Location */}
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{locationText}</span>
          </div>

          {/* Date & Views */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <Calendar className="size-3 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            {typeof item.viewCount === 'number' && item.viewCount > 0 && (
              <div className="flex items-center gap-0.5">
                <Eye className="size-3 shrink-0" />
                <span>{item.viewCount}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
