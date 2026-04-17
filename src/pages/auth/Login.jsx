import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import useToast from '../../hooks/useToast'
import AuthSplitLayout from './AuthSplitLayout'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values) {
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      toast.error('Incorrect email or password. Please try again.')
      return
    }
    navigate('/app/dashboard')
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
      title="Welcome back 👋"
      subtitle="Log in to your BizFlow NG account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@business.com"
          prefixIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
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
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-dark">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Log In
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
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark">
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  )
}
