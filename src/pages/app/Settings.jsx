import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Bell,
  Building2,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  Globe,
  ImageIcon,
  Landmark,
  Mail,
  Palette,
  Sparkles,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAppShell } from '../../context/AppShellContext'
import useAuth from '../../hooks/useAuth'
import useToast from '../../hooks/useToast'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Select from '../../components/ui/Select'
import { SUPPORT_EMAIL } from '../../lib/support'
import { uploadPresets, validateUploadFile } from '../../lib/uploadSecurity'

const tabs = [
  { key: 'business', label: 'Business Profile', icon: <Building2 className="h-4 w-4" />, description: 'Workspace identity and defaults' },
  { key: 'account', label: 'My Account', icon: <UserRound className="h-4 w-4" />, description: 'Your personal preferences' },
  { key: 'team', label: 'Team & Permissions', icon: <Users className="h-4 w-4" />, description: 'Collaborators and access control' },
  { key: 'billing', label: 'Billing & Subscription', icon: <CreditCard className="h-4 w-4" />, description: 'Plan, payments, and billing history' },
  { key: 'invoice', label: 'Invoice Customization', icon: <Palette className="h-4 w-4" />, description: 'Branding and invoice defaults' },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, description: 'Email, in-app, and SMS alerts' },
  { key: 'integrations', label: 'Integrations', icon: <Zap className="h-4 w-4" />, description: 'Connected services and APIs' },
  { key: 'security', label: 'Security', icon: <ShieldCheck className="h-4 w-4" />, description: 'Passwords, sessions, and protection' },
]

const roleOptions = ['Owner', 'Admin', 'Manager', 'Staff', 'Accountant']
const businessTypes = ['Retail', 'Services', 'Logistics', 'Tech', 'Food', 'Fashion', 'Agency', 'Other']
const currencies = ['NGN', 'USD', 'GBP', 'EUR']
const timezones = ['Africa/Lagos', 'Europe/London', 'America/Houston', 'UTC']
const languages = ['English', 'French']
const fontStyles = ['Classic', 'Modern', 'Minimal']
const logoPositions = ['left', 'center', 'right']
const invoiceTemplates = ['Signature', 'Executive', 'Minimal']
const defaultPlans = {
  Starter: {
    price: '₦5,000/month',
    features: ['Invoices & PDF export', 'Client management', 'Products & services', 'WhatsApp invoice sharing'],
  },
  Growth: {
    price: '₦15,000/month',
    features: ['Everything in Starter', 'Payroll module', 'Reports & analytics', 'Priority support'],
  },
  Enterprise: {
    price: 'Custom',
    features: ['Unlimited everything', 'Dedicated support', 'Custom integrations'],
  },
}

const permissionsMatrix = [
  { feature: 'Invoices', Owner: true, Admin: true, Manager: true, Staff: true, Accountant: true },
  { feature: 'Clients', Owner: true, Admin: true, Manager: true, Staff: true, Accountant: true },
  { feature: 'Staff', Owner: true, Admin: true, Manager: true, Staff: false, Accountant: false },
  { feature: 'Payroll', Owner: true, Admin: true, Manager: false, Staff: false, Accountant: true },
  { feature: 'Reports', Owner: true, Admin: true, Manager: true, Staff: false, Accountant: true },
  { feature: 'Settings', Owner: true, Admin: true, Manager: false, Staff: false, Accountant: false },
]

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  business_type: z.string().optional(),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  default_currency: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().optional(),
})

const accountSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  profile_photo_url: z.string().optional(),
  current_password: z.string().optional(),
})

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.string().min(1, 'Role is required'),
})

const invoiceSchema = z.object({
  color_scheme: z.string().optional(),
  logo_position: z.string().optional(),
  font_style: z.string().optional(),
  template: z.string().optional(),
  payment_terms: z.string().optional(),
  footer_text: z.string().optional(),
  tax_rate: z.coerce.number().min(0),
  number_format: z.string().optional(),
  thank_you_message: z.string().optional(),
})

const notificationSchema = z.object({
  email_invoice_sent: z.boolean().default(true),
  email_invoice_paid: z.boolean().default(true),
  email_invoice_overdue: z.boolean().default(true),
  email_payment_received: z.boolean().default(true),
  email_payroll_processed: z.boolean().default(true),
  email_team_joined: z.boolean().default(true),
  app_invoice_sent: z.boolean().default(true),
  app_invoice_paid: z.boolean().default(true),
  app_invoice_overdue: z.boolean().default(true),
  app_payment_received: z.boolean().default(true),
  app_payroll_processed: z.boolean().default(true),
  app_team_joined: z.boolean().default(true),
  app_leave_requests: z.boolean().default(true),
  app_system_updates: z.boolean().default(true),
  sms_enabled: z.boolean().default(false),
  sms_invoice_paid: z.boolean().default(false),
  sms_payroll_alerts: z.boolean().default(false),
  sms_phone: z.string().optional(),
})

const integrationSchema = z.object({
  paystack_connected: z.boolean().default(true),
  google_calendar_connected: z.boolean().default(false),
  slack_connected: z.boolean().default(false),
  zapier_connected: z.boolean().default(false),
  whatsapp_business_connected: z.boolean().default(false),
  termii_connected: z.boolean().default(false),
})

const securitySchema = z.object({
  current_password: z.string().optional(),
  new_password: z.union([z.literal(''), z.string().min(8, 'Password must be at least 8 characters')]),
  confirm_password: z.string(),
  session_timeout_minutes: z.coerce.number().min(5),
}).refine((values) => !values.new_password || values.new_password === values.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

function safeJson(value, fallback) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch (_error) {
      return fallback
    }
  }
  return value && typeof value === 'object' ? value : fallback
}

async function updateBusinessRecord({ businessId, payload, fallbackPayload }) {
  let result = await supabase.from('businesses').update(payload).eq('id', businessId)
  if (result.error && fallbackPayload && Object.keys(fallbackPayload).length) {
    result = await supabase.from('businesses').update(fallbackPayload).eq('id', businessId)
  }
  if (result.error) return { data: null, error: result.error }

  const refresh = await supabase.from('businesses').select('*').eq('id', businessId).maybeSingle()
  return refresh.error
    ? { data: null, error: refresh.error }
    : { data: refresh.data, error: null }
}

