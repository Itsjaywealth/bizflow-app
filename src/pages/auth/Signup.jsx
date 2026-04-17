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
import AuthSplitLayout from './AuthSplitLayout'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      acceptedTerms: false,
    },
  })

  const passwordRules = useMemo(
    () => ({
      minLength: passwordValue.length >= 8,
      uppercase: /[A-Z]/.test(passwordValue),
      number: /\d/.test(passwordValue),
      symbol: /[^A-Za-z0-9]/.test(passwordValue),
    }),
    [passwordValue]
  )

  const passwordStrength = useMemo(() => {
    const passedCount = Object.values(passwordRules).filter(Boolean).length
    if (passedCount <= 1) return { label: 'Weak', tone: 'bg-red-500', text: 'text-red-500', width: 'w-1/3' }
    if (passedCount <= 3) return { label: 'Fair', tone: 'bg-amber-400', text: 'text-amber-500', width: 'w-2/3' }
    return { label: 'Strong', tone: 'bg-emerald-500', text: 'text-emerald-600', width: 'w-full' }
  }, [passwordRules])

  async function onSubmit(values) {
    const phone = values.phone.startsWith('+234') ? values.phone : `+234${values.phone.replace(/^0+/, '')}`
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          phone,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    localStorage.setItem('bizflow-pending-email', values.email)
    navigate('/verify-email')
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    })
    if (error) toast.error(error.message)
  }

  return (
    <AuthSplitLayout
      title="Create your account"
      subtitle="Start your 14-day free trial"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Full name"
          placeholder="Joseph Egbedi"
          prefixIcon={<UserRound className="h-4 w-4" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@business.com"
          prefixIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-neutral-700">Phone number</span>
          <div className={`flex items-center overflow-hidden rounded-xl border bg-white shadow-sm ${errors.phone ? 'border-danger' : 'border-neutral-200'}`}>
            <span className="inline-flex h-full items-center gap-2 border-r border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-600">
              <Phone className="h-4 w-4" /> +234
            </span>
            <input
              className="w-full border-0 bg-transparent px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              placeholder="8012345678"
              {...register('phone')}
            />
          </div>
          {errors.phone ? <span className="block text-sm font-medium text-danger">{errors.phone.message}</span> : null}
        </label>

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
          {...register('password', {
            onChange: (event) => setPasswordValue(event.target.value),
          })}
        />

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-neutral-700">Password strength</span>
            <span className={`text-sm font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-neutral-200">
            <div className={`h-full rounded-full ${passwordStrength.tone} ${passwordStrength.width}`} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <PasswordRule label="8+ characters" passed={passwordRules.minLength} />
            <PasswordRule label="Uppercase letter" passed={passwordRules.uppercase} />
            <PasswordRule label="Number" passed={passwordRules.number} />
            <PasswordRule label="Symbol" passed={passwordRules.symbol} />
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            {...register('acceptedTerms')}
          />
          <span className="text-sm leading-7 text-neutral-600">
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

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">or continue with</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <Button
        type="button"
        fullWidth
        variant="outline"
        size="lg"
        leftIcon={<Sparkles className="h-4 w-4" />}
        onClick={signInWithGoogle}
      >
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  )
}

PasswordRule.propTypes = {
  label: PropTypes.string.isRequired,
  passed: PropTypes.bool.isRequired,
}
