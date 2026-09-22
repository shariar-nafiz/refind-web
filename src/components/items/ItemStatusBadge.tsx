import type { ItemStatus, ItemType } from '@/api/types'
import { Badge } from '@/components/ui/badge'

interface ItemTypeBadgeProps {
  type: ItemType
  className?: string
}

export const ItemTypeBadge = ({ type, className = '' }: ItemTypeBadgeProps) => {
  if (type === 'FOUND') {
    return (
      <Badge
        className={`bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs ${className}`}
      >
        FOUND
      </Badge>
    )
  }

  return (
    <Badge
      className={`bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-xs ${className}`}
    >
      LOST
    </Badge>
  )
}

interface ItemStatusBadgeProps {
  status: ItemStatus
  className?: string
}

export const ItemStatusBadge = ({ status, className = '' }: ItemStatusBadgeProps) => {
  switch (status) {
    case 'OPEN':
      return (
        <Badge variant="outline" className={`border-blue-500 text-blue-600 dark:text-blue-400 font-normal ${className}`}>
          Open
        </Badge>
      )
    case 'CLAIM_PENDING':
      return (
        <Badge variant="outline" className={`border-purple-500 text-purple-600 dark:text-purple-400 font-normal ${className}`}>
          Claim Pending
        </Badge>
      )
    case 'RESOLVED':
      return (
        <Badge variant="outline" className={`border-emerald-500 text-emerald-600 dark:text-emerald-400 font-normal ${className}`}>
          Recovered / Resolved
        </Badge>
      )
    case 'EXPIRED':
      return (
        <Badge variant="secondary" className={`text-muted-foreground ${className}`}>
          Expired
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className={`text-muted-foreground ${className}`}>
          {status}
        </Badge>
      )
  }
}
