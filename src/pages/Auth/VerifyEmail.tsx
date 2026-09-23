import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, MailCheck, RotateCw, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/useAuthStore'

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const emailParam = searchParams.get('email') || ''
  const [email] = useState(emailParam)

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const [isCooldownActive, setIsCooldownActive] = useState(true)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus the first input on page load
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Cooldown countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (isCooldownActive && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    } else if (cooldown === 0) {
      setIsCooldownActive(false)
    }
    return () => clearInterval(timer)
  }, [isCooldownActive, cooldown])

  const handleInputChange = (index: number, value: string) => {
    // Only accept numeric characters
    const sanitized = value.replace(/\D/g, '')

    if (sanitized.length > 1) {
      // Handle paste directly into an input
      handlePastedCode(sanitized)
      return
    }

    const updated = [...otp]
    updated[index] = sanitized
    setOtp(updated)

    // Automatically focus next input box
    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePastedCode = (pasted: string) => {
    const digits = pasted.replace(/\D/g, '').slice(0, 6).split('')
    if (digits.length === 0) return

    const updated = ['', '', '', '', '', '']
    digits.forEach((digit, i) => {
      if (i < 6) updated[i] = digit
    })
    setOtp(updated)

    // Focus last filled digit or 6th input
    const focusIdx = Math.min(digits.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    handlePastedCode(pastedData)
  }

  const fullOtp = otp.join('')

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!email) {
      toast.error('No email address provided for verification.')
      return
    }

    if (fullOtp.length !== 6) {
      toast.error('Please enter the full 6-digit verification code.')
      return
    }

    setLoading(true)
    try {
      const authData = await authApi.verifyEmail({
        email,
        otp: fullOtp,
      })
      setAuth(authData)
      toast.success('Email verified successfully! Welcome to ReFind.')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Invalid or expired verification code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (isCooldownActive || resending || !email) return

    setResending(true)
    try {
      await authApi.resendOtp({ email })
      toast.success('A new 6-digit verification code has been dispatched to your email.')
      setCooldown(60)
      setIsCooldownActive(true)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to resend verification code. Please wait and try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-xl">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <MailCheck className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Verify Your Email</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            We sent a 6-digit confirmation code to:
            <br />
            <span className="font-semibold text-foreground break-all">{email || 'your email'}</span>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="space-y-6 pt-2">
            {/* 6 OTP Input Boxes */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className="size-11 sm:size-12 rounded-xl border border-input bg-background text-center text-lg sm:text-xl font-bold text-foreground shadow-xs transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Resend Action & Countdown */}
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-primary" />
                Code valid for 10 minutes
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isCooldownActive || resending}
                className="font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {resending ? (
                  <>
                    <RotateCw className="size-3 animate-spin" />
                    Sending...
                  </>
                ) : isCooldownActive ? (
                  `Resend code (${cooldown}s)`
                ) : (
                  'Resend code'
                )}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || fullOtp.length !== 6}
              className="w-full h-10 font-semibold gap-1.5 shadow-sm"
            >
              {loading ? (
                'Verifying code...'
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Verify and Continue
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ArrowLeft className="size-3" />
              <span>Wrong email?</span>
              <Link to="/register" className="font-semibold text-primary hover:underline ml-0.5">
                Register again
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
