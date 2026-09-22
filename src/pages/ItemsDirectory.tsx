import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { categoriesApi } from '@/api/categories.api'
import { itemsApi } from '@/api/items.api'
import type { Category, Item, ItemType, PaginationMeta } from '@/api/types'
import { ItemCard } from '@/components/items/ItemCard'
import { BangladeshCascadingPicker } from '@/components/location/BangladeshCascadingPicker'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

export const ItemsDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // State from URL query params
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [type, setType] = useState<ItemType | 'ALL'>((searchParams.get('type') as ItemType) || 'ALL')
  const [categoryId, setCategoryId] = useState<string>(searchParams.get('categoryId') || 'all')
  const [division, setDivision] = useState(searchParams.get('division') || '')
  const [district, setDistrict] = useState(searchParams.get('district') || '')
  const [thana, setThana] = useState(searchParams.get('thana') || '')
  const [sortBy, setSortBy] = useState<'createdAt' | 'incidentDateTime' | 'viewCount'>('createdAt')
  const [page, setPage] = useState(0)

  // Data states
  const [items, setItems] = useState<Item[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | undefined>()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Load categories
  useEffect(() => {
    categoriesApi.getAllActive().then(setCategories).catch(() => {})
  }, [])

  // Fetch items based on active filters
  useEffect(() => {
    let mounted = true
    setLoading(true)

    itemsApi
      .search({
        query: query.trim() || undefined,
        type: type !== 'ALL' ? type : undefined,
        categoryId: categoryId !== 'all' ? parseInt(categoryId, 10) : undefined,
        division: division || undefined,
        district: district || undefined,
        thana: thana || undefined,
        page,
        size: 12,
        sortBy,
        sortDirection: 'DESC',
      })
      .then((res) => {
        if (!mounted) return
        setItems(res.items || [])
        setPagination(res.pagination)
      })
      .catch(() => {
        if (!mounted) return
        setItems([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [query, type, categoryId, division, district, thana, sortBy, page])

  const handleResetFilters = () => {
    setQuery('')
    setType('ALL')
    setCategoryId('all')
    setDivision('')
    setDistrict('')
    setThana('')
    setPage(0)
    setSearchParams({})
  }

  const handleLocationChange = (loc: {
    division: string
    district: string
    thanaName?: string
  }) => {
    setDivision(loc.division)
    setDistrict(loc.district)
    setThana(loc.thanaName || '')
    setPage(0)
  }

  const renderFilterControls = () => (
    <div className="flex flex-col gap-4">
      {/* 1. Item Type Toggle */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          Report Type
        </label>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {(['ALL', 'LOST', 'FOUND'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t)
                setPage(0)
              }}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-all ${
                type === t
                  ? t === 'LOST'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : t === 'FOUND'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-primary text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'ALL' ? 'All' : t === 'LOST' ? 'Lost' : 'Found'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Category Select */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          Category
        </label>
        <Select
          value={categoryId}
          onValueChange={(val) => {
            setCategoryId(val)
            setPage(0)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. Bangladesh Cascading Location */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          Location
        </label>
        <BangladeshCascadingPicker
          division={division}
          district={district}
          onChange={handleLocationChange}
        />
      </div>

      {/* Reset Action */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleResetFilters}
        className="w-full gap-2 mt-2 text-xs text-muted-foreground"
      >
        <RotateCcw className="size-3.5" />
        Reset All Filters
      </Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Explore Lost & Found Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Browse verified community listings across all divisions and districts
          </p>
        </div>

        {/* Search input & Mobile filter trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(0)
              }}
              placeholder="Search keyword..."
              className="pl-9 h-10 text-sm"
            />
          </div>

          {/* Sort By Select */}
          <Select
            value={sortBy}
            onValueChange={(val: 'createdAt' | 'incidentDateTime' | 'viewCount') => setSortBy(val)}
          >
            <SelectTrigger className="w-36 h-10 hidden sm:flex">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest First</SelectItem>
              <SelectItem value="incidentDateTime">Incident Date</SelectItem>
              <SelectItem value="viewCount">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Button */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden size-10 shrink-0">
                <SlidersHorizontal className="size-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader className="text-left mb-4">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <Filter className="size-4 text-primary" />
                  Filter Directory
                </SheetTitle>
              </SheetHeader>
              {renderFilterControls()}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Grid + Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <Card className="sticky top-24 border-border/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Filter className="size-4 text-primary" />
                Filters
              </h3>
            </div>
            {renderFilterControls()}
          </Card>
        </div>

        {/* Results Grid */}
        <div className="md:col-span-3">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
            <span>
              Showing {items.length} {items.length === 1 ? 'result' : 'results'}
              {pagination ? ` of ${pagination.totalElements} items` : ''}
            </span>
            {(division || district || categoryId !== 'all' || type !== 'ALL' || query) && (
              <span className="text-primary font-medium">Filtered</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-border">
              <CardContent className="space-y-3 p-0">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Search className="size-6 opacity-60" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No matching items found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your search keywords, clearing location filters, or switching between
                  Lost and Found types.
                </p>
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                Page {page + 1} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
