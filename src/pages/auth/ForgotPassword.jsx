import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Send, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import useToast from '../../hooks/useToast'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export default function ForgotPassword() {
  const toast = useToast()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values) {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
        <Card className="w-full rounded-[32px] p-8 sm:p-10">
          <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary-dark">
            ← Back to login
          </Link>
          {!sent ? (
            <>
              <div className="mt-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-7 w-7" />
                </div>
                <h1 className="mt-6 text-3xl font-black text-neutral-900">Forgot your password?</h1>
                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  Enter your email address and we’ll send you a secure reset link.
                </p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@business.com"
                  prefixIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" fullWidth size="lg" loading={isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Sparkles className="h-9 w-9" />
              </div>
              <h1 className="mt-6 text-3xl font-black text-neutral-900">Check your inbox</h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
                We’ve sent a secure reset link to your email address. Open the message and follow the link to update your password.
              </p>
              <div className="mt-8">
                <Link to="/login">
                  <Button variant="outline">Back to login</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
