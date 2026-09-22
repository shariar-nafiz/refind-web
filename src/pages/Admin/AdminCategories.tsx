import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FolderTree, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { categoriesApi } from '@/api/categories.api'
import type { Category } from '@/api/types'
import { Badge } from '@/components/ui/badge'
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

export const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [iconName, setIconName] = useState('tag')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchCategories = () => {
    setLoading(true)
    categoriesApi
      .adminGetAll()
      .then(setCategories)
      .catch(() => {
        // Fallback to active categories if admin endpoint requires special seed
        categoriesApi.getAllActive().then(setCategories).catch(() => setCategories([]))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setCreating(true)
    try {
      await categoriesApi.adminCreate({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        iconName,
        description: description.trim() || undefined,
        isActive: true,
      })
      toast.success('Category created successfully!')
      setOpen(false)
      setName('')
      setSlug('')
      setDescription('')
      fetchCategories()
    } catch {
      toast.error('Failed to create category.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await categoriesApi.adminDelete(id)
      toast.success('Category deleted.')
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch {
      toast.error('Failed to delete category.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-muted-foreground gap-1.5">
        <Link to="/admin">
          <ArrowLeft className="size-4" />
          Back to Admin Portal
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Category Registry
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Add and manage item classifications displayed in search filters and reporting wizards
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 shadow-sm">
              <Plus className="size-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription className="text-xs">
                Add a new category for lost and found classification.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category Name *</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                  }}
                  placeholder="e.g. Bicycles & Vehicles"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Slug Identifier</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. bicycles-vehicles"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Icon Name</label>
                <Input
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="e.g. bike, car, laptop"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bicycles, motorbikes, accessories..."
                  className="h-10 text-sm"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-border/80 p-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <FolderTree className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{cat.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">/{cat.slug}</span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {cat.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
                    className="size-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
