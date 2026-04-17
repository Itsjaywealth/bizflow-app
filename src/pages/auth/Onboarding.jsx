import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ImagePlus,
  Layers3,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import useToast from '../../hooks/useToast'

const businessTypes = ['Retail', 'Services', 'Logistics', 'Tech', 'Food', 'Fashion', 'Other']
const teamSizes = ['Just me', '2–5', '6–20', '21–50', '50+']
const useCases = ['Invoicing', 'Payroll', 'Client Management', 'HR', 'Reports', 'All of the above']

const baseSchema = z.object({
  businessName: z.string().min(2, 'Enter your business name'),
  businessType: z.string().min(1, 'Select a business type'),
  businessAddress: z.string().min(3, 'Enter your business address'),
  businessPhone: z.string().min(7, 'Enter your business phone'),
  logoUrl: z.string().optional(),
  teamSize: z.string().optional(),
  useCases: z.array(z.string()).optional(),
  firstClientName: z.string().optional(),
  firstServiceDescription: z.string().optional(),
  firstInvoiceAmount: z.string().optional(),
})

function initialWizardState() {
  return {
    businessName: '',
    businessType: '',
    businessAddress: '',
    businessPhone: '',
    logoUrl: '',
    teamSize: '',
    useCases: [],
    firstClientName: '',
    firstServiceDescription: '',
    firstInvoiceAmount: '',
  }
}

