import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, Lock, Palette, Save, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi } from '@/api/users.api'
import type { UserPreferences } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'

export const Settings = () => {
  const { user, updateUser } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [secondaryPhone, setSecondaryPhone] = useState(user?.secondaryPhone || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Preferences Form
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    matchAlertsEnabled: true,
    claimAlertsEnabled: true,
    preferredContactMethod: 'EMAIL',
    showPhoneOnClaimApproved: true,
    showEmailOnClaimApproved: true,
    themePreference: 'SYSTEM',
    language: 'en',
  })
  const [savingPrefs, setSavingPrefs] = useState(false)

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    usersApi
      .getPreferences()
      .then(setPreferences)
      .catch(() => {})
  }, [])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await usersApi.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim() || undefined,
        secondaryPhone: secondaryPhone.trim() || undefined,
      })
      updateUser(updated)
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPrefs(true)
    try {
      const updated = await usersApi.updatePreferences(preferences)
      setPreferences(updated)
      toast.success('Preferences saved!')
    } catch {
      toast.error('Failed to save preferences.')
    } finally {
      setSavingPrefs(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }

    setChangingPassword(true)
    try {
      await usersApi.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Failed to change password. Please check your current password.')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Account Settings & Preferences
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage your personal profile, notification alerts, theme appearance, and password security
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Profile Details */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="size-4 text-primary" />
              Personal Profile
            </CardTitle>
            <CardDescription className="text-xs">
              Your name and biography visible on community reports
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Secondary Phone (Optional)</label>
                  <Input
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="+88018..."
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Bio / Notes</label>
                <Textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Volunteer or resident of Dhaka..."
                  className="text-sm"
                />
              </div>

              <Button type="submit" disabled={savingProfile} size="sm" className="gap-2">
                <Save className="size-3.5" />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* 2. Theme & Notification Preferences */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="size-4 text-primary" />
              Appearance & Notifications
            </CardTitle>
            <CardDescription className="text-xs">
              Customize light/dark theme preference and recovery notifications
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePreferencesSubmit}>
            <CardContent className="space-y-5">
              {/* Theme Mode Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Theme Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setTheme(mode)
                        setPreferences({ ...preferences, themePreference: mode.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM' })
                      }}
                      className={`rounded-xl py-2 text-xs font-semibold border capitalize transition-all ${
                        theme === mode
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {mode} Mode
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Checkboxes */}
              <div className="space-y-3 border-t border-border pt-4">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Bell className="size-3.5 text-primary" />
                  Alert Preferences
                </label>

                <div className="space-y-2.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotificationsEnabled}
                      onChange={(e) =>
                        setPreferences({ ...preferences, emailNotificationsEnabled: e.target.checked })
                      }
                      className="rounded border-border text-primary focus:ring-primary size-4"
                    />
                    <span>Email notifications for report updates and matches</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.matchAlertsEnabled}
                      onChange={(e) =>
                        setPreferences({ ...preferences, matchAlertsEnabled: e.target.checked })
                      }
                      className="rounded border-border text-primary focus:ring-primary size-4"
                    />
                    <span>Instant alerts when automated matching detects potential item matches</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.claimAlertsEnabled}
                      onChange={(e) =>
                        setPreferences({ ...preferences, claimAlertsEnabled: e.target.checked })
                      }
                      className="rounded border-border text-primary focus:ring-primary size-4"
                    />
                    <span>Notifications when a seeker submits an ownership claim</span>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={savingPrefs} size="sm" className="gap-2">
                <CheckCircle2 className="size-3.5" />
                {savingPrefs ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* 3. Change Password */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription className="text-xs">
              Update your account password to maintain security
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Current Password</label>
                <Input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 text-sm max-w-md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">New Password</label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <Button type="submit" disabled={changingPassword} size="sm" className="gap-2">
                <Lock className="size-3.5" />
                {changingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
