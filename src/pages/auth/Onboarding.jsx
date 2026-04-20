import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ImagePlus,
  Layers3,
  MapPin,
  Phone,
  ShieldAlert,
  ReceiptText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Seo from '../../components/Seo'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import useToast from '../../hooks/useToast'
import { uploadPresets, validateUploadFile } from '../../lib/uploadSecurity'
import { Link, useNavigate } from 'react-router-dom'

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

function logOnboardingError(scope, error, userId, meta = {}) {
  if (!error) return
  console.error(`[Onboarding:${scope}]`, {
    userId,
    message: error.message || 'Unknown onboarding error',
    details: error.details || null,
    hint: error.hint || null,
    code: error.code || null,
    ...meta,
  })
}

function logOnboardingEvent(scope, meta = {}) {
  console.log(`[Onboarding:${scope}]`, meta)
}

function isMissingColumnError(error, column) {
  if (!error || !column) return false
  const combined = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase()
  return error.code === '42703' || combined.includes(column.toLowerCase())
}

export default function Onboarding({ setBusiness }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [savingStep, setSavingStep] = useState(false)
  const [userId, setUserId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [existingBusiness, setExistingBusiness] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [draft, setDraft] = useState(initialWizardState())
  const [stepError, setStepError] = useState('')

  const {
    control,
    register,
    trigger,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(baseSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: draft,
  })

  useEffect(() => {
    let mounted = true
    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted || !user) return
      setUserId(user.id)
      setCurrentUser(user)
      const metadataDraft = user.user_metadata?.onboarding_draft || {}
      const nextDraft = { ...initialWizardState(), ...metadataDraft }
      setDraft(nextDraft)
      Object.entries(nextDraft).forEach(([field, value]) => {
        setValue(field, value || '', { shouldDirty: false })
      })
      setLogoPreview(nextDraft.logoUrl || '')

      const { data: businessRows } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)

      const businessRecord = businessRows?.[0] || null

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
  const businessType = watch('businessType')
  const teamSize = watch('teamSize') || draft.teamSize
  const selectedUseCases = watch('useCases') || draft.useCases || []
  const stepMeta = useMemo(() => ([
    {
      eyebrow: 'Workspace setup',
      title: 'Tell us about your business',
      description: 'Add the basics so invoices, branding, and workspace defaults feel ready from day one.',
    },
    {
      eyebrow: 'Team setup',
      title: 'How big is your team?',
      description: 'This helps us tune your HR, payroll, and workspace suggestions.',
    },
    {
      eyebrow: 'Focus areas',
      title: 'What will you use BizFlow NG for?',
      description: 'Pick your priorities so the dashboard and onboarding checklist feel relevant.',
    },
    {
      eyebrow: 'Quick start',
      title: 'Create your first invoice',
      description: 'You can draft one now or skip and come back later from the dashboard.',
    },
    {
      eyebrow: 'Ready to go',
      title: 'Your workspace is ready',
      description: 'We saved your progress and prepared the workspace so you can start operating immediately.',
    },
  ]), [])

  function buildMinimalBusinessValues(sourceValues = {}) {
    const ownerName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || 'My'
    return {
      ...sourceValues,
      businessName: sourceValues.businessName?.trim() || `${ownerName.replace(/\s+/g, ' ').trim()}'s Business`,
      businessType: sourceValues.businessType || 'Other',
      businessAddress: sourceValues.businessAddress?.trim() || 'To be updated later',
      businessPhone: sourceValues.businessPhone?.trim() || currentUser?.user_metadata?.phone || '+2340000000000',
      logoUrl: sourceValues.logoUrl || '',
    }
  }

  async function persistDraft(values, { blockOnError = false, scope = 'draft-save' } = {}) {
    const draftUserId = userId || currentUser?.id
    if (!draftUserId) return
    const nextDraft = { ...draft, ...values }
    setDraft(nextDraft)
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_draft: nextDraft,
      },
    })

    if (!error) return

    logOnboardingError(scope, error, draftUserId, {
      draftKeys: Object.keys(nextDraft),
    })

    if (blockOnError) {
      throw error
    }
  }

  function syncBusinessRecord(record) {
    if (!record) return null
    setExistingBusiness(record)
    setBusiness(record)
    return record
  }

  async function resolveSignedInUser() {
    const {
      data: { user: authUser },
      error: authError,
    } = currentUser?.id
      ? { data: { user: currentUser }, error: null }
      : await supabase.auth.getUser()

    if (authError) {
      logOnboardingError('get-user', authError, currentUser?.id || userId)
      throw authError
    }

    const resolvedUser = authUser || currentUser
    if (!resolvedUser?.id) {
      throw new Error('We could not confirm your signed-in account. Please refresh and try again.')
    }

    if (!currentUser?.id) {
      setCurrentUser(resolvedUser)
    }
    if (!userId) {
      setUserId(resolvedUser.id)
    }

    return resolvedUser
  }

  async function lookupExistingBusiness(resolvedUserId, scope = 'lookup-business') {
    logOnboardingEvent(`${scope}:query`, { userId: resolvedUserId })
    const { data: businessRows, error: lookupError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: true })
      .limit(1)

    if (lookupError) {
      logOnboardingError(scope, lookupError, resolvedUserId)
      throw lookupError
    }

    return businessRows?.[0] || null
  }

  async function writeBusinessRecord({ mode, resolvedUser, attachedBusiness, payload }) {
    logOnboardingEvent(`${mode}:payload`, {
      userId: resolvedUser.id,
      businessId: attachedBusiness?.id || null,
      payload,
    })

    const query = attachedBusiness
      ? supabase.from('businesses').update(payload).eq('id', attachedBusiness.id)
      : supabase.from('businesses').insert({ ...payload, user_id: resolvedUser.id })

    const { data, error } = await query.select().limit(1)

    logOnboardingEvent(`${mode}:result`, {
      userId: resolvedUser.id,
      businessId: attachedBusiness?.id || data?.[0]?.id || null,
      error: error
        ? {
          message: error.message || null,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || null,
        }
        : null,
    })

    if (error) {
      logOnboardingError(mode, error, resolvedUser.id, {
        businessId: attachedBusiness?.id || null,
        payload,
      })
      throw error
    }

    const refreshedBusiness = await lookupExistingBusiness(resolvedUser.id, `${mode}-refresh`)

    if (!refreshedBusiness) {
      const refreshError = new Error('Workspace was saved, but we could not load it afterward.')
      logOnboardingError(`${mode}-refresh-missing`, refreshError, resolvedUser.id, {
        businessId: attachedBusiness?.id || null,
      })
      throw refreshError
    }

    return syncBusinessRecord(refreshedBusiness)
  }

  async function ensureMinimalBusinessRecord(values) {
    const safeValues = buildMinimalBusinessValues(values)
    const resolvedUser = await resolveSignedInUser()
    let attachedBusiness = existingBusiness

    logOnboardingEvent('ensure-minimal:start', {
      userId: resolvedUser.id,
      values: safeValues,
      existingBusinessId: attachedBusiness?.id || null,
    })

    if (!attachedBusiness) {
      attachedBusiness = await lookupExistingBusiness(resolvedUser.id)
      if (attachedBusiness) {
        return syncBusinessRecord(attachedBusiness)
      }
    }

    const minimalPayload = {
      name: safeValues.businessName,
    }

    return writeBusinessRecord({
      mode: 'insert-business-minimal',
      resolvedUser,
      attachedBusiness: null,
      payload: minimalPayload,
    })
  }

  async function ensureBusinessRecord(values) {
    const safeValues = buildMinimalBusinessValues(values)
    const resolvedUser = await resolveSignedInUser()
    logOnboardingEvent('ensure-business:start', {
      userId: resolvedUser.id,
      values: safeValues,
    })
    const minimalBusiness = await ensureMinimalBusinessRecord(safeValues)

    const basePayload = {
      name: safeValues.businessName,
      address: safeValues.businessAddress,
      phone: safeValues.businessPhone,
      logo_url: safeValues.logoUrl || minimalBusiness?.logo_url || '',
      email: minimalBusiness?.email || resolvedUser.email || '',
    }
    const extendedPayload = {
      ...basePayload,
      business_type: safeValues.businessType || minimalBusiness?.business_type || 'Other',
    }

    try {
      return await writeBusinessRecord({
        mode: 'update-business-profile',
        resolvedUser,
        attachedBusiness: minimalBusiness,
        payload: extendedPayload,
      })
    } catch (error) {
      if (!isMissingColumnError(error, 'business_type')) {
        throw error
      }

      logOnboardingError('workspace-schema-mismatch', error, resolvedUser.id, {
        businessId: minimalBusiness?.id || null,
        payload: extendedPayload,
      })

      return writeBusinessRecord({
        mode: 'update-business-profile-fallback',
        resolvedUser,
        attachedBusiness: minimalBusiness,
        payload: basePayload,
      })
    }
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
    setStepError('')
    logOnboardingEvent('continue:click', {
      step,
      userId: currentUser?.id || userId,
      values,
    })

    if (step === 0) {
      const valid = await trigger(['businessName', 'businessType', 'businessAddress', 'businessPhone'], { shouldFocus: true })
      if (!valid) {
        setStepError(
          !getValues('businessType')
            ? 'Business type is required before you can continue.'
            : 'Please fix the highlighted business details to continue.'
        )
        return
      }

      setSavingStep(true)
      try {
        await persistDraft(values, { scope: 'draft-save-step-1' })
        const businessRecord = await ensureBusinessRecord(values)
        logOnboardingEvent('continue:step-1-success', {
          step,
          userId: currentUser?.id || userId,
          businessId: businessRecord?.id || null,
        })
        setStep(1)
      } catch (error) {
        logOnboardingError('step-1', error, currentUser?.id || userId)
        setStepError('We could not create your workspace yet. Please try again in a moment.')
      } finally {
        setSavingStep(false)
      }
      return
    }

    if (step === 1) {
      if (!teamSize) {
        setStepError('Please select a team size to continue.')
        return
      }
      setSavingStep(true)
      try {
        await persistDraft({ ...values, teamSize }, { scope: 'draft-save-step-2' })
        setStep(2)
      } finally {
        setSavingStep(false)
      }
      return
    }

    if (step === 2) {
      if (!selectedUseCases.length) {
        setStepError('Choose at least one focus area to continue.')
        return
      }
      setSavingStep(true)
      try {
        await persistDraft({ ...values, useCases: selectedUseCases }, { scope: 'draft-save-step-3' })
        setStep(3)
      } finally {
        setSavingStep(false)
      }
      return
    }

    if (step === 3) {
      setSavingStep(true)
      try {
        await persistDraft(values, { scope: 'draft-save-step-4' })
        const businessRecord = await ensureBusinessRecord(values)
        await createFirstInvoice(values, businessRecord)
        setStep(4)
      } catch (error) {
        console.error('Final onboarding step failed:', error)
        toast.error(error.message || 'We could not finish setup just yet. Please try again.')
      } finally {
        setSavingStep(false)
      }
    }
  }

  async function skipStep() {
    const values = getValues()
    const nextValues = buildMinimalBusinessValues(values)
    setStepError('')
    setSavingStep(true)
    logOnboardingEvent('skip:click', {
      userId: currentUser?.id || userId,
      values,
      minimalValues: nextValues,
    })

    try {
      await persistDraft(nextValues, { scope: 'draft-save-skip' })
      const businessRecord = await ensureMinimalBusinessRecord(nextValues)
      logOnboardingEvent('skip:success', {
        userId: currentUser?.id || userId,
        businessId: businessRecord?.id || null,
      })
      toast.success('You can complete your business profile later from Settings.')
      navigate('/app/dashboard', { replace: true })
    } catch (error) {
      logOnboardingError('skip-workspace-sync', error, currentUser?.id || userId, {
        payload: nextValues,
      })
      setStepError('We could not create your workspace yet. Please try again in a moment.')
      toast.error('We could not create your workspace yet. Please try again in a moment.')
    } finally {
      setSavingStep(false)
    }
  }

  async function uploadLogo(event) {
    const file = event.target.files?.[0]
    if (!file || !userId) return
    try {
      validateUploadFile(file, uploadPresets.businessLogo)
    } catch (error) {
      toast.error(error.message)
      return
    }
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
    await persistDraft({ ...getValues(), logoUrl: data.publicUrl }, { scope: 'draft-save-logo' })
  }

  function toggleUseCase(item) {
    const current = selectedUseCases || []
    const next = current.includes(item)
      ? current.filter((value) => value !== item)
      : [...current, item]
    setValue('useCases', next, { shouldDirty: true })
    setStepError('')
    setDraft((currentDraft) => ({ ...currentDraft, useCases: next }))
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),_transparent_36%),linear-gradient(180deg,_#f5fbf8_0%,_#f8fafc_52%,_#eef6f1_100%)] px-4 py-6 dark:bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.2),_transparent_28%),linear-gradient(180deg,_#08101f_0%,_#0b1120_44%,_#101827_100%)] sm:px-6 lg:px-8">
      <Seo
        title="Onboarding — BizFlow NG"
        description="Set up your business profile and complete your BizFlow NG workspace onboarding."
        path="/onboarding"
        noindex
      />
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-[32px] border border-emerald-500/10 bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Onboarding</p>
              <h1 className="mt-3 text-3xl font-black text-neutral-900 dark:text-white">Set up your BizFlow NG workspace</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                Move through setup quickly now, or skip and finish details later from Settings without losing access to your workspace.
              </p>
            </div>
            <span className="w-fit rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Step {step + 1} of 5
            </span>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-emerald-100/80 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-400 to-accent"
              animate={{ width: `${stepPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {stepMeta.map((item, index) => (
              <span
                key={item.title}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${index === step ? 'bg-emerald-500 text-white shadow-glow' : 'bg-white text-neutral-500 ring-1 ring-emerald-500/10 dark:bg-white/[0.06] dark:text-neutral-300 dark:ring-white/10'}`}
              >
                {item.eyebrow}
              </span>
            ))}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleContinue()
          }}
          noValidate
        >
          <input type="hidden" {...register('teamSize')} />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
            {step === 0 ? (
              <Card className="rounded-[32px] border border-emerald-500/10 bg-white/92 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{stepMeta[0].eyebrow}</p>
                <h2 className="mt-4 text-3xl font-black text-neutral-900 dark:text-white">{stepMeta[0].title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  {stepMeta[0].description}
                </p>
                {stepError ? (
                  <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-4 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-4 w-4" />
                      <span>{stepError}</span>
                    </div>
                  </div>
                ) : null}
                <div className="mt-8 space-y-5">
                  <Input
                    label="Business name"
                    placeholder="BrandVerse Ventures"
                    prefixIcon={<Building2 className="h-4 w-4" />}
                    error={errors.businessName?.message}
                    {...register('businessName')}
                  />
                  <Controller
                    name="businessType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Business type"
                        value={field.value || ''}
                        onChange={(value) => {
                          field.onChange(value)
                          setStepError('')
                        }}
                        error={errors.businessType?.message}
                        options={businessTypes.map((item) => ({ label: item, value: item }))}
                      />
                    )}
                  />
                  {!errors.businessType ? (
                    <p className="-mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-300">
                      Required. Choose the option that best matches how your business operates.
                    </p>
                  ) : null}
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
                    <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">Upload logo</label>
                    <label className="flex cursor-pointer items-center gap-4 rounded-3xl border border-dashed border-emerald-400/20 bg-emerald-50/80 px-4 py-4 transition hover:border-primary/40 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                        <ImagePlus className="h-5 w-5" />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-white">Upload your logo</p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-300">PNG, JPG, WEBP, or SVG up to 5MB. We’ll use it on invoices and workspace surfaces.</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
                    </label>
                    {logoPreview ? (
                      <div className="rounded-3xl border border-emerald-500/10 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <img src={logoPreview} alt="Business logo preview" className="max-h-20 object-contain" />
                      </div>
                    ) : null}
                    <p className="text-xs leading-6 text-neutral-500 dark:text-neutral-300">Logo upload is optional and will never block onboarding.</p>
                  </div>
                </div>
              </Card>
            ) : null}

            {step === 1 ? (
              <Card className="rounded-[32px] border border-emerald-500/10 bg-white/92 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{stepMeta[1].eyebrow}</p>
                <h2 className="mt-4 text-3xl font-black text-neutral-900 dark:text-white">{stepMeta[1].title}</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  {stepMeta[1].description}
                </p>
                {stepError ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                    {stepError}
                  </div>
                ) : null}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {teamSizes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setValue('teamSize', item, { shouldDirty: true, shouldValidate: true })
                        setStepError('')
                      }}
                      className={`rounded-[28px] border px-5 py-8 text-left transition-all ${
                        teamSize === item
                          ? 'border-primary bg-primary text-white shadow-button'
                          : 'border-neutral-200 bg-white text-neutral-800 shadow-card hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white'
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
              <Card className="rounded-[32px] border border-emerald-500/10 bg-white/92 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{stepMeta[2].eyebrow}</p>
                <h2 className="mt-4 text-3xl font-black text-neutral-900 dark:text-white">{stepMeta[2].title}</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  {stepMeta[2].description}
                </p>
                {stepError ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                    {stepError}
                  </div>
                ) : null}
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {useCases.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleUseCase(item)}
                      className={`rounded-[28px] border px-5 py-6 text-left transition-all ${
                        selectedUseCases.includes(item)
                          ? 'border-primary bg-primary text-white shadow-button'
                          : 'border-neutral-200 bg-white text-neutral-800 shadow-card hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white'
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
              <Card className="rounded-[32px] border border-emerald-500/10 bg-white/92 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{stepMeta[3].eyebrow}</p>
                <h2 className="mt-4 text-3xl font-black text-neutral-900 dark:text-white">{stepMeta[3].title}</h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  {stepMeta[3].description}
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
              <Card className="rounded-[32px] border border-emerald-500/10 bg-white/92 p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <h2 className="mt-8 text-4xl font-black text-neutral-900 dark:text-white">You&apos;re all set! 🎉</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  Your BizFlow NG workspace is ready. We’ve saved your onboarding choices and prepared your dashboard for action.
                </p>
                <div className="mx-auto mt-8 max-w-xl rounded-[28px] border border-emerald-500/10 bg-emerald-50/70 p-6 text-left dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Plan summary</p>
                  <h3 className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">Starter Workspace</h3>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">Team size</p>
                      <p className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">{teamSize || 'Just me'}</p>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">Focus</p>
                      <p className="mt-2 text-lg font-bold text-neutral-900 dark:text-white">
                        {selectedUseCases.length ? selectedUseCases.join(', ') : 'Invoicing'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <Link to="/app/dashboard">
                    <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Go to Dashboard</Button>
                  </Link>
                </div>
              </Card>
            ) : null}
            </motion.div>
          </AnimatePresence>

          {step < 4 ? (
            <div className="mt-6 rounded-[28px] border border-emerald-500/10 bg-white/88 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  <span className="font-semibold text-neutral-900 dark:text-white">Need to come back later?</span>{' '}
                  You can skip now and finish your business profile later from <Link to="/app/settings" className="font-semibold text-primary hover:text-primary-dark">Settings</Link>.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStepError('')
                      setStep((current) => Math.max(current - 1, 0))
                    }}
                    disabled={step === 0 || savingStep}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                  >
                    Back
                  </Button>
                  <Button type="button" variant="outline" onClick={skipStep} disabled={savingStep} className="w-full sm:w-auto">
                    Skip for now
                  </Button>
                  <Button type="submit" loading={savingStep} rightIcon={<ArrowRight className="h-4 w-4" />} className="w-full sm:w-auto">
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  )
}

Onboarding.propTypes = {
  setBusiness: PropTypes.func.isRequired,
}
