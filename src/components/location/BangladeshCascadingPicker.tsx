import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { locationsApi } from '@/api/locations.api'
import type { Thana } from '@/api/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BangladeshCascadingPickerProps {
  division?: string
  district?: string
  thanaId?: number
  onChange: (values: {
    division: string
    district: string
    thanaId?: number
    thanaName?: string
  }) => void
  disabled?: boolean
  required?: boolean
}

export const BangladeshCascadingPicker = ({
  division = '',
  district = '',
  thanaId,
  onChange,
  disabled = false,
}: BangladeshCascadingPickerProps) => {
  const [divisions, setDivisions] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [thanas, setThanas] = useState<Thana[]>([])

  const [loadingDivisions, setLoadingDivisions] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingThanas, setLoadingThanas] = useState(false)

  // 1. Fetch Divisions on mount
  useEffect(() => {
    let mounted = true
    setLoadingDivisions(true)
    locationsApi
      .getDivisions()
      .then((data) => {
        if (mounted) setDivisions(data)
      })
      .catch(() => {
        // Fallback standard 8 divisions of Bangladesh if offline/error
        if (mounted) {
          setDivisions([
            'Barishal',
            'Chattogram',
            'Dhaka',
            'Khulna',
            'Mymensingh',
            'Rajshahi',
            'Rangpur',
            'Sylhet',
          ])
        }
      })
      .finally(() => {
        if (mounted) setLoadingDivisions(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  // 2. Fetch Districts when division changes
  useEffect(() => {
    if (!division) {
      setDistricts([])
      return
    }

    let mounted = true
    setLoadingDistricts(true)
    locationsApi
      .getDistrictsByDivision(division)
      .then((data) => {
        if (mounted) setDistricts(data)
      })
      .catch(() => {
        if (mounted) setDistricts([])
      })
      .finally(() => {
        if (mounted) setLoadingDistricts(false)
      })
    return () => {
      mounted = false
    }
  }, [division])

  // 3. Fetch Thanas when district changes
  useEffect(() => {
    if (!district) {
      setThanas([])
      return
    }

    let mounted = true
    setLoadingThanas(true)
    locationsApi
      .getThanasByDistrict(district)
      .then((data) => {
        if (mounted) setThanas(data)
      })
      .catch(() => {
        if (mounted) setThanas([])
      })
      .finally(() => {
        if (mounted) setLoadingThanas(false)
      })
    return () => {
      mounted = false
    }
  }, [district])

  const handleDivisionChange = (newDivision: string) => {
    onChange({
      division: newDivision,
      district: '',
      thanaId: undefined,
      thanaName: undefined,
    })
  }

  const handleDistrictChange = (newDistrict: string) => {
    onChange({
      division,
      district: newDistrict,
      thanaId: undefined,
      thanaName: undefined,
    })
  }

  const handleThanaChange = (newThanaIdStr: string) => {
    const id = parseInt(newThanaIdStr, 10)
    const selected = thanas.find((t) => t.id === id)
    onChange({
      division,
      district,
      thanaId: id,
      thanaName: selected?.thana,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. Division */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <MapPin className="size-3 text-primary" />
          Division
        </label>
        <Select
          value={division}
          onValueChange={handleDivisionChange}
          disabled={disabled || loadingDivisions}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loadingDivisions ? 'Loading...' : 'Select Division'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Bangladesh Divisions</SelectLabel>
              {divisions.map((div) => (
                <SelectItem key={div} value={div}>
                  {div}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* 2. District */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">District</label>
        <Select
          value={district}
          onValueChange={handleDistrictChange}
          disabled={disabled || !division || loadingDistricts}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                !division
                  ? 'Select division first'
                  : loadingDistricts
                  ? 'Loading...'
                  : 'Select District'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{division ? `${division} Districts` : 'Districts'}</SelectLabel>
              {districts.map((dist) => (
                <SelectItem key={dist} value={dist}>
                  {dist}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Thana / Upazila */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Thana / Upazila</label>
        <Select
          value={thanaId ? String(thanaId) : ''}
          onValueChange={handleThanaChange}
          disabled={disabled || !district || loadingThanas}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                !district
                  ? 'Select district first'
                  : loadingThanas
                  ? 'Loading...'
                  : 'Select Thana'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{district ? `${district} Thanas` : 'Thanas'}</SelectLabel>
              {thanas.map((th) => (
                <SelectItem key={th.id} value={String(th.id)}>
                  {th.thana}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
