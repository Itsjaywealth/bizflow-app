import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import useToast from '../hooks/useToast'
import { getPasswordResetUrl } from '../lib/appUrls'
import {
  getPasswordRules,
  getPasswordStrengthMeta,
  passwordRuleLabels,
  securePasswordSchema,
} from '../lib/authValidation'

const requestSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

const resetSchema = z.object({
  password: securePasswordSchema,
})

function PasswordRule({ label, passed }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium ${passed ? 'text-emerald-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
      <CheckCircle2 className="h-4 w-4" />
      <span>{label}</span>
    </div>
  )
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [hasSession, setHasSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const requestForm = useForm({
    resolver: zodResolver(requestSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      email: '',
    },
  })

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      password: '',
    },
  })

  const passwordValue = resetForm.watch('password', '')
  const passwordRules = useMemo(() => getPasswordRules(passwordValue), [passwordValue])
  const passwordStrength = useMemo(() => getPasswordStrengthMeta(passwordRules), [passwordRules])

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setHasSession(Boolean(data.session))
      setCheckingSession(false)
    }

    bootstrap()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(Boolean(session))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleRequestReset(values) {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: getPasswordResetUrl(),
    })

    if (error) {
      console.error('Password reset email request failed:', error)
      toast.error(error.message)
      return
    }

    setResetSent(true)
    toast.success('Password reset email sent.')
  }

  async function handleUpdatePassword(values) {
    const { error } = await supabase.auth.updateUser({ password: values.password })

    if (error) {
      console.error('Password update failed:', error)
      toast.error(error.message)
      return
    }

    toast.success('Password updated successfully.')
    navigate('/login?reset=1', { replace: true })
  }

  const activeForm = hasSession ? resetForm : requestForm
  const formErrors = activeForm.formState.errors
  const isSubmitting = activeForm.formState.isSubmitting

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <Seo
        title="Reset password — BizFlow NG"
        description="Reset your BizFlow NG password securely and regain access to your account."
        path="/reset-password"
        noindex
      />
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <Card className="w-full rounded-[32px] p-8 sm:p-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mt-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              {hasSession ? <KeyRound className="h-7 w-7" /> : <Mail className="h-7 w-7" />}
            </div>
            <h1 className="mt-6 text-3xl font-black text-neutral-900 dark:text-white">
              {hasSession ? 'Choose a new password' : 'Reset your password'}
            </h1>
            <p className="mt-3 text-sm leading-7 text-neutral-500 dark:text-neutral-300">
              {checkingSession
                ? 'Checking your secure recovery session...'
                : hasSession
                  ? 'Set a new secure password for your BizFlow NG account.'
                  : 'Enter your account email and we’ll send you a secure reset link.'}
            </p>
          </div>

          {!hasSession && resetSent ? (
            <div className="mt-8 rounded-3xl border border-emerald-500/12 bg-emerald-50/80 px-5 py-5 text-sm leading-7 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
              We’ve sent a secure password reset link to your inbox. Open the email and continue from the link to choose a new password.
            </div>
          ) : null}

          {hasSession ? (
            <form onSubmit={resetForm.handleSubmit(handleUpdatePassword)} noValidate className="mt-8 space-y-5">
              <div className="rounded-[24px] border border-emerald-500/12 bg-[#f9fdfb] p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a secure password"
                  prefixIcon={<LockKeyhole className="h-4 w-4" />}
                  suffixIcon={
                    <button
                      type="button"
                      className="text-neutral-400 transition-colors hover:text-primary"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  autoComplete="new-password"
                  error={formErrors.password?.message}
                  {...resetForm.register('password')}
                />

                <div className="mt-5 rounded-2xl border border-neutral-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Password strength</span>
                    <span className={`text-sm font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-neutral-200 dark:bg-white/10">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.tone} ${passwordStrength.width}`} />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <PasswordRule label={passwordRuleLabels.minLength} passed={passwordRules.minLength} />
                    <PasswordRule label={passwordRuleLabels.uppercase} passed={passwordRules.uppercase} />
                    <PasswordRule label={passwordRuleLabels.number} passed={passwordRules.number} />
                    <PasswordRule label={passwordRuleLabels.symbol} passed={passwordRules.symbol} />
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure password update
              </div>

              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                {isSubmitting ? 'Saving your new password...' : 'Save New Password'}
              </Button>
            </form>
          ) : (
            <form onSubmit={requestForm.handleSubmit(handleRequestReset)} noValidate className="mt-8 space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@business.com"
                prefixIcon={<Mail className="h-4 w-4" />}
                helperText={!formErrors.email ? 'We’ll send the secure reset link to this inbox.' : ''}
                error={formErrors.email?.message}
                autoComplete="email"
                {...requestForm.register('email')}
              />

              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
