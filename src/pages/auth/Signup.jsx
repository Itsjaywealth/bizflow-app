import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import useToast from '../../hooks/useToast'
import useAuth from '../../hooks/useAuth'
import AuthSplitLayout from './AuthSplitLayout'
import Seo from '../../components/Seo'
import { ENABLE_GOOGLE_AUTH } from '../../lib/features'
import {
  getPasswordRules,
  getPasswordStrengthMeta,
  passwordRuleLabels,
  securePasswordSchema,
} from '../../lib/authValidation'
import { getEmailVerificationReturnUrl } from '../../lib/appUrls'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: securePasswordSchema,
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms & Privacy Policy' }),
  }),
})

function PasswordRule({ label, passed }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
      passed
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
        : 'bg-neutral-50 text-neutral-500 dark:bg-white/[0.04] dark:text-neutral-400'
    }`}>
      <CheckCircle2 className={`h-4 w-4 ${passed ? 'text-emerald-500' : 'text-neutral-300 dark:text-neutral-500'}`} />
      <span>{label}</span>
    </div>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const toast = useToast()
  const { signInWithGoogle: startGoogleSignIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      acceptedTerms: false,
    },
  })

  const passwordValue = watch('password', '')

  const passwordRules = useMemo(() => getPasswordRules(passwordValue), [passwordValue])

  const passwordStrength = useMemo(() => getPasswordStrengthMeta(passwordRules), [passwordRules])

  async function onSubmit(values) {
    const phone = values.phone.startsWith('+234') ? values.phone : `+234${values.phone.replace(/^0+/, '')}`
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: getEmailVerificationReturnUrl(),
        data: {
          full_name: values.fullName,
          phone,
        },
      },
    })

    if (error) {
      console.error('Email sign-up failed:', error)
      toast.error(error.message)
      return
    }

    localStorage.setItem('bizflow-pending-email', values.email)
    toast.success('Your account has been created. Please verify your email before continuing.')
    navigate('/verify-email', { replace: true, state: { justSignedUp: true, email: values.email } })
  }

  async function handleGoogleSignIn() {
    try {
      await startGoogleSignIn('/app/dashboard')
    } catch (error) {
      console.error('Google sign-in launch failed during signup:', error)
      toast.error('Google login failed. Please try again.')
    }
  }

  return (
    <>
      <Seo
        title="Sign up — BizFlow NG"
        description="Start your BizFlow NG free trial and set up invoicing, payroll, HR, and client management."
        path="/signup"
        noindex
      />
      <AuthSplitLayout
        title="Create your account"
        subtitle="Start your 14-day free trial"
        minimal
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div className="grid gap-4">
            <Input
              label="Full name"
              placeholder="John Doe"
              prefixIcon={<UserRound className="h-4 w-4" />}
              error={errors.fullName?.message}
              autoComplete="name"
              className="min-h-[56px] rounded-2xl border-neutral-200/90 px-4 dark:border-white/10"
              {...register('fullName')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@business.com"
              prefixIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              autoComplete="email"
              className="min-h-[56px] rounded-2xl border-neutral-200/90 px-4 dark:border-white/10"
              {...register('email')}
            />
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Phone number</span>
            <div className={`flex min-h-[56px] items-center overflow-hidden rounded-2xl border bg-white/90 shadow-sm transition-all duration-300 dark:bg-white/5 ${
              errors.phone
                ? 'border-danger'
                : 'border-neutral-200/90 dark:border-brand-glow/10 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15'
            }`}>
              <span className="inline-flex h-full shrink-0 items-center gap-2 border-r border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-semibold text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                <Phone className="h-4 w-4" /> +234
              </span>
              <input
                className="w-full border-0 bg-transparent px-4 py-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
                placeholder="8012345678"
                autoComplete="tel"
                {...register('phone')}
              />
            </div>
            {errors.phone ? <span className="block text-sm font-medium text-danger">{errors.phone.message}</span> : null}
          </label>

          <div className="rounded-[24px] border border-emerald-500/12 bg-[linear-gradient(180deg,rgba(245,252,247,0.95),rgba(255,255,255,0.98))] p-5 shadow-[0_18px_40px_-32px_rgba(22,163,74,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
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
              error={errors.password?.message}
              autoComplete="new-password"
              className="min-h-[56px] rounded-2xl border-neutral-200/90 px-4 dark:border-white/10"
              {...register('password')}
            />

            <div className="mt-4 rounded-[22px] border border-neutral-200/90 bg-white/95 px-4 py-4 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Password requirements</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${passwordStrength.text} ${
                  passwordStrength.label === 'Strong'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10'
                    : passwordStrength.label === 'Good'
                      ? 'bg-emerald-50/70 dark:bg-emerald-500/10'
                      : 'bg-neutral-100 dark:bg-white/[0.05]'
                }`}>{passwordStrength.label}</span>
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

          <label className={`flex items-start gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 ${
            errors.acceptedTerms
              ? 'border-danger bg-red-50/60 dark:bg-red-500/8'
              : 'border-neutral-200 bg-neutral-50/90 dark:border-white/10 dark:bg-white/[0.04]'
          }`}>
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary"
              {...register('acceptedTerms')}
            />
            <span className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              I agree to the{' '}
              <Link to="/terms" className="font-semibold text-primary hover:text-primary-dark">
                Terms
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-semibold text-primary hover:text-primary-dark">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptedTerms ? <span className="block text-sm font-medium text-danger">{errors.acceptedTerms.message}</span> : null}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="min-h-[56px] rounded-2xl">
            {isSubmitting ? 'Creating your account...' : 'Create your account'}
          </Button>

          <p className="text-center text-xs leading-6 text-neutral-500 dark:text-neutral-300">
            We&apos;ll send a verification link to your email
          </p>
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

        <p className={`${ENABLE_GOOGLE_AUTH ? 'mt-7' : 'mt-8'} text-center text-sm text-neutral-500 dark:text-neutral-300`}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Log in
          </Link>
        </p>
      </AuthSplitLayout>
    </>
  )
}

PasswordRule.propTypes = {
  label: PropTypes.string.isRequired,
  passed: PropTypes.bool.isRequired,
}