export default function Settings({ business, setBusiness }) {
  const toast = useToast()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useAppShell()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'business')
  const [teamInvites, setTeamInvites] = useState([])
  const [billingHistory, setBillingHistory] = useState([])
  const [loginActivity, setLoginActivity] = useState([])

  useEffect(() => {
    const requestedTab = searchParams.get('tab')
    if (requestedTab && tabs.some((item) => item.key === requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab)
    }
  }, [activeTab, searchParams])
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [savingSection, setSavingSection] = useState('')
  const [logoPreview, setLogoPreview] = useState(business?.logo_url || '')
  const [logoZoom, setLogoZoom] = useState(1)
  const [profilePreview, setProfilePreview] = useState(user?.user_metadata?.profile_photo_url || '')
  const [workspaceMembers, setWorkspaceMembers] = useState([])

  const businessForm = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || '',
      business_type: business?.business_type || '',
      registration_number: business?.registration_number || '',
      tax_id: business?.tax_id || '',
      phone: business?.phone || '',
      email: business?.email || '',
      website: business?.website || '',
      address: business?.address || '',
      city: business?.city || '',
      state: business?.state || '',
      country: business?.country || 'Nigeria',
      default_currency: business?.default_currency || 'NGN',
      description: business?.description || '',
      logo_url: business?.logo_url || '',
    },
  })

  const accountForm = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      timezone: user?.user_metadata?.timezone || 'Africa/Lagos',
      language: user?.user_metadata?.language || 'English',
      profile_photo_url: user?.user_metadata?.profile_photo_url || '',
      current_password: '',
    },
  })

  const inviteForm = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'Staff' },
  })

  const invoiceForm = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      color_scheme: safeJson(business?.invoice_settings, {}).color_scheme || '#16A34A',
      logo_position: safeJson(business?.invoice_settings, {}).logo_position || 'left',
      font_style: safeJson(business?.invoice_settings, {}).font_style || 'Modern',
      template: safeJson(business?.invoice_settings, {}).template || 'Signature',
      payment_terms: safeJson(business?.invoice_settings, {}).payment_terms || 'Net 14',
      footer_text: safeJson(business?.invoice_settings, {}).footer_text || 'Thank you for your business.',
      tax_rate: Number(safeJson(business?.invoice_settings, {}).tax_rate ?? 7.5),
      number_format: safeJson(business?.invoice_settings, {}).number_format || 'INV-{YYYY}-{0001}',
      thank_you_message: safeJson(business?.invoice_settings, {}).thank_you_message || 'We appreciate your prompt payment.',
    },
  })

  const notificationForm = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_invoice_sent: safeJson(business?.notification_settings, {}).email_invoice_sent ?? true,
      email_invoice_paid: safeJson(business?.notification_settings, {}).email_invoice_paid ?? true,
      email_invoice_overdue: safeJson(business?.notification_settings, {}).email_invoice_overdue ?? true,
      email_payment_received: safeJson(business?.notification_settings, {}).email_payment_received ?? true,
      email_payroll_processed: safeJson(business?.notification_settings, {}).email_payroll_processed ?? true,
      email_team_joined: safeJson(business?.notification_settings, {}).email_team_joined ?? true,
      app_invoice_sent: safeJson(business?.notification_settings, {}).app_invoice_sent ?? true,
      app_invoice_paid: safeJson(business?.notification_settings, {}).app_invoice_paid ?? true,
      app_invoice_overdue: safeJson(business?.notification_settings, {}).app_invoice_overdue ?? true,
      app_payment_received: safeJson(business?.notification_settings, {}).app_payment_received ?? true,
      app_payroll_processed: safeJson(business?.notification_settings, {}).app_payroll_processed ?? true,
      app_team_joined: safeJson(business?.notification_settings, {}).app_team_joined ?? true,
      app_leave_requests: safeJson(business?.notification_settings, {}).app_leave_requests ?? true,
      app_system_updates: safeJson(business?.notification_settings, {}).app_system_updates ?? true,
      sms_enabled: safeJson(business?.notification_settings, {}).sms_enabled ?? false,
      sms_invoice_paid: safeJson(business?.notification_settings, {}).sms_invoice_paid ?? false,
      sms_payroll_alerts: safeJson(business?.notification_settings, {}).sms_payroll_alerts ?? false,
      sms_phone: safeJson(business?.notification_settings, {}).sms_phone || '',
    },
  })

  const integrationForm = useForm({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      paystack_connected: safeJson(business?.integration_settings, {}).paystack_connected ?? true,
      google_calendar_connected: safeJson(business?.integration_settings, {}).google_calendar_connected ?? false,
      slack_connected: safeJson(business?.integration_settings, {}).slack_connected ?? false,
      zapier_connected: safeJson(business?.integration_settings, {}).zapier_connected ?? false,
      whatsapp_business_connected: safeJson(business?.integration_settings, {}).whatsapp_business_connected ?? false,
      termii_connected: safeJson(business?.integration_settings, {}).termii_connected ?? false,
    },
  })

  const securityForm = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
      session_timeout_minutes: Number(safeJson(business?.security_settings, {}).session_timeout_minutes ?? 30),
    },
  })

  function hydrateForms(nextBusiness = business, nextUser = user) {
    const invoiceSettings = safeJson(nextBusiness?.invoice_settings, {})
    const notificationSettings = safeJson(nextBusiness?.notification_settings, {})
    const integrationSettings = safeJson(nextBusiness?.integration_settings, {})
    const securitySettings = safeJson(nextBusiness?.security_settings, {})

    businessForm.reset({
      name: nextBusiness?.name || '',
      business_type: nextBusiness?.business_type || '',
      registration_number: nextBusiness?.registration_number || '',
      tax_id: nextBusiness?.tax_id || '',
      phone: nextBusiness?.phone || '',
      email: nextBusiness?.email || '',
      website: nextBusiness?.website || '',
      address: nextBusiness?.address || '',
      city: nextBusiness?.city || '',
      state: nextBusiness?.state || '',
      country: nextBusiness?.country || 'Nigeria',
      default_currency: nextBusiness?.default_currency || 'NGN',
      description: nextBusiness?.description || '',
      logo_url: nextBusiness?.logo_url || '',
    })

    accountForm.reset({
      first_name: nextUser?.user_metadata?.first_name || '',
      last_name: nextUser?.user_metadata?.last_name || '',
      email: nextUser?.email || '',
      phone: nextUser?.user_metadata?.phone || '',
      timezone: nextUser?.user_metadata?.timezone || 'Africa/Lagos',
      language: nextUser?.user_metadata?.language || 'English',
      profile_photo_url: nextUser?.user_metadata?.profile_photo_url || '',
      current_password: '',
    })

    invoiceForm.reset({
      color_scheme: invoiceSettings.color_scheme || '#16A34A',
      logo_position: invoiceSettings.logo_position || 'left',
      font_style: invoiceSettings.font_style || 'Modern',
      template: invoiceSettings.template || 'Signature',
      payment_terms: invoiceSettings.payment_terms || 'Net 14',
      footer_text: invoiceSettings.footer_text || 'Thank you for your business.',
      tax_rate: Number(invoiceSettings.tax_rate ?? 7.5),
      number_format: invoiceSettings.number_format || 'INV-{YYYY}-{0001}',
      thank_you_message: invoiceSettings.thank_you_message || 'We appreciate your prompt payment.',
    })

    notificationForm.reset({
      email_invoice_sent: notificationSettings.email_invoice_sent ?? true,
      email_invoice_paid: notificationSettings.email_invoice_paid ?? true,
      email_invoice_overdue: notificationSettings.email_invoice_overdue ?? true,
      email_payment_received: notificationSettings.email_payment_received ?? true,
      email_payroll_processed: notificationSettings.email_payroll_processed ?? true,
      email_team_joined: notificationSettings.email_team_joined ?? true,
      app_invoice_sent: notificationSettings.app_invoice_sent ?? true,
      app_invoice_paid: notificationSettings.app_invoice_paid ?? true,
      app_invoice_overdue: notificationSettings.app_invoice_overdue ?? true,
      app_payment_received: notificationSettings.app_payment_received ?? true,
      app_payroll_processed: notificationSettings.app_payroll_processed ?? true,
      app_team_joined: notificationSettings.app_team_joined ?? true,
      app_leave_requests: notificationSettings.app_leave_requests ?? true,
      app_system_updates: notificationSettings.app_system_updates ?? true,
      sms_enabled: notificationSettings.sms_enabled ?? false,
      sms_invoice_paid: notificationSettings.sms_invoice_paid ?? false,
      sms_payroll_alerts: notificationSettings.sms_payroll_alerts ?? false,
      sms_phone: notificationSettings.sms_phone || '',
    })

    integrationForm.reset({
      paystack_connected: integrationSettings.paystack_connected ?? true,
      google_calendar_connected: integrationSettings.google_calendar_connected ?? false,
      slack_connected: integrationSettings.slack_connected ?? false,
      zapier_connected: integrationSettings.zapier_connected ?? false,
      whatsapp_business_connected: integrationSettings.whatsapp_business_connected ?? false,
      termii_connected: integrationSettings.termii_connected ?? false,
    })

    securityForm.reset({
      current_password: '',
      new_password: '',
      confirm_password: '',
      session_timeout_minutes: Number(securitySettings.session_timeout_minutes ?? 30),
    })

    setLogoPreview(nextBusiness?.logo_url || '')
    setProfilePreview(nextUser?.user_metadata?.profile_photo_url || '')
  }

  useEffect(() => {
    if (!business?.id) return
    loadSettingsData()
  }, [business?.id])

  useEffect(() => {
    if (!business?.id) return undefined

    const channel = supabase
      .channel(`settings-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses', filter: `id=eq.${business.id}` }, loadSettingsData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_invites', filter: `business_id=eq.${business.id}` }, loadSettingsData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'billing_history', filter: `business_id=eq.${business.id}` }, loadSettingsData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'login_activity', filter: `business_id=eq.${business.id}` }, loadSettingsData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [business?.id])

  useEffect(() => {
    hydrateForms(business, user)
  }, [business, user])

  async function loadSettingsData() {
    setLoading(true)
    const [businessRes, teamRes, billingRes, loginRes] = await Promise.all([
      supabase.from('businesses').select('*').eq('id', business.id).maybeSingle(),
      supabase.from('team_invites').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('billing_history').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('login_activity').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
    ])

    const latestBusiness = businessRes.error ? business : (businessRes.data || business)
    setBusiness(latestBusiness)
    hydrateForms(latestBusiness, user)

    setTeamInvites(teamRes.error ? [] : (teamRes.data || []))
    setBillingHistory(billingRes.error ? [] : (billingRes.data || []))
    setLoginActivity(loginRes.error ? [] : (loginRes.data || []))
    setWorkspaceMembers([
      {
        id: user?.id || 'owner',
        name: `${user?.user_metadata?.first_name || 'Workspace'} ${user?.user_metadata?.last_name || 'Owner'}`.trim(),
        email: user?.email || 'Current owner',
        role: 'Owner',
        status: 'active',
      },
      ...(teamRes.error ? [] : (teamRes.data || []).map((invite) => ({
        id: invite.id,
        name: invite.full_name || invite.email?.split('@')?.[0] || 'Invited member',
        email: invite.email,
        role: invite.role,
        status: invite.status || 'pending',
      }))),
    ])
    setLoading(false)
  }

  async function uploadImage(bucket, file, fallbackSetter) {
    if (!file) return ''
    try {
      validateUploadFile(file, uploadPresets.profilePhoto)
    } catch (error) {
      toast.error(error.message)
      return ''
    }
    const ext = file.name.split('.').pop()
    const path = `${business.id}/${bucket}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) {
      toast.error(`Upload failed. Make sure the ${bucket} bucket exists.`)
      return ''
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    fallbackSetter(data.publicUrl)
    return data.publicUrl
  }

  async function saveBusinessProfile(values) {
    setSavingSection('business')
    const payload = {
      ...values,
      invoice_settings: safeJson(business?.invoice_settings, {}),
      notification_settings: safeJson(business?.notification_settings, {}),
      integration_settings: safeJson(business?.integration_settings, {}),
      security_settings: safeJson(business?.security_settings, {}),
    }
    const fallbackPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      logo_url: values.logo_url,
    }
    const { data, error } = await updateBusinessRecord({ businessId: business.id, payload, fallbackPayload })
    setSavingSection('')
    if (error) {
      toast.error(error.message || 'Business profile could not be saved.')
      return
    }
    setBusiness(data || payload)
    hydrateForms(data || payload, user)
    toast.success('Business profile updated.')
  }

  async function saveAccount(values) {
    setSavingSection('account')
    const isEmailChange = values.email !== user?.email
    if (isEmailChange) {
      const verified = await verifyCurrentPassword(values.current_password)
      if (!verified.ok) {
        setSavingSection('')
        accountForm.setError('current_password', { type: 'manual', message: verified.error })
        toast.error(verified.error)
        return
      }
    }
    const result = await supabase.auth.updateUser({
      email: values.email,
      data: {
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        timezone: values.timezone,
        language: values.language,
        profile_photo_url: photoUrl,
      },
    })
    setSavingSection('')
    if (result.error) {
      toast.error(result.error.message || 'Account settings could not be saved.')
      return
    }
    await supabase.from('login_activity').insert({
      business_id: business.id,
      user_id: user?.id,
      ip_address: null,
      device: 'Profile update',
      location: 'Settings',
      status: 'success',
    })
    accountForm.setValue('current_password', '')
    toast.success(values.email !== user?.email ? 'Profile updated. Check your inbox to confirm the email change.' : 'Account settings updated.')
  }

  async function verifyCurrentPassword(password) {
    if (!password?.trim()) {
      return { ok: false, error: 'Current password is required for this action.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password,
    })

    if (error) {
      return { ok: false, error: error.message || 'Current password could not be verified.' }
    }

    return { ok: true }
  }

  async function inviteTeamMember(values) {
    setSavingSection('invite')
    const otpResult = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: `${window.location.origin}/signup` },
    })
    if (otpResult.error) {
      setSavingSection('')
      toast.error(otpResult.error.message || 'Invite email could not be sent.')
      return
    }
    const result = await supabase.from('team_invites').insert({
      business_id: business.id,
      email: values.email,
      role: values.role,
      status: 'pending',
    })
    setSavingSection('')
    if (result.error) {
      toast.error(result.error.message || 'Invite could not be sent.')
      return
    }
    toast.success('Invite email sent.')
    inviteForm.reset({ email: '', role: 'Staff' })
    setInviteModalOpen(false)
    loadSettingsData()
  }

  async function removeInvite(id) {
    const result = await supabase.from('team_invites').delete().eq('id', id)
    if (result.error) {
      toast.error(result.error.message || 'Invite could not be removed.')
      return
    }
    toast.success('Invite removed.')
    loadSettingsData()
  }

  async function saveJsonSection(key, values, sectionName) {
    setSavingSection(key)
    const payload = { [key]: values }
    const { data, error } = await updateBusinessRecord({
      businessId: business.id,
      payload,
      fallbackPayload: {},
    })
    setSavingSection('')
    if (error) {
      toast.error(`${sectionName} could not be saved. Apply the latest schema first.`)
      return
    }
    const nextBusiness = { ...(business || {}), ...(data || {}), ...payload }
    setBusiness(nextBusiness)
    hydrateForms(nextBusiness, user)
    toast.success(`${sectionName} updated.`)
  }

  async function saveSecurity(values) {
    setSavingSection('security')
    if (values.new_password) {
      const verified = await verifyCurrentPassword(values.current_password)
      if (!verified.ok) {
        setSavingSection('')
        securityForm.setError('current_password', { type: 'manual', message: verified.error })
        toast.error(verified.error)
        return
      }
    }
    const passwordResult = values.new_password ? await supabase.auth.updateUser({ password: values.new_password }) : { error: null }
    if (passwordResult.error) {
      setSavingSection('')
      toast.error(passwordResult.error.message || 'Password could not be changed.')
      return
    }
    await saveJsonSection('security_settings', {
      session_timeout_minutes: values.session_timeout_minutes,
    }, 'Security preferences')
    securityForm.reset({
      ...values,
      current_password: '',
      new_password: '',
      confirm_password: '',
    })
    setSavingSection('')
  }

  async function confirmDangerAction() {
    if (!deleteModal) return
    if (deleteModal.value !== 'DELETE') {
      toast.error('Type DELETE to confirm.')
      return
    }

    if (deleteModal.type === 'cancel-subscription') {
      await saveJsonSection('billing_settings', {
        ...(safeJson(business?.billing_settings, {})),
        cancel_requested: true,
      }, 'Billing status')
      setDeleteModal(null)
      return
    }

    if (deleteModal.type === 'delete-account') {
      const verified = await verifyCurrentPassword(deleteModal.password)
      if (!verified.ok) {
        toast.error(verified.error)
        return
      }
      await supabase.from('account_deletion_requests').insert({
        business_id: business.id,
        user_id: user?.id,
        status: 'pending',
      })
      await signOut()
      setDeleteModal(null)
      return
    }
  }

  const currentPlan = business?.subscription_plan || 'Growth'
  const renewalDate = business?.renewal_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const invoicePreview = invoiceForm.watch()
  const notificationValues = notificationForm.watch()
  const integrationValues = integrationForm.watch()
  const securityValues = securityForm.watch()
  const billingSettings = safeJson(business?.billing_settings, {})
  const activeTabMeta = tabs.find((item) => item.key === activeTab) || tabs[0]
  const planStatus = billingSettings.cancel_requested ? 'Renewing off' : billingSettings.status || 'Active'
  const secureBillingNote = billingSettings.card_last4 ? 'Your billing profile is active and ready for the next renewal.' : 'Add a payment method to make renewals smooth and interruption-free.'

  const integrationCards = [
    { key: 'paystack_connected', name: 'Paystack', description: 'Card and bank payment collection', connected: integrationValues.paystack_connected, action: 'Manage' },
    { key: 'google_calendar_connected', name: 'Google Calendar', description: 'Sync reminders and due dates', connected: integrationValues.google_calendar_connected, action: 'Connect' },
    { key: 'slack_connected', name: 'Slack', description: 'Receive activity alerts in Slack', connected: integrationValues.slack_connected, action: 'Connect' },
    { key: 'zapier_connected', name: 'Zapier', description: 'Automate workflows with 5,000+ apps', connected: integrationValues.zapier_connected, action: 'Connect' },
    { key: 'whatsapp_business_connected', name: 'WhatsApp Business', description: 'Send reminders and client messages', connected: integrationValues.whatsapp_business_connected, action: 'Connect' },
    { key: 'termii_connected', name: 'Termii (SMS)', description: 'Transactional SMS notifications', connected: integrationValues.termii_connected, action: 'Connect' },
  ]

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[32px] border border-emerald-500/15 bg-white/90 p-6 shadow-card backdrop-blur dark:border-emerald-400/10 dark:bg-white/5 lg:p-8"
      >
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_52%)] lg:block" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Workspace settings
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-950 dark:text-white md:text-4xl">Settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              Configure your workspace identity, team permissions, billing, invoice branding, and security from one polished control center.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-emerald-500/15 bg-neutral-950/[0.03] px-4 py-4 dark:border-emerald-400/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Workspace</p>
              <p className="mt-2 text-sm font-bold text-neutral-950 dark:text-white">{business?.name || 'BizFlow workspace'}</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{currentPlan} plan</p>
            </div>
            <div className="rounded-[24px] border border-emerald-500/15 bg-neutral-950/[0.03] px-4 py-4 dark:border-emerald-400/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Active section</p>
              <p className="mt-2 text-sm font-bold text-neutral-950 dark:text-white">{activeTabMeta.label}</p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{activeTabMeta.description}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="lg:hidden">
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key)
                  setSearchParams({ tab: tab.key })
                }}
                className={[
                  'flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition',
                  activeTab === tab.key
                    ? 'border-emerald-500/20 bg-brand-gradient text-white shadow-glow'
                    : 'border-neutral-200 bg-white/85 text-neutral-700 hover:border-emerald-400/20 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10',
                ].join(' ').trim()}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="hidden rounded-[32px] p-4 xl:sticky xl:top-24 xl:block">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-emerald-500/15 bg-neutral-950/[0.03] p-5 dark:border-emerald-400/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">Workspace settings</p>
              <h2 className="mt-3 text-lg font-black text-neutral-950 dark:text-white">A cleaner way to manage BizFlow</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                Each section is organized for faster scanning, cleaner updates, and safer admin control.
              </p>
            </div>

            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key)
                    setSearchParams({ tab: tab.key })
                  }}
                  className={[
                    'group flex w-full items-center gap-3 rounded-[22px] border px-4 py-4 text-left transition',
                    activeTab === tab.key
                      ? 'border-emerald-500/15 bg-emerald-500/10 text-neutral-950 shadow-card dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-white'
                      : 'border-transparent text-neutral-600 hover:border-emerald-500/10 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-white',
                  ].join(' ').trim()}
                >
                  <span className={[
                    'inline-flex h-10 w-10 items-center justify-center rounded-2xl transition',
                    activeTab === tab.key ? 'bg-brand-gradient text-white shadow-glow' : 'bg-neutral-100 text-neutral-500 group-hover:bg-emerald-50 group-hover:text-primary dark:bg-white/10 dark:text-neutral-300',
                  ].join(' ').trim()}>
                    {tab.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{tab.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-neutral-500 dark:text-neutral-400">{tab.description}</span>
                  </span>
                  <ChevronRight className={`h-4 w-4 transition ${activeTab === tab.key ? 'text-primary dark:text-emerald-300' : 'text-neutral-300 group-hover:text-primary'}`} />
                </button>
              ))}
            </div>
          </div>
        </Card>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {activeTab === 'business' ? (
            <Card className="rounded-[32px]">
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <form onSubmit={businessForm.handleSubmit(saveBusinessProfile)} className="space-y-6">
                  <SectionHeader title="Business Profile" description="Define the public identity and default business details that show up across BizFlow NG." />

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-neutral-700">Business logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-700 dark:bg-white/5"
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        const objectUrl = URL.createObjectURL(file)
                        setLogoPreview(objectUrl)
                        const uploaded = await uploadImage('business-logos', file, setLogoPreview)
                        if (uploaded) businessForm.setValue('logo_url', uploaded)
                      }}
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Business name" error={businessForm.formState.errors.name?.message} {...businessForm.register('name')} />
                    <Select label="Business type" options={businessTypes.map((item) => ({ label: item, value: item }))} value={businessForm.watch('business_type')} onChange={(value) => businessForm.setValue('business_type', value)} />
                    <Input label="Registration number (CAC)" {...businessForm.register('registration_number')} />
                    <Input label="Tax ID (TIN)" {...businessForm.register('tax_id')} />
                    <Input label="Phone" {...businessForm.register('phone')} />
                    <Input label="Email" type="email" error={businessForm.formState.errors.email?.message} {...businessForm.register('email')} />
                    <Input label="Website" {...businessForm.register('website')} />
                    <Select label="Default currency" options={currencies.map((item) => ({ label: item, value: item }))} value={businessForm.watch('default_currency')} onChange={(value) => businessForm.setValue('default_currency', value)} />
                  </div>
                  <Input label="Address" {...businessForm.register('address')} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input label="City" {...businessForm.register('city')} />
                    <Input label="State" {...businessForm.register('state')} />
                    <Input label="Country" {...businessForm.register('country')} />
                  </div>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-neutral-700">Business description</span>
                    <textarea rows={5} {...businessForm.register('description')} className="w-full rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
                  </label>
                  <Button type="submit" loading={savingSection === 'business'}>Save Changes</Button>
                </form>

                <div className="space-y-6">
                  <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ImageIcon className="h-5 w-5" /></div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-950">Logo crop preview</h3>
                        <p className="text-sm text-neutral-500">Preview how your logo will sit inside branded invoice and profile surfaces.</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col items-center gap-4">
                      <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-[32px] border border-dashed border-emerald-400/25 bg-white/90 dark:bg-white/5">
                        {logoPreview ? <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" style={{ transform: `scale(${logoZoom})` }} /> : <Building2 className="h-12 w-12 text-neutral-300" />}
                      </div>
                      <label className="w-full space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Zoom preview</span>
                        <input type="range" min="1" max="2.2" step="0.1" value={logoZoom} onChange={(event) => setLogoZoom(Number(event.target.value))} className="w-full" />
                      </label>
                    </div>
                  </Card>

                  <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                    <h3 className="text-lg font-bold text-neutral-950">Profile snapshot</h3>
                    <div className="mt-5 grid gap-3">
                      <PreviewRow label="Business" value={businessForm.watch('name') || 'Your business name'} />
                      <PreviewRow label="Contact" value={businessForm.watch('email') || businessForm.watch('phone') || 'Add email or phone'} />
                      <PreviewRow label="Location" value={[businessForm.watch('city'), businessForm.watch('state'), businessForm.watch('country')].filter(Boolean).join(', ') || 'Add business location'} />
                      <PreviewRow label="Currency" value={businessForm.watch('default_currency') || 'NGN'} />
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          ) : null}

          {activeTab === 'account' ? (
            <Card className="rounded-[32px]">
              <form onSubmit={accountForm.handleSubmit(saveAccount)} className="space-y-6">
                <SectionHeader title="My Account" description="Manage your own profile details, language, timezone, and account-level preferences." />

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-700">Profile photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-700 dark:bg-white/5"
                    onChange={async (event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      const preview = URL.createObjectURL(file)
                      setProfilePreview(preview)
                      const uploaded = await uploadImage('profile-photos', file, setProfilePreview)
                      if (uploaded) accountForm.setValue('profile_photo_url', uploaded)
                    }}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="First name" error={accountForm.formState.errors.first_name?.message} {...accountForm.register('first_name')} />
                  <Input label="Last name" error={accountForm.formState.errors.last_name?.message} {...accountForm.register('last_name')} />
                  <Input label="Email" type="email" error={accountForm.formState.errors.email?.message} {...accountForm.register('email')} helperText="Changing email will trigger a verification flow." />
                  <Input label="Current password" type="password" error={accountForm.formState.errors.current_password?.message} helperText="Required only when changing your email." {...accountForm.register('current_password')} />
                  <Input label="Phone number" {...accountForm.register('phone')} />
                  <Select label="Timezone" options={timezones.map((item) => ({ label: item, value: item }))} value={accountForm.watch('timezone')} onChange={(value) => accountForm.setValue('timezone', value)} />
                  <Select label="Language" options={languages.map((item) => ({ label: item, value: item }))} value={accountForm.watch('language')} onChange={(value) => accountForm.setValue('language', value)} />
                </div>

                <div className="flex items-center gap-4">
                  {profilePreview ? <img src={profilePreview} alt="Profile preview" className="h-16 w-16 rounded-3xl object-cover" /> : <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100 text-neutral-500"><UserRound className="h-8 w-8" /></div>}
                  <p className="text-sm text-neutral-500">Profile images show in the app shell and activity areas.</p>
                </div>

                <div className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 p-5 dark:bg-white/5">
                  <h3 className="text-lg font-bold text-neutral-950">Appearance</h3>
                  <p className="mt-2 text-sm text-neutral-500">Choose the color mode that feels best for your team across BizFlow NG.</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-neutral-700">
                      Current mode: <span className="text-primary">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                    </div>
                    <Button type="button" variant="outline" onClick={toggleTheme}>
                      Switch to {theme === 'dark' ? 'Light' : 'Dark'} mode
                    </Button>
                  </div>
                </div>

                <Button type="submit" loading={savingSection === 'account'}>Save account changes</Button>
              </form>

              <DangerZone
                className="mt-8"
                title="Delete Account"
                description="This creates an account deletion request after you confirm the action and re-enter your current password."
                actionLabel="Delete Account"
                onAction={() => setDeleteModal({ type: 'delete-account', value: '', password: '' })}
              />
            </Card>
          ) : null}

          {activeTab === 'team' ? (
            <Card className="rounded-[32px] space-y-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <SectionHeader title="Team & Permissions" description="Invite collaborators, assign workspace roles, and keep everyone aligned on access." />
                <Button leftIcon={<Users className="h-4 w-4" />} onClick={() => setInviteModalOpen(true)}>Invite Team Member</Button>
              </div>

              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="font-semibold text-neutral-900">{member.name}</td>
                        <td>{member.email}</td>
                        <td><Badge variant="info">{member.role}</Badge></td>
                        <td><Badge variant={member.status === 'active' || member.status === 'accepted' ? 'success' : member.status === 'revoked' ? 'danger' : 'warning'}>{member.status || 'pending'}</Badge></td>
                        <td>{member.role === 'Owner' ? '—' : <Button variant="ghost" size="sm" onClick={() => removeInvite(member.id)}>Remove</Button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {workspaceMembers.length <= 1 ? <p className="mt-4 text-sm text-neutral-500">No team invites yet. Invite your first collaborator.</p> : null}
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-950">Role Permissions Matrix</h3>
                <div className="mt-4 overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Feature</th>
                        {roleOptions.map((role) => <th key={role}>{role}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {permissionsMatrix.map((row) => (
                        <tr key={row.feature}>
                          <td className="font-semibold text-neutral-900">{row.feature}</td>
                          {roleOptions.map((role) => <td key={role}>{row[role] ? '✅' : '❌'}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          ) : null}

          {activeTab === 'billing' ? (
            <div className="space-y-6">
              <SettingsSectionShell
                title="Billing & Subscription"
                description="Manage your current plan, saved payment details, billing records, and subscription changes from one polished billing center."
              >
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                    <Card className="relative overflow-hidden rounded-[32px] border-0 bg-brand-gradient p-0 text-white shadow-glow">
                      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_52%)]" />
                      <div className="relative space-y-6 p-7 lg:p-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50">
                              <Sparkles className="h-3.5 w-3.5" />
                              Current plan
                            </div>
                            <h3 className="mt-4 text-3xl font-black tracking-tight text-white lg:text-4xl">{currentPlan}</h3>
                            <p className="mt-2 max-w-xl text-sm leading-7 text-emerald-50/90">
                              {currentPlan === 'Growth'
                                ? 'Built for growing teams that need payroll, analytics, deeper controls, and smoother operations.'
                                : currentPlan === 'Starter'
                                  ? 'A clean starting point for smaller teams managing invoices, clients, and business essentials.'
                                  : 'Enterprise-grade support, custom integrations, and advanced service for larger operations.'}
                            </p>
                          </div>

                          <div className="flex flex-col items-start gap-3 lg:items-end">
                            <Badge variant="success" className="border-0 bg-white/15 text-white">{planStatus}</Badge>
                            <Button
                              variant="outline"
                              className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:bg-white/10"
                              onClick={() => navigate('/pricing')}
                            >
                              {currentPlan === 'Starter' ? 'Upgrade Plan' : 'Change Plan'}
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/80">Price</p>
                            <p className="mt-2 text-xl font-black text-white">{defaultPlans[currentPlan]?.price || 'Custom pricing'}</p>
                          </div>
                          <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/80">Renews</p>
                            <p className="mt-2 text-xl font-black text-white">{new Date(renewalDate).toLocaleDateString('en-NG')}</p>
                          </div>
                          <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/80">Security</p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50">{secureBillingNote}</p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {(defaultPlans[currentPlan]?.features || []).map((feature) => (
                            <div key={feature} className="flex items-start gap-3 rounded-[22px] border border-white/15 bg-white/10 px-4 py-4 text-sm leading-6 text-emerald-50">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <div className="space-y-6">
                    <SettingsFeatureCard
                      icon={<Landmark className="h-5 w-5" />}
                      title="Payment method"
                      description="Keep your subscription running smoothly with an up-to-date card or billing source."
                    >
                      {billingSettings.card_last4 ? (
                        <div className="space-y-4">
                          <div className="rounded-[24px] border border-emerald-500/12 bg-white/80 px-5 py-5 dark:bg-white/5">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Saved card</p>
                            <p className="mt-2 text-lg font-black text-neutral-950 dark:text-white">
                              Visa ending in {billingSettings.card_last4}
                            </p>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                              {billingSettings.card_expiry || 'Expiry unavailable'}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={() => {
                              const updateUrl = billingSettings.payment_update_url
                              if (updateUrl) window.location.assign(updateUrl)
                              else navigate('/pricing')
                            }}
                          >
                            Update payment method
                          </Button>
                        </div>
                      ) : (
                        <PolishedEmptyState
                          icon={<CreditCard className="h-5 w-5" />}
                          title="No saved payment method yet"
                          description="Add a card or billing source to make renewals seamless and avoid interruptions."
                          actionLabel="Update payment method"
                          onAction={() => {
                            const updateUrl = billingSettings.payment_update_url
                            if (updateUrl) window.location.assign(updateUrl)
                            else navigate('/pricing')
                          }}
                        />
                      )}
                    </SettingsFeatureCard>

                    <div className="rounded-[28px] border border-emerald-500/12 bg-white/75 px-5 py-5 shadow-card dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-primary">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-neutral-950 dark:text-white">Secure billing</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Payments are processed through your connected billing flow and stored references only.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsSectionShell>

              <SettingsSectionShell
                title="Billing history"
                description="Review past charges, plan changes, and receipt references in one place."
              >
                {billingHistory.length === 0 ? (
                  <PolishedEmptyState
                    icon={<Mail className="h-5 w-5" />}
                    title="No billing history yet"
                    description="As invoices are charged or subscription events happen, your billing records will appear here in a clean, searchable timeline."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Plan</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingHistory.map((row) => (
                          <tr key={row.id}>
                            <td>{new Date(row.created_at).toLocaleDateString('en-NG')}</td>
                            <td>{row.amount ? `₦${Number(row.amount).toLocaleString()}` : '—'}</td>
                            <td>{row.plan_name || currentPlan}</td>
                            <td>{row.receipt_reference || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SettingsSectionShell>

              <DangerZone
                eyebrow="Manage Subscription"
                title="Cancel Subscription"
                description="You can cancel your subscription at any time. Your plan will remain active until the end of the current billing period."
                actionLabel="Cancel Subscription"
                tone="neutral"
                onAction={() => setDeleteModal({ type: 'cancel-subscription', value: '' })}
              />
            </div>
          ) : null}

          {activeTab === 'invoice' ? (
            <Card className="rounded-[32px]">
              <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
                <form onSubmit={invoiceForm.handleSubmit((values) => saveJsonSection('invoice_settings', values, 'Invoice customization'))} className="space-y-6">
                  <SectionHeader title="Invoice Customization" description="Shape the look and defaults of every invoice your business sends." />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-neutral-700">Invoice color scheme</span>
                      <input type="color" value={invoiceForm.watch('color_scheme')} onChange={(event) => invoiceForm.setValue('color_scheme', event.target.value)} className="h-12 w-full rounded-xl border border-emerald-400/12 bg-white/90 p-2 dark:bg-white/5" />
                    </label>
                    <Select label="Logo position" options={logoPositions.map((item) => ({ label: item, value: item }))} value={invoiceForm.watch('logo_position')} onChange={(value) => invoiceForm.setValue('logo_position', value)} />
                    <Select label="Font style" options={fontStyles.map((item) => ({ label: item, value: item }))} value={invoiceForm.watch('font_style')} onChange={(value) => invoiceForm.setValue('font_style', value)} />
                    <Select label="Invoice template" options={invoiceTemplates.map((item) => ({ label: item, value: item }))} value={invoiceForm.watch('template')} onChange={(value) => invoiceForm.setValue('template', value)} />
                    <Input label="Default payment terms" {...invoiceForm.register('payment_terms')} />
                    <Input label="Default tax rate" type="number" {...invoiceForm.register('tax_rate')} />
                  </div>
                  <Input label="Invoice number format" {...invoiceForm.register('number_format')} />
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-neutral-700">Default notes / footer text</span>
                    <textarea rows={4} {...invoiceForm.register('footer_text')} className="w-full rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-neutral-700">Thank you message</span>
                    <textarea rows={4} {...invoiceForm.register('thank_you_message')} className="w-full rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
                  </label>
                  <Button type="submit" loading={savingSection === 'invoice_settings'}>Save invoice customization</Button>
                </form>

                <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                  <h3 className="text-lg font-bold text-neutral-950">Live preview</h3>
                  <div className="mt-5 rounded-[28px] border border-emerald-400/12 bg-white/95 p-6 dark:bg-white/5" style={{ fontFamily: invoicePreview.font_style === 'Classic' ? 'Georgia, serif' : invoicePreview.font_style === 'Minimal' ? '"Helvetica Neue", sans-serif' : '"Plus Jakarta Sans", sans-serif' }}>
                    <div className={`flex ${invoicePreview.logo_position === 'center' ? 'justify-center' : invoicePreview.logo_position === 'right' ? 'justify-end' : 'justify-start'}`}>
                      {logoPreview ? <img src={logoPreview} alt="Invoice logo preview" className="h-14 rounded-2xl object-contain" /> : <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold text-primary">LOGO</div>}
                    </div>
                    <div className="mt-6 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">Invoice</p>
                        <h4 className="mt-2 text-2xl font-black" style={{ color: invoicePreview.color_scheme }}>INV-2026-0001</h4>
                        <p className="mt-2 text-sm text-neutral-500">Terms: {invoicePreview.payment_terms}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-950">{businessForm.watch('name') || business?.name || 'BizFlow NG Business'}</p>
                        <p className="text-sm text-neutral-500">{businessForm.watch('email') || business?.email || SUPPORT_EMAIL}</p>
                      </div>
                    </div>
                    <div className="mt-6 rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 text-sm text-neutral-700 dark:bg-white/5">{invoicePreview.footer_text}</div>
                    <div className="mt-4 rounded-2xl px-4 py-4 text-sm text-white" style={{ backgroundColor: invoicePreview.color_scheme }}>{invoicePreview.thank_you_message}</div>
                  </div>
                </Card>
              </div>
            </Card>
          ) : null}

          {activeTab === 'notifications' ? (
            <Card className="rounded-[32px]">
              <form onSubmit={notificationForm.handleSubmit((values) => saveJsonSection('notification_settings', values, 'Notification preferences'))} className="space-y-8">
                <SectionHeader title="Notifications" description="Control which events trigger email, in-app, or SMS notifications." />
                <div className="grid gap-6 xl:grid-cols-3">
                  <NotificationGroup title="Email Notifications" items={[
                    ['email_invoice_sent', 'Invoice sent confirmation'],
                    ['email_invoice_paid', 'Invoice paid'],
                    ['email_invoice_overdue', 'Invoice overdue reminder'],
                    ['email_payment_received', 'Payment received'],
                    ['email_payroll_processed', 'Payroll processed'],
                    ['email_team_joined', 'New team member joined'],
                  ]} form={notificationForm} />

                  <NotificationGroup title="In-App Notifications" items={[
                    ['app_invoice_sent', 'Invoice sent confirmation'],
                    ['app_invoice_paid', 'Invoice paid'],
                    ['app_invoice_overdue', 'Invoice overdue reminder'],
                    ['app_payment_received', 'Payment received'],
                    ['app_payroll_processed', 'Payroll processed'],
                    ['app_team_joined', 'New team member joined'],
                    ['app_leave_requests', 'Staff leave requests'],
                    ['app_system_updates', 'System updates'],
                  ]} form={notificationForm} />

                  <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                    <h3 className="text-lg font-bold text-neutral-950">SMS Notifications</h3>
                    <div className="mt-5 space-y-4">
                      <ToggleRow label="Enable SMS (Termii)" checked={notificationValues.sms_enabled} onChange={() => notificationForm.setValue('sms_enabled', !notificationValues.sms_enabled)} />
                      <ToggleRow label="Invoice paid" checked={notificationValues.sms_invoice_paid} onChange={() => notificationForm.setValue('sms_invoice_paid', !notificationValues.sms_invoice_paid)} />
                      <ToggleRow label="Payroll alerts" checked={notificationValues.sms_payroll_alerts} onChange={() => notificationForm.setValue('sms_payroll_alerts', !notificationValues.sms_payroll_alerts)} />
                      <Input label="SMS phone number" {...notificationForm.register('sms_phone')} />
                    </div>
                  </Card>
                </div>
                <Button type="submit" loading={savingSection === 'notification_settings'}>Save notification settings</Button>
              </form>
            </Card>
          ) : null}

          {activeTab === 'integrations' ? (
            <Card className="rounded-[32px]">
              <form onSubmit={integrationForm.handleSubmit((values) => saveJsonSection('integration_settings', values, 'Integration settings'))} className="space-y-8">
                <SectionHeader title="Integrations" description="Manage external services that power payments, messaging, automations, and team workflow." />
                <div className="grid gap-4 md:grid-cols-2">
                  {integrationCards.map((card) => (
                    <Card key={card.key} className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-neutral-950">{card.name}</h3>
                          <p className="mt-2 text-sm text-neutral-500">
                            {card.key === 'termii_connected'
                              ? 'SMS credentials are now managed only through secure server-side environment configuration.'
                              : card.description}
                          </p>
                        </div>
                        <Badge variant={card.connected ? 'success' : 'neutral'}>{card.connected ? 'Connected' : 'Not connected'}</Badge>
                      </div>
                      {card.key === 'termii_connected' ? (
                        <div className="mt-4 rounded-2xl border border-emerald-400/12 bg-white/90 px-4 py-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
                          To enable Termii safely, store the API key in a protected server environment and route SMS requests through a trusted backend function.
                        </div>
                      ) : null}
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant={card.connected ? 'outline' : 'primary'}
                          onClick={() => {
                            if (card.key === 'termii_connected') return
                            integrationForm.setValue(card.key, !integrationValues[card.key])
                          }}
                        >
                          {card.key === 'termii_connected' ? 'Server-side only' : card.connected ? 'Disconnect' : card.action}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button type="submit" loading={savingSection === 'integration_settings'}>Save integrations</Button>
              </form>
            </Card>
          ) : null}

          {activeTab === 'security' ? (
            <Card className="rounded-[32px] space-y-8">
              <form onSubmit={securityForm.handleSubmit(saveSecurity)} className="space-y-8">
                <SectionHeader title="Security" description="Manage password updates, session limits, and device controls without relying on browser-only security shortcuts." />
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <div className="space-y-6">
                    <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                      <h3 className="text-lg font-bold text-neutral-950">Change password</h3>
                      <div className="mt-5 grid gap-4">
                        <Input label="Current password" type="password" {...securityForm.register('current_password')} />
                        <Input label="New password" type="password" error={securityForm.formState.errors.new_password?.message} {...securityForm.register('new_password')} />
                        <Input label="Confirm password" type="password" error={securityForm.formState.errors.confirm_password?.message} {...securityForm.register('confirm_password')} />
                      </div>
                    </Card>

                    <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                      <h3 className="text-lg font-bold text-neutral-950">Session settings</h3>
                      <div className="mt-5 grid gap-4">
                        <Select label="Session timeout" options={[15, 30, 60, 120].map((minutes) => ({ label: `${minutes} minutes`, value: minutes }))} value={securityValues.session_timeout_minutes} onChange={(value) => securityForm.setValue('session_timeout_minutes', Number(value))} />
                        <Button type="button" variant="outline" onClick={() => signOut({ scope: 'global' })}>Log out all devices</Button>
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                      <h3 className="text-lg font-bold text-neutral-950">Authentication safeguards</h3>
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-5 text-sm leading-7 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                        BizFlow NG no longer presents a fake 2FA flow. Until a real server-backed multi-factor authentication rollout is ready, this workspace relies on verified email access, strong passwords, and session controls only.
                      </div>
                      <div className="mt-4 grid gap-3">
                        <div className="rounded-2xl border border-emerald-400/12 bg-white/90 px-4 py-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
                          Email verification stays enforced before onboarding and workspace access.
                        </div>
                        <div className="rounded-2xl border border-emerald-400/12 bg-white/90 px-4 py-4 text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-300">
                          Password changes and global sign-out remain available here while stronger server-side protections are rolled out.
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-[28px] border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                      <h3 className="text-lg font-bold text-neutral-950">Login activity</h3>
                      <div className="mt-4 overflow-x-auto">
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>IP</th>
                              <th>Device</th>
                              <th>Location</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loginActivity.length === 0 ? (
                              <tr><td colSpan="5" className="py-8 text-center text-sm text-neutral-500">No login activity recorded yet.</td></tr>
                            ) : loginActivity.map((row) => (
                              <tr key={row.id}>
                                <td>{new Date(row.created_at).toLocaleString('en-NG')}</td>
                                <td>{row.ip_address || '—'}</td>
                                <td>{row.device || 'Unknown'}</td>
                                <td>{row.location || 'Unknown'}</td>
                                <td><Badge variant={row.status === 'success' ? 'success' : 'danger'}>{row.status || 'success'}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                </div>
                <Button type="submit" loading={savingSection === 'security'}>Save security settings</Button>
              </form>
            </Card>
          ) : null}
        </motion.div>
      </div>

      <Modal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite team member">
        <form onSubmit={inviteForm.handleSubmit(inviteTeamMember)} className="space-y-5">
          <Input label="Email" type="email" error={inviteForm.formState.errors.email?.message} {...inviteForm.register('email')} />
          <Select label="Role" options={roleOptions.map((item) => ({ label: item, value: item }))} value={inviteForm.watch('role')} onChange={(value) => inviteForm.setValue('role', value)} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={savingSection === 'invite'}>Send Invite</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleteModal)} onClose={() => setDeleteModal(null)} title="Confirm destructive action">
        {deleteModal ? (
          <div className="space-y-5">
            <p className="text-sm leading-7 text-neutral-600">Type <strong>DELETE</strong> to continue.</p>
            <Input label="Confirmation" value={deleteModal.value} onChange={(event) => setDeleteModal((current) => ({ ...current, value: event.target.value }))} />
            {deleteModal.type === 'delete-account' ? (
              <Input
                label="Current password"
                type="password"
                value={deleteModal.password || ''}
                onChange={(event) => setDeleteModal((current) => ({ ...current, password: event.target.value }))}
              />
            ) : null}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
              <Button type="button" variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={confirmDangerAction}>Confirm</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

Settings.propTypes = {
  business: PropTypes.object,
  setBusiness: PropTypes.func.isRequired,
}

function SectionHeader({ title, description }) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/12 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200">
        <Sparkles className="h-3 w-3" />
        Settings section
      </div>
      <h2 className="mt-4 text-2xl font-black tracking-tight text-neutral-950 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-neutral-500 dark:text-neutral-400">{description}</p>
    </div>
  )
}

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
}

function PreviewRow({ label, value }) {
  return (
    <div className="rounded-[22px] border border-emerald-500/12 bg-white/90 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">{value}</p>
    </div>
  )
}

PreviewRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[22px] border border-emerald-500/12 bg-white/90 px-4 py-4 shadow-sm transition hover:border-emerald-500/20 dark:border-white/10 dark:bg-white/5">
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</span>
      <button type="button" onClick={onChange} className={`inline-flex h-7 w-12 items-center rounded-full p-1 transition ${checked ? 'bg-brand-gradient justify-end shadow-glow' : 'bg-neutral-200 justify-start dark:bg-white/10'}`}>
        <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
      </button>
    </label>
  )
}

ToggleRow.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

function NotificationGroup({ title, items, form }) {
  return (
    <Card className="rounded-[30px] border border-emerald-500/12 bg-white/85 shadow-card dark:border-white/10 dark:bg-white/5">
      <h3 className="text-lg font-bold text-neutral-950">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map(([key, label]) => (
          <ToggleRow key={key} label={label} checked={form.watch(key)} onChange={() => form.setValue(key, !form.watch(key))} />
        ))}
      </div>
    </Card>
  )
}

NotificationGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.array).isRequired,
  form: PropTypes.object.isRequired,
}

function SettingsSectionShell({ title, description, children, actions = null }) {
  return (
    <Card className="rounded-[34px] border border-emerald-500/12 bg-white/85 p-6 shadow-card dark:border-white/10 dark:bg-white/5 lg:p-8">
      <div className="flex flex-col gap-4 border-b border-neutral-200/80 pb-6 dark:border-white/10 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeader title={title} description={description} />
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </Card>
  )
}

SettingsSectionShell.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
}

function SettingsFeatureCard({ icon, title, description, children }) {
  return (
    <Card className="rounded-[30px] border border-emerald-500/12 bg-white/80 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-black text-neutral-950 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  )
}

SettingsFeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}

function PolishedEmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-[26px] border border-dashed border-emerald-500/18 bg-neutral-50/90 px-5 py-6 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-primary">
        {icon}
      </div>
      <h4 className="mt-4 text-lg font-black text-neutral-950 dark:text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" variant="outline" fullWidth onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

PolishedEmptyState.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
}

function DangerZone({ eyebrow = 'Account Deletion', title, description, actionLabel, onAction, className = '', tone = 'danger' }) {
  const isNeutral = tone === 'neutral'
  return (
    <Card className={`rounded-[32px] p-6 shadow-card ${
      isNeutral
        ? 'border border-emerald-500/12 bg-white/88 dark:border-white/10 dark:bg-white/5'
        : 'border border-red-300/70 bg-red-50/95 dark:border-red-500/20 dark:bg-red-500/10'
    } ${className}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            isNeutral
              ? 'border border-emerald-500/12 bg-emerald-500/8 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-200'
              : 'border border-red-300/70 bg-white/70 text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200'
          }`}>
            <ShieldAlert className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h3 className={`mt-4 text-xl font-black ${isNeutral ? 'text-neutral-950 dark:text-white' : 'text-red-700 dark:text-red-200'}`}>{title}</h3>
          <p className={`mt-2 text-sm leading-7 ${isNeutral ? 'text-neutral-500 dark:text-neutral-400' : 'text-red-700/90 dark:text-red-100/80'}`}>{description}</p>
        </div>
        <Button className="w-full lg:w-auto" variant={isNeutral ? 'outline' : 'danger'} leftIcon={<Trash2 className="h-4 w-4" />} onClick={onAction}>{actionLabel}</Button>
      </div>
    </Card>
  )
}

DangerZone.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionLabel: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  className: PropTypes.string,
  tone: PropTypes.oneOf(['danger', 'neutral']),
}
