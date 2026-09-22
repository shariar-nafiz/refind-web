import { useEffect, useState } from 'react'
import { Check, Home, MapPin, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi } from '@/api/users.api'
import type { Address } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

export const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  // Add address dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('Dhaka')
  const [state] = useState('Dhaka')
  const [postalCode, setPostalCode] = useState('1209')
  const [addressType, setAddressType] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME')
  const [adding, setAdding] = useState(false)

  const fetchAddresses = () => {
    setLoading(true)
    usersApi
      .getAddresses()
      .then((data) => setAddresses(data || []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!streetAddress.trim()) {
      toast.error('Please enter street address.')
      return
    }

    setAdding(true)
    try {
      await usersApi.addAddress({
        addressType,
        country: 'Bangladesh',
        city,
        state,
        streetAddress: streetAddress.trim(),
        postalCode,
        isDefault: addresses.length === 0,
      })
      toast.success('Address added successfully!')
      setDialogOpen(false)
      setStreetAddress('')
      fetchAddresses()
    } catch {
      toast.error('Failed to add address.')
    } finally {
      setAdding(false)
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await usersApi.setDefaultAddress(id)
      toast.success('Default address updated.')
      fetchAddresses()
    } catch {
      toast.error('Failed to update default address.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this address?')) return
    try {
      await usersApi.deleteAddress(id)
      toast.success('Address deleted.')
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch {
      toast.error('Failed to delete address.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Saved Addresses
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage your default handover and notification address locations
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 shadow-sm">
              <Plus className="size-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription className="text-xs">
                Save an address for rapid item reporting and verified handovers.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddAddress} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddressType(t)}
                      className={`rounded-lg py-1.5 text-xs font-semibold border ${
                        addressType === t
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Street Address *</label>
                <Input
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="House 12, Road 27, Dhanmondi"
                  className="h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">City</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Postal Code</label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={adding}>
                  {adding ? 'Saving...' : 'Save Address'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`border p-5 relative transition-all ${
                addr.isDefault ? 'border-primary/60 bg-primary/5' : 'border-border/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Home className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground uppercase">{addr.addressType}</span>
                    {addr.isDefault && (
                      <span className="ml-2 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(addr.id)}
                  className="size-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
                <p className="font-semibold text-foreground">{addr.streetAddress}</p>
                <p>
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
              </div>

              {!addr.isDefault && (
                <div className="mt-4 border-t border-border/60 pt-3">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Check className="size-3.5" />
                    Set as default address
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center border-dashed border-border">
          <CardContent className="space-y-3 p-0">
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <MapPin className="size-5 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No saved addresses</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add your home or work address for quicker reporting and matching in your local thana.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
