import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  CreditCard,
  FileText,
  Key,
  Laptop,
  PlusCircle,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { categoriesApi } from '@/api/categories.api'
import { itemsApi } from '@/api/items.api'
import type { Category, Item, ItemType } from '@/api/types'
import { ItemCard } from '@/components/items/ItemCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export const Home = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<ItemType | 'ALL'>('ALL')

  const [categories, setCategories] = useState<Category[]>([])
  const [recentLost, setRecentLost] = useState<Item[]>([])
  const [recentFound, setRecentFound] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)

    Promise.allSettled([
      categoriesApi.getAllActive(),
      itemsApi.getRecent('LOST', 4),
      itemsApi.getRecent('FOUND', 4),
    ]).then(([catRes, lostRes, foundRes]) => {
      if (!mounted) return
      if (catRes.status === 'fulfilled') setCategories(catRes.value)
      if (lostRes.status === 'fulfilled') setRecentLost(lostRes.value)
      if (foundRes.status === 'fulfilled') setRecentFound(foundRes.value)
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('query', searchQuery.trim())
    if (selectedType !== 'ALL') params.set('type', selectedType)
    navigate(`/items?${params.toString()}`)
  }

  // Helper icons for categories
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'wallets-purses':
        return <Wallet className="size-5" />
      case 'identity-cards':
        return <CreditCard className="size-5" />
      case 'mobile-phones':
        return <Smartphone className="size-5" />
      case 'electronics-laptops':
        return <Laptop className="size-5" />
      case 'keys':
        return <Key className="size-5" />
      case 'documents':
        return <FileText className="size-5" />
      default:
        return <Compass className="size-5" />
    }
  }

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-border/80 bg-linear-to-b from-primary/5 via-background to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Nationwide Lost & Found Network for Bangladesh</span>
          </div>

          {/* Heading */}
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-3xl mx-auto leading-tight">
            Recover What Matters, <br className="hidden sm:block" />
            <span className="text-primary">Reconnect What’s Lost.</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Search lost IDs, phones, wallets, and valuables across all 64 districts with
            privacy-preserving verification questions and rapid community returns.
          </p>

          {/* Search Box Card */}
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border/80 bg-card p-2 sm:p-3 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2 sm:gap-3">
              {/* Type Pills */}
              <div className="flex items-center gap-1.5 px-1">
                {(['ALL', 'LOST', 'FOUND'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      selectedType === type
                        ? type === 'LOST'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : type === 'FOUND'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-primary text-white shadow-xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {type === 'ALL' ? 'All Items' : type === 'LOST' ? 'Lost Items' : 'Found Items'}
                  </button>
                ))}
              </div>

              {/* Input + Action */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by item name, model, landmark, or district..."
                    className="h-12 pl-10 pr-4 text-sm rounded-xl border-border bg-background"
                  />
                </div>
                <Button type="submit" className="h-12 px-5 sm:px-7 rounded-xl font-semibold gap-1.5 shadow-sm">
                  Search
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Live Platform Stats */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 border-t border-border/60 pt-8 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">64</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Districts Covered</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">100%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Privacy Protected</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">Zero</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Platform Fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Quick Browse */}
      <section className="py-12 border-b border-border/80 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Popular Categories</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Browse commonly reported lost and found valuables
              </p>
            </div>
            <Button variant="ghost" asChild size="sm">
              <Link to="/items" className="gap-1 text-primary">
                View all <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.length > 0
              ? categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/items?categoryId=${cat.id}`}
                    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                  >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-2">
                      {getCategoryIcon(cat.slug)}
                    </div>
                    <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {cat.name}
                    </span>
                  </Link>
                ))
              : Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
          </div>
        </div>
      </section>

      {/* 3. Recent Feeds (Lost & Found) */}
      <section className="py-14 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Recently Lost */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recently Lost</h2>
              </div>
              <Button variant="ghost" asChild size="sm">
                <Link to="/items?type=LOST" className="gap-1 text-amber-600">
                  See more lost items <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
                ))}
              </div>
            ) : recentLost.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recentLost.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No recent lost items found in the registry.
              </div>
            )}
          </div>

          {/* Recently Found */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recently Found</h2>
              </div>
              <Button variant="ghost" asChild size="sm">
                <Link to="/items?type=FOUND" className="gap-1 text-emerald-600">
                  See more found items <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
                ))}
              </div>
            ) : recentFound.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recentFound.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
                No recent found items reported yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Trust & Security Architecture Banner */}
      <section className="border-t border-border/80 py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Designed for Maximum Privacy & Trust
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Returning items should be safe for both finders and seekers. Here is how ReFind protects you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Shield className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Secret Question Verification</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Finders can set a private question (e.g. &ldquo;What photo is inside the wallet?&rdquo;). Seekers must answer accurately before claims are accepted.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Masked Contact Protection</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Phone numbers and personal emails remain hidden from the public. Contact details are only unlocked once ownership proof is verified.
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
                <Sparkles className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Division & Thana Precision</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Filter and locate items through Bangladesh’s 8 divisions, 64 districts, and 495+ thanas without leaking sensitive home addresses.
              </p>
            </div>
          </div>

          {/* Action Banner */}
          <div className="mt-14 rounded-3xl bg-linear-to-r from-primary to-blue-700 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold">Have you lost or found something?</h3>
              <p className="mt-1 text-sm text-blue-100 max-w-xl">
                Post a report in less than 2 minutes. Our platform notifies potential matches automatically.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button asChild variant="secondary" size="lg" className="font-semibold shadow-md">
                <Link to="/report">
                  <PlusCircle className="mr-2 size-4" />
                  Report Item Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
