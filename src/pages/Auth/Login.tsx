import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Compass, Lock, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/useAuthStore'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) {
      toast.error('Please enter your email/phone and password')
      return
    }

    setLoading(true)
    setPendingVerificationEmail(null)
    try {
      const authData = await authApi.login({
        identifier: identifier.trim(),
        password,
      })
      setAuth(authData)
      toast.success(`Welcome back, ${authData.fullName}!`)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const msg = error.response?.data?.message || 'Failed to login. Please check your credentials.'
      if (msg.toLowerCase().includes('pending email verification') || msg.toLowerCase().includes('verify your email')) {
        setPendingVerificationEmail(identifier.trim())
      }
      toast.error(msg)
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
          <CardTitle className="text-2xl font-bold tracking-tight">Sign In to ReFind</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter your email or phone number to manage your lost & found reports
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {pendingVerificationEmail && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>This account is pending email verification.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/verify-email?email=${encodeURIComponent(pendingVerificationEmail)}`)}
                  className="w-full h-8 text-xs border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                >
                  Verify Email Now
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            )}
            {/* Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <UserIcon className="size-3.5 text-primary" />
                Email or Phone Number
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="shariarnafiz@example.com or +8801700000000"
                required
                autoComplete="username"
                className="h-10 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Lock className="size-3.5 text-primary" />
                  Password
                </label>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-10 text-sm"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={loading} className="w-full h-10 font-semibold gap-1.5 shadow-sm">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="size-4" />}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
