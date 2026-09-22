import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, MapPin, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
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

  const hasActiveFilters = Boolean(
    division || district || thana || categoryId !== 'all' || type !== 'ALL' || query
  )

  const renderMobileFilterContent = () => (
    <div className="flex flex-col gap-4 mt-2">
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Explore Lost & Found Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Browse verified community listings across all 64 districts and thanas of Bangladesh
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="relative flex-1">
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

          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="size-10 shrink-0">
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
              {renderMobileFilterContent()}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Full-Width Prominent Filter Card */}
      <Card className="hidden md:block border-border/80 p-5 shadow-xs bg-card/60 backdrop-blur-xs">
        <div className="space-y-4">
          {/* Row 1: Search Keyword, Type Toggle, Category, Sort By, Reset */}
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Search Keyword (4 cols) */}
            <div className="col-span-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder="Search by title, description, or landmark..."
                className="pl-9.5 h-10 text-sm bg-background"
              />
            </div>

            {/* Type Toggle (3 cols) */}
            <div className="col-span-3">
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
                    {t === 'ALL' ? 'All Items' : t === 'LOST' ? 'Lost' : 'Found'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Select (3 cols) */}
            <div className="col-span-3">
              <Select
                value={categoryId}
                onValueChange={(val) => {
                  setCategoryId(val)
                  setPage(0)
                }}
              >
                <SelectTrigger className="w-full h-10 bg-background">
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

            {/* Sort Select (2 cols) */}
            <div className="col-span-2">
              <Select
                value={sortBy}
                onValueChange={(val: 'createdAt' | 'incidentDateTime' | 'viewCount') => setSortBy(val)}
              >
                <SelectTrigger className="w-full h-10 bg-background text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest First</SelectItem>
                  <SelectItem value="incidentDateTime">Incident Date</SelectItem>
                  <SelectItem value="viewCount">Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Location Dropdowns in ONE Line (Spacious Full Width) */}
          <div className="border-t border-border/60 pt-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                Bangladesh Location Filter (One-Line Selection)
              </span>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="size-3" />
                  Reset Filters
                </Button>
              )}
            </div>

            {/* Cascading Picker - 3 Columns in ONE Horizontal Line */}
            <BangladeshCascadingPicker
              division={division}
              district={district}
              onChange={handleLocationChange}
            />
          </div>
        </div>
      </Card>

      {/* Results Header Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing {items.length} {items.length === 1 ? 'result' : 'results'}
          {pagination ? ` of ${pagination.totalElements} total items` : ''}
        </span>
        {hasActiveFilters && (
          <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-semibold text-[11px]">
            Filtered View
          </span>
        )}
      </div>

      {/* Full-Width Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/3 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="p-14 text-center border-dashed border-border bg-card/40">
          <CardContent className="space-y-3 p-0">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="size-7 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No matching items found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No reports match your current filter selections. Try searching with different keywords,
              clearing district filters, or toggling between Lost and Found.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground px-3">
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
  )
}
