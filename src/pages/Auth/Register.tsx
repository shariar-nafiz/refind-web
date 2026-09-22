import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, Lock, Mail, Phone, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/useAuthStore'

export const Register = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      toast.error('Please fill in all required fields.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    // Format phone number if missing country code
    let formattedPhone = phone.trim()
    if (!formattedPhone.startsWith('+880') && formattedPhone.startsWith('01')) {
      formattedPhone = '+88' + formattedPhone
    }

    setLoading(true)
    try {
      const authData = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: formattedPhone,
        password,
      })
      setAuth(authData)
      toast.success('Account created successfully! Welcome to ReFind.')
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; errors?: Array<{ field: string; message: string }> } }
      }
      const validationMsg = error.response?.data?.errors?.[0]?.message
      toast.error(validationMsg || error.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xs">
            <Compass className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Join ReFind Bangladesh to report lost items and verify claims
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <UserIcon className="size-3.5 text-primary" />
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Shariar Nafiz"
                required
                className="h-10 text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Mail className="size-3.5 text-primary" />
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shariarnafiz@example.com"
                required
                className="h-10 text-sm"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Phone className="size-3.5 text-primary" />
                Phone Number (Bangladesh)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712345678 or +8801712345678"
                required
                className="h-10 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Lock className="size-3.5 text-primary" />
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 text-sm"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Lock className="size-3.5 text-primary" />
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-10 text-sm"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={loading} className="w-full h-10 font-semibold gap-1.5 shadow-sm">
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="size-4" />}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
