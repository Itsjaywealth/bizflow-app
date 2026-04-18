import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import useToast from '../../hooks/useToast'
import useAuth from '../../hooks/useAuth'
import AuthSplitLayout from './AuthSplitLayout'
import Seo from '../../components/Seo'
import { ENABLE_GOOGLE_AUTH } from '../../lib/features'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const { signInWithGoogle: startGoogleSignIn, getSafeNextPath } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const statusNotice = useMemo(() => {
    if (searchParams.get('verified') === '1') {
      return 'Email verified successfully. You can log in to continue to your workspace.'
    }
    if (searchParams.get('reset') === '1') {
      return 'Password updated successfully. Log in with your new password.'
    }
    return ''
  }, [searchParams])

  async function onSubmit(values) {
    const nextPath = getSafeNextPath(
      `${location.state?.from?.pathname || '/app/dashboard'}${location.state?.from?.search || ''}${location.state?.from?.hash || ''}`
    )
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      console.error('Email/password login failed:', error)
      toast.error('Incorrect email or password. Please try again.')
      return
    }
    navigate(nextPath, { replace: true })
  }

  async function handleGoogleSignIn() {
    try {
      const nextPath = getSafeNextPath(
        `${location.state?.from?.pathname || '/app/dashboard'}${location.state?.from?.search || ''}${location.state?.from?.hash || ''}`
      )
      await startGoogleSignIn(nextPath)
    } catch (error) {
      console.error('Google sign-in launch failed:', error)
      toast.error('Google login failed. Please try again.')
    }
  }

  return (
    <>
      <Seo
        title="Log in — BizFlow NG"
        description="Log in to your BizFlow NG account and continue managing invoices, payroll, HR, and clients."
        path="/login"
        noindex
      />
      <AuthSplitLayout
        title="Welcome back 👋"
        subtitle="Log in to your BizFlow NG account"
      >
        {location.state?.from ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/12 bg-emerald-50/80 px-4 py-4 text-sm leading-7 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
            Sign in to continue to your secure workspace. We&apos;ll return you to the page you were trying to open.
          </div>
        ) : null}
        {statusNotice ? (
          <div className="mb-6 rounded-2xl border border-emerald-500/12 bg-emerald-50/80 px-4 py-4 text-sm leading-7 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
            {statusNotice}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="grid gap-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@business.com"
              prefixIcon={<Mail className="h-4 w-4" />}
              helperText={!errors.email ? 'Use the email connected to your BizFlow workspace.' : ''}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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
              helperText={!errors.password ? 'Your session stays secure across refresh when login succeeds.' : ''}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Encrypted sign-in
            </div>
            <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-dark">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            {isSubmitting ? 'Signing you in...' : 'Log In'}
          </Button>

          {!isValid ? (
            <p className="text-xs leading-6 text-neutral-400">
              Enter a valid email and password to unlock your workspace.
            </p>
          ) : null}
        </form>

        {ENABLE_GOOGLE_AUTH ? (
          <>
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">or continue with</span>
              <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
            </div>

            <Button
              type="button"
              fullWidth
              variant="outline"
              size="lg"
              leftIcon={<Sparkles className="h-4 w-4" />}
              onClick={handleGoogleSignIn}
            >
              Continue with Google
            </Button>
          </>
        ) : null}

        <p className={`${ENABLE_GOOGLE_AUTH ? 'mt-8' : 'mt-10'} text-center text-sm text-neutral-500`}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </AuthSplitLayout>
    </>
  )
}