export default function Onboarding({ setBusiness }) {
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [savingStep, setSavingStep] = useState(false)
  const [userId, setUserId] = useState(null)
  const [existingBusiness, setExistingBusiness] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [draft, setDraft] = useState(initialWizardState())

  const {
    register,
    trigger,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(baseSchema),
    mode: 'onChange',
    defaultValues: draft,
  })

  useEffect(() => {
    let mounted = true
    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted || !user) return
      setUserId(user.id)
      const metadataDraft = user.user_metadata?.onboarding_draft || {}
      const nextDraft = { ...initialWizardState(), ...metadataDraft }
      setDraft(nextDraft)
      Object.entries(nextDraft).forEach(([field, value]) => {
        setValue(field, value || '', { shouldDirty: false })
      })
      setLogoPreview(nextDraft.logoUrl || '')

      const { data: businessRecord } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (businessRecord) setExistingBusiness(businessRecord)
    }
    bootstrap()
    return () => {
      mounted = false
    }
  }, [setValue])

  useEffect(() => {
    if (step === 4) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      })
    }
  }, [step])

  const stepPercent = ((step + 1) / 5) * 100
  const teamSize = watch('teamSize') || draft.teamSize
  const selectedUseCases = watch('useCases') || draft.useCases || []

  async function persistDraft(values) {
    if (!userId) return
    const nextDraft = { ...draft, ...values }
    setDraft(nextDraft)
    await supabase.auth.updateUser({
      data: {
        onboarding_draft: nextDraft,
      },
    })
  }

  async function ensureBusinessRecord(values) {
    const payload = {
      name: values.businessName,
      address: values.businessAddress,
      phone: values.businessPhone,
      logo_url: values.logoUrl || '',
      email: existingBusiness?.email || '',
    }

    if (existingBusiness) {
      const { data } = await supabase
        .from('businesses')
        .update(payload)
        .eq('id', existingBusiness.id)
        .select()
        .single()
      setExistingBusiness(data)
      setBusiness(data)
      return data
    }

    const { data } = await supabase
      .from('businesses')
      .insert({ ...payload, user_id: userId })
      .select()
      .single()
    setExistingBusiness(data)
    setBusiness(data)
    return data
  }

  async function createFirstInvoice(values, businessRecord) {
    if (!values.firstClientName || !values.firstServiceDescription || !values.firstInvoiceAmount) return

    const { data: client } = await supabase
      .from('clients')
      .insert({
        business_id: businessRecord.id,
        name: values.firstClientName,
      })
      .select()
      .single()

    const amount = Number(values.firstInvoiceAmount)
    await supabase.from('invoices').insert({
      business_id: businessRecord.id,
      client_id: client?.id || null,
      invoice_number: `BF-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      public_token: crypto.randomUUID(),
      business_snapshot: {
        name: businessRecord.name,
        phone: businessRecord.phone,
        email: businessRecord.email,
        address: businessRecord.address,
        logo_url: businessRecord.logo_url,
      },
      client_snapshot: {
        name: values.firstClientName,
      },
      items: [
        {
          description: values.firstServiceDescription,
          qty: 1,
          price: amount,
        },
      ],
      subtotal: amount,
      tax: amount * 0.075,
      total: amount * 1.075,
      status: 'draft',
    })
  }

  async function handleContinue() {
    const values = getValues()

    if (step === 0) {
      const valid = await trigger(['businessName', 'businessType', 'businessAddress', 'businessPhone'])
      if (!valid) return
      setSavingStep(true)
      await persistDraft(values)
      await ensureBusinessRecord(values)
      setSavingStep(false)
      setStep(1)
      return
    }

    if (step === 1) {
      if (!teamSize) {
        toast.error('Select your team size to continue.')
        return
      }
      setSavingStep(true)
      await persistDraft({ ...values, teamSize })
      setSavingStep(false)
      setStep(2)
      return
    }

    if (step === 2) {
      if (!selectedUseCases.length) {
        toast.error('Choose at least one use case to continue.')
        return
      }
      setSavingStep(true)
      await persistDraft({ ...values, useCases: selectedUseCases })
      setSavingStep(false)
      setStep(3)
      return
    }

    if (step === 3) {
      setSavingStep(true)
      await persistDraft(values)
      const businessRecord = await ensureBusinessRecord(values)
      await createFirstInvoice(values, businessRecord)
      setSavingStep(false)
      setStep(4)
    }
  }

  async function skipStep() {
    if (step === 3) {
      const values = getValues()
      setSavingStep(true)
      await persistDraft(values)
      await ensureBusinessRecord(values)
      setSavingStep(false)
      setStep(4)
      return
    }

    setStep((current) => Math.min(current + 1, 4))
  }

  async function uploadLogo(event) {
    const file = event.target.files?.[0]
    if (!file || !userId) return
    const ext = file.name.split('.').pop()
    const path = `${userId}/logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('business-logos').upload(path, file, { upsert: true })
    if (error) {
      toast.error('Logo upload requires the business-logos storage bucket.')
      return
    }
    const { data } = supabase.storage.from('business-logos').getPublicUrl(path)
    setLogoPreview(data.publicUrl)
    setValue('logoUrl', data.publicUrl, { shouldValidate: true, shouldDirty: true })
    await persistDraft({ ...getValues(), logoUrl: data.publicUrl })
  }

  function toggleUseCase(item) {
    const current = selectedUseCases || []
    const next = current.includes(item)
      ? current.filter((value) => value !== item)
      : [...current, item]
    setValue('useCases', next, { shouldDirty: true })
    setDraft((currentDraft) => ({ ...currentDraft, useCases: next }))
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[32px] border border-neutral-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Onboarding</p>
              <h1 className="mt-3 text-3xl font-black text-neutral-900">Set up your BizFlow NG workspace</h1>
            </div>
            <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Step {step + 1} of 5
            </span>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-neutral-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-blue-400 to-accent"
              animate={{ width: `${stepPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 ? (
              <Card className="rounded-[32px] p-8">
                <h2 className="text-3xl font-black text-neutral-900">Tell us about your business</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  This helps us personalize your workspace and prepare your first invoice-ready setup.
                </p>
                <div className="mt-8 space-y-5">
                  <Input
                    label="Business name"
                    placeholder="BrandVerse Ventures"
                    prefixIcon={<Building2 className="h-4 w-4" />}
                    error={errors.businessName?.message}
                    {...register('businessName')}
                  />
                  <Select
                    label="Business type"
                    value={watch('businessType')}
                    onChange={(value) => setValue('businessType', value, { shouldValidate: true, shouldDirty: true })}
                    error={errors.businessType?.message}
                    options={businessTypes.map((item) => ({ label: item, value: item }))}
                  />
                  <Input
                    label="Business address"
                    placeholder="12 Admiralty Way, Lekki, Lagos"
                    prefixIcon={<MapPin className="h-4 w-4" />}
                    error={errors.businessAddress?.message}
                    {...register('businessAddress')}
                  />
                  <Input
                    label="Business phone"
                    placeholder="+234 800 000 0000"
                    prefixIcon={<Phone className="h-4 w-4" />}
                    error={errors.businessPhone?.message}
                    {...register('businessPhone')}
                  />
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-neutral-700">Upload logo</label>
                    <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ImagePlus className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-800">Upload your logo</p>
                        <p className="mt-1 text-xs text-neutral-500">PNG, JPG, or SVG. We’ll show it on invoices.</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
                    </label>
                    {logoPreview ? (
                      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                        <img src={logoPreview} alt="Business logo preview" className="max-h-20 object-contain" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ) : null}

            {step === 1 ? (
              <Card className="rounded-[32px] p-8">
                <h2 className="text-3xl font-black text-neutral-900">How big is your team?</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  We’ll tailor your workspace and onboarding suggestions based on your team size.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {teamSizes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setValue('teamSize', item, { shouldDirty: true })}
                      className={`rounded-[28px] border px-5 py-8 text-left transition-all ${
                        teamSize === item
                          ? 'border-primary bg-primary text-white shadow-button'
                          : 'border-neutral-200 bg-white text-neutral-800 shadow-card hover:border-primary/40'
                      }`}
                    >
                      <Users className="h-6 w-6" />
                      <p className="mt-6 text-lg font-bold">{item}</p>
                    </button>
                  ))}
                </div>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card className="rounded-[32px] p-8">
                <h2 className="text-3xl font-black text-neutral-900">What will you use BizFlow NG for?</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  Choose the modules you care about most so we can shape your dashboard around them.
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {useCases.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleUseCase(item)}
                      className={`rounded-[28px] border px-5 py-6 text-left transition-all ${
                        selectedUseCases.includes(item)
                          ? 'border-primary bg-primary text-white shadow-button'
                          : 'border-neutral-200 bg-white text-neutral-800 shadow-card hover:border-primary/40'
                      }`}
                    >
                      <Layers3 className="h-6 w-6" />
                      <p className="mt-6 text-lg font-bold">{item}</p>
                    </button>
                  ))}
                </div>
              </Card>
            ) : null}

            {step === 3 ? (
              <Card className="rounded-[32px] p-8">
                <h2 className="text-3xl font-black text-neutral-900">Let&apos;s create your first invoice</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  Create a simple starter invoice now or skip and come back later from your dashboard.
                </p>
                <div className="mt-8 space-y-5">
                  <Input
                    label="Client name"
                    placeholder="Apex Grid Ltd"
                    prefixIcon={<Users className="h-4 w-4" />}
                    {...register('firstClientName')}
                  />
                  <Input
                    label="Service description"
                    placeholder="Monthly operations support"
                    prefixIcon={<FileText className="h-4 w-4" />}
                    {...register('firstServiceDescription')}
                  />
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="450000"
                    prefixIcon={<ReceiptText className="h-4 w-4" />}
                    {...register('firstInvoiceAmount')}
                  />
                </div>
              </Card>
            ) : null}

            {step === 4 ? (
              <Card className="rounded-[32px] p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <h2 className="mt-8 text-4xl font-black text-neutral-900">You&apos;re all set! 🎉</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
                  Your BizFlow NG workspace is ready. We’ve saved your onboarding choices and prepared your dashboard for action.
                </p>
                <div className="mx-auto mt-8 max-w-xl rounded-[28px] border border-neutral-200 bg-neutral-50 p-6 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Plan summary</p>
                  <h3 className="mt-3 text-2xl font-bold text-neutral-900">Starter Workspace</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">Team size</p>
                      <p className="mt-2 text-lg font-bold text-neutral-900">{teamSize || 'Just me'}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">Focus</p>
                      <p className="mt-2 text-lg font-bold text-neutral-900">
                        {selectedUseCases.length ? selectedUseCases.join(', ') : 'Invoicing'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <a href="/app/dashboard" className="btn-primary">
                    Go to Dashboard →
                  </a>
                </div>
              </Card>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            disabled={step === 0 || savingStep}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>

          <div className="flex flex-wrap gap-3">
            {step < 4 ? (
              <>
                {step >= 1 ? (
                  <Button variant="outline" onClick={skipStep} disabled={savingStep}>
                    {step === 3 ? 'Skip for now' : 'Skip'}
                  </Button>
                ) : null}
                <Button onClick={handleContinue} loading={savingStep} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Continue
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

Onboarding.propTypes = {
  setBusiness: PropTypes.func.isRequired,
}
