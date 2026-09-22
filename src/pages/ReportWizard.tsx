import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Compass,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Lock,
  MapPin,
  Sparkles,
  Tag,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { categoriesApi } from '@/api/categories.api'
import { itemsApi } from '@/api/items.api'
import { mediaApi } from '@/api/media.api'
import type { Category, ItemType, MediaUploadResponse } from '@/api/types'
import { BangladeshCascadingPicker } from '@/components/location/BangladeshCascadingPicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/useAuthStore'

export const ReportWizard = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // Stepper state (1, 2, 3)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1: Basics
  const [type, setType] = useState<ItemType>('LOST')
  const [categoryId, setCategoryId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Step 2: Time & Location
  const [incidentDateTime, setIncidentDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [division, setDivision] = useState('')
  const [district, setDistrict] = useState('')
  const [thanaId, setThanaId] = useState<number | undefined>()
  const [thanaName, setThanaName] = useState('')
  const [specificLocationHint, setSpecificLocationHint] = useState('')

  // Step 3: Photos & Verification
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResponse[]>([])
  const [primaryMediaId, setPrimaryMediaId] = useState<number | undefined>()
  const [uploadingImage, setUploadingImage] = useState(false)
  const [secretQuestion, setSecretQuestion] = useState('')
  const [secretAnswer, setSecretAnswer] = useState('')

  // Submitting
  const [submitting, setSubmitting] = useState(false)

  // Categories list
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please sign in or register to report an item.')
      navigate('/login?from=/report')
      return
    }

    categoriesApi.getAllActive().then(setCategories).catch(() => {})
  }, [isAuthenticated, navigate])

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const cleaned = tagInput.trim().toLowerCase().replace('#', '')
      if (!tags.includes(cleaned)) {
        setTags([...tags, cleaned])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const uploaded = await mediaApi.upload(file, 'items')
        setUploadedMedia((prev) => {
          const next = [...prev, uploaded]
          if (!primaryMediaId) setPrimaryMediaId(uploaded.id)
          return next
        })
      }
      toast.success('Photo(s) uploaded successfully!')
    } catch {
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleRemoveMedia = (idToRemove: number) => {
    setUploadedMedia((prev) => {
      const next = prev.filter((m) => m.id !== idToRemove)
      if (primaryMediaId === idToRemove) {
        setPrimaryMediaId(next[0]?.id)
      }
      return next
    })
  }

  const validateStep1 = () => {
    if (!title.trim()) {
      toast.error('Please enter an item title.')
      return false
    }
    if (!categoryId) {
      toast.error('Please choose a category.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!division || !district) {
      toast.error('Please select both division and district.')
      return false
    }
    if (!incidentDateTime) {
      toast.error('Please specify the incident date and time.')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!thanaId) {
      toast.error('Please select a thana / upazila from the location selector.')
      setStep(2)
      return
    }

    setSubmitting(true)
    try {
      const item = await itemsApi.create({
        type,
        categoryId: parseInt(categoryId, 10),
        locationId: thanaId,
        title: title.trim(),
        description: description.trim() || undefined,
        specificLocationHint: specificLocationHint.trim() || undefined,
        incidentDateTime: new Date(incidentDateTime).toISOString(),
        secretIdentifierQuestion: type === 'FOUND' && secretQuestion.trim() ? secretQuestion.trim() : undefined,
        secretIdentifierAnswer: type === 'FOUND' && secretAnswer.trim() ? secretAnswer.trim() : undefined,
        tags: tags.length > 0 ? tags : undefined,
        mediaIds: uploadedMedia.map((m) => m.id),
        primaryMediaId,
      })

      toast.success('Item reported successfully!')
      navigate(`/items/${item.id}`)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to submit report. Please check your inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
          <Sparkles className="size-3.5" />
          <span>Frictionless 3-Step Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Report a Lost or Found Item
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Provide accurate details to help with zero-knowledge matching and recovery
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="mb-8 grid grid-cols-3 gap-2 text-center">
        {[
          { num: 1, title: 'Identification' },
          { num: 2, title: 'Time & Location' },
          { num: 3, title: 'Photos & Security' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex flex-col items-center gap-1.5 border-b-2 pb-2 transition-all ${
              step >= s.num
                ? 'border-primary text-primary font-semibold'
                : 'border-border text-muted-foreground'
            }`}
          >
            <div
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                step >= s.num ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.num}
            </div>
            <span className="text-[11px] sm:text-xs truncate">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Wizard Form Card */}
      <Card className="border-border/80 shadow-md">
        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Item Identification</CardTitle>
              <CardDescription className="text-xs">
                Choose whether you lost or found this item and describe it accurately
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('LOST')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                      type === 'LOST'
                        ? 'border-amber-600 bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20'
                        : 'border-border hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Tag className="size-4" />
                    I Lost an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('FOUND')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${
                      type === 'FOUND'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'border-border hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <CheckCircle2 className="size-4" />
                    I Found an Item
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category *</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Item Title *</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Bifold Leather Wallet with DU ID card"
                  required
                  className="h-10 text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Detailed Description</label>
                <Textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide physical details like brand, color, scratches, or contents without revealing secret verification answers..."
                  className="text-sm"
                />
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Search Tags (Press Enter or comma to add)
                </label>
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="e.g. wallet, leather, black, curzon"
                  className="h-10 text-sm"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2)
                  }}
                  className="gap-2"
                >
                  Next: Time & Location
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Time & Location</CardTitle>
              <CardDescription className="text-xs">
                Specify when and where the incident occurred across Bangladesh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Incident Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="size-3.5 text-primary" />
                  Incident Date & Time *
                </label>
                <Input
                  type="datetime-local"
                  value={incidentDateTime}
                  onChange={(e) => setIncidentDateTime(e.target.value)}
                  max={new Date().toISOString().slice(0, 16)}
                  required
                  className="h-10 text-sm"
                />
              </div>

              {/* Bangladesh Cascading Location Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="size-3.5 text-primary" />
                  Division, District & Thana *
                </label>
                <BangladeshCascadingPicker
                  division={division}
                  district={district}
                  thanaId={thanaId}
                  onChange={(loc) => {
                    setDivision(loc.division)
                    setDistrict(loc.district)
                    setThanaId(loc.thanaId)
                    setThanaName(loc.thanaName || '')
                  }}
                />
              </div>

              {/* Specific Landmark Hint */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Compass className="size-3.5 text-primary" />
                  Specific Landmark / Street Hint
                </label>
                <Input
                  type="text"
                  value={specificLocationHint}
                  onChange={(e) => setSpecificLocationHint(e.target.value)}
                  placeholder="e.g. Near Gate 2, Curzon Hall or Dhanmondi Lake Bench #4"
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3)
                  }}
                  className="gap-2"
                >
                  Next: Photos & Verification
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <CardHeader>
              <CardTitle className="text-lg">Step 3: Photos & Verification Security</CardTitle>
              <CardDescription className="text-xs">
                Upload clear images and configure ownership challenge questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Photo Upload Zone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ImageIcon className="size-3.5 text-primary" />
                  Upload Photos
                </label>

                <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/60 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    {uploadingImage ? (
                      <Loader2 className="size-8 text-primary animate-spin mb-2" />
                    ) : (
                      <Upload className="size-8 text-muted-foreground mb-2" />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      Click to upload photos
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, or WebP up to 10MB each
                    </span>
                  </label>
                </div>

                {/* Uploaded Photos Preview List */}
                {uploadedMedia.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                    {uploadedMedia.map((m) => (
                      <div
                        key={m.id}
                        className={`relative aspect-square rounded-xl overflow-hidden border ${
                          primaryMediaId === m.id ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                        }`}
                      >
                        <img src={m.fileUrl} alt="Upload preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(m.id)}
                          className="absolute top-1 right-1 size-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-destructive"
                        >
                          <X className="size-3" />
                        </button>
                        {primaryMediaId === m.id && (
                          <span className="absolute bottom-1 left-1 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                            COVER
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ownership Verification Challenge (if FOUND item) */}
              {type === 'FOUND' && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                    <HelpCircle className="size-4" />
                    Zero-Knowledge Ownership Challenge
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Protect the item from fraudulent claims. Set a question only the true owner could answer.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Verification Question</label>
                    <Input
                      type="text"
                      value={secretQuestion}
                      onChange={(e) => setSecretQuestion(e.target.value)}
                      placeholder="e.g. What sticker is on the back or what photo is inside the wallet?"
                      className="h-10 text-sm bg-background"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Lock className="size-3 text-amber-600" />
                      Secret Expected Answer (Private - never shown publicly)
                    </label>
                    <Input
                      type="text"
                      value={secretAnswer}
                      onChange={(e) => setSecretAnswer(e.target.value)}
                      placeholder="e.g. Red Bull sticker / Student ID card of Dhaka University"
                      className="h-10 text-sm bg-background"
                    />
                  </div>
                </div>
              )}

              {/* Summary Review Card */}
              <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs space-y-2">
                <p className="font-semibold text-foreground text-sm">Review Summary</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div><strong className="text-foreground">Type:</strong> {type}</div>
                  <div><strong className="text-foreground">Title:</strong> {title}</div>
                  <div><strong className="text-foreground">Location:</strong> {thanaName || district || division}</div>
                  <div><strong className="text-foreground">Photos:</strong> {uploadedMedia.length} attached</div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="gap-2 font-semibold shadow-sm"
                >
                  {submitting ? 'Submitting Report...' : 'Publish Report'}
                  {!submitting && <CheckCircle2 className="size-4" />}
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </div>
  )
}
