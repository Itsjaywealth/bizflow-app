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
  ShieldCheck,
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
    <div className={`flex items-center gap-2 text-xs font-medium ${passed ? 'text-emerald-600' : 'text-neutral-400'}`}>
      <CheckCircle2 className="h-4 w-4" />
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
    formState: { errors, isSubmitting, isValid },
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
      >
        <div className="mb-6 rounded-2xl border border-emerald-500/12 bg-emerald-50/80 px-4 py-4 text-sm leading-7 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
          We&apos;ll send a verification email after signup. Verify your email, then log in again to continue to onboarding and your workspace.
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Full name"
              placeholder="John Doe"
              prefixIcon={<UserRound className="h-4 w-4" />}
              helperText={!errors.fullName ? 'Use the name you want attached to your workspace ownership.' : ''}
              error={errors.fullName?.message}
              autoComplete="name"
              {...register('fullName')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@business.com"
              prefixIcon={<Mail className="h-4 w-4" />}
              helperText={!errors.email ? 'Your verification email will be sent here.' : ''}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Phone number</span>
            <div className={`flex items-center overflow-hidden rounded-xl border bg-white/90 shadow-sm transition-all duration-300 dark:bg-white/5 ${errors.phone ? 'border-danger' : 'border-neutral-200 dark:border-brand-glow/10 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15'}`}>
              <span className="inline-flex h-full items-center gap-2 border-r border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                <Phone className="h-4 w-4" /> +234
              </span>
              <input
                className="w-full border-0 bg-transparent px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
                placeholder="8012345678"
                autoComplete="tel"
                {...register('phone')}
              />
            </div>
            {errors.phone ? <span className="block text-sm font-medium text-danger">{errors.phone.message}</span> : <span className="block text-sm text-neutral-500 dark:text-neutral-300">Use your active business or admin contact number.</span>}
          </label>

          <div className="rounded-[24px] border border-emerald-500/12 bg-[#f9fdfb] p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <Input
              label="Password"
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
              error={errors.password?.message}
              autoComplete="new-password"
              {...register('password')}
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

          <label className={`flex items-start gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 ${errors.acceptedTerms ? 'border-danger bg-red-50/60 dark:bg-red-500/8' : 'border-neutral-200 bg-neutral-50 dark:border-white/10 dark:bg-white/[0.04]'}`}>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Email verification required
            </div>
            {!isValid ? (
              <p className="text-xs leading-6 text-neutral-400">Complete all required fields to continue.</p>
            ) : null}
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            {isSubmitting ? 'Creating your account...' : 'Create Account'}
          </Button>
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
