import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../lib/supabase'

const AppShellContext = createContext(null)

const PLAN_LIMITS = {
  starter: { invoices: 50 },
  growth: { invoices: Infinity },
  enterprise: { invoices: Infinity },
  setup: { invoices: 50 },
}

const QUICK_ACTIONS = [
  { id: 'new-invoice', title: 'New Invoice', description: 'Create a fresh invoice', path: '/app/invoices/new' },
  { id: 'add-client', title: 'Add Client', description: 'Open the client workspace', path: '/app/clients?create=1' },
  { id: 'add-staff', title: 'Add Staff Member', description: 'Add a new team member', path: '/app/staff?create=1' },
  { id: 'run-payroll', title: 'Run Payroll', description: 'Open payroll processing', path: '/app/payroll' },
]

const SETTINGS_LINKS = [
  { id: 'settings-business-profile', title: 'Business Profile', description: 'Manage company details', path: '/app/settings?tab=business' },
  { id: 'settings-account', title: 'My Account', description: 'Update your personal profile', path: '/app/settings?tab=account' },
  { id: 'settings-billing', title: 'Billing & Subscription', description: 'Review plan and payment history', path: '/app/settings?tab=billing' },
  { id: 'settings-security', title: 'Security', description: 'Protect your workspace access', path: '/app/settings?tab=security' },
]

const NOTIFICATION_CATEGORY_MAP = {
  invoice_paid: 'invoices',
  invoice_overdue: 'invoices',
  new_client: 'invoices',
  payroll_processed: 'payroll',
  leave_approved: 'hr',
  leave_rejected: 'hr',
  new_team_member: 'hr',
  system_alert: 'system',
}

function getStoredTheme() {
  const savedTheme = localStorage.getItem('bizflow-theme')
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDocument(theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.body.classList.toggle('dark', theme === 'dark')
}

function beginningOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function deriveCategory(notification) {
  return notification.category || NOTIFICATION_CATEGORY_MAP[notification.type] || 'system'
}

function normalizeClientName(invoice) {
  return invoice?.client_snapshot?.name || invoice?.clients?.name || 'Unknown client'
}

function buildChecklist({ session, business, clients, invoices, staff, savedState }) {
  const completion = savedState || {}

  const items = [
    {
      id: 'account-created',
      label: 'Create your account',
      path: '/app/dashboard',
      completed: true,
    },
    {
      id: 'business-profile',
      label: 'Set up business profile',
      path: '/app/settings?tab=business',
      completed:
        completion['business-profile'] ??
        Boolean(business?.name && business?.email && business?.phone),
    },
    {
      id: 'first-client',
      label: 'Add your first client',
      path: '/app/clients?create=1',
      completed: completion['first-client'] ?? clients.length > 0,
    },
    {
      id: 'first-invoice',
      label: 'Create your first invoice',
      path: '/app/invoices/new',
      completed: completion['first-invoice'] ?? invoices.length > 0,
    },
    {
      id: 'first-staff',
      label: 'Add a staff member',
      path: '/app/staff?create=1',
      completed: completion['first-staff'] ?? staff.length > 0,
    },
  ]

  const createdAt = session?.user?.created_at ? new Date(session.user.created_at) : null
  const isNewUser = createdAt ? Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000 : false

  return {
    isNewUser,
    items,
    completedCount: items.filter((item) => item.completed).length,
  }
}

export function AppShellProvider({ children, session, business, setBusiness }) {
  const [theme, setTheme] = useState(() => getStoredTheme())
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [searchIndex, setSearchIndex] = useState({ invoices: [], clients: [], staff: [] })
  const [searchLoading, setSearchLoading] = useState(false)
  const [checklistState, setChecklistState] = useState({})
  const [checklistDismissed, setChecklistDismissed] = useState(false)
  const [planUsage, setPlanUsage] = useState({
    invoiceCount: 0,
    invoiceLimit: Infinity,
    nearLimit: false,
    reachedLimit: false,
  })
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    applyThemeToDocument(theme)
    localStorage.setItem('bizflow-theme', theme)
  }, [theme])

  const persistPreferences = useCallback(
    async (patch) => {
      if (!session?.user?.id || !business?.id) return

      const nextPatch = {
        user_id: session.user.id,
        business_id: business.id,
        ...patch,
      }

      await supabase.from('user_preferences').upsert(nextPatch, { onConflict: 'user_id,business_id' })
    },
    [business?.id, session?.user?.id]
  )

  const loadPreferences = useCallback(async () => {
    if (!session?.user?.id || !business?.id) {
      setPreferencesLoaded(true)
      return
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('business_id', business.id)
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(1)

    if (error) {
      console.error('[AppShell:load-preferences]', {
        businessId: business.id,
        userId: session.user.id,
        message: error.message || 'Unknown preferences error',
        details: error.details || null,
        hint: error.hint || null,
        code: error.code || null,
      })
    }

    const preferenceRow = data?.[0] || null

    if (preferenceRow?.theme_preference) {
      setTheme(preferenceRow.theme_preference)
    }

    setChecklistState(preferenceRow?.checklist_state || {})
    setChecklistDismissed(Boolean(preferenceRow?.checklist_dismissed))
    setPreferencesLoaded(true)
  }, [business?.id, session?.user?.id])

  const loadNotifications = useCallback(async () => {
    if (!session?.user?.id || !business?.id) return
    setNotificationsLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('business_id', business.id)
      .eq('user_id', session.user.id)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false })
      .limit(100)

    setNotifications(
      (data || []).map((item) => ({
        ...item,
        category: deriveCategory(item),
      }))
    )
    setNotificationsLoading(false)
  }, [business?.id, session?.user?.id])

  const loadAnnouncements = useCallback(async () => {
    if (!business?.id) return
    const nowIso = new Date().toISOString()
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    setAnnouncements(
      (data || []).filter((announcement) => {
        const businessMatch = !announcement.business_id || announcement.business_id === business.id
        const startsOkay = !announcement.starts_at || announcement.starts_at <= nowIso
        const endsOkay = !announcement.ends_at || announcement.ends_at >= nowIso
        return businessMatch && startsOkay && endsOkay
      })
    )
  }, [business?.id])

  const loadSearchIndex = useCallback(async () => {
    if (!business?.id) return
    setSearchLoading(true)

    const [invoiceRes, clientRes, staffRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('id,invoice_number,total,status,created_at,client_snapshot,clients(name)')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(80),
      supabase
        .from('clients')
        .select('id,name,email,phone,business_name,status,created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(80),
      supabase
        .from('staff')
        .select('id,name,first_name,last_name,job_title,department,status,created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(80),
    ])

    setSearchIndex({
      invoices: invoiceRes.data || [],
      clients: clientRes.data || [],
      staff: staffRes.data || [],
    })
    setSearchLoading(false)
  }, [business?.id])

  const loadPlanUsage = useCallback(async () => {
    if (!business?.id) return
    const start = beginningOfMonth().toISOString()
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .gte('created_at', start)

    const planName = (business?.subscription_plan || 'starter').toLowerCase()
    const invoiceLimit = PLAN_LIMITS[planName]?.invoices ?? 50
    const invoiceCount = count || 0

    setPlanUsage({
      invoiceCount,
      invoiceLimit,
      nearLimit: Number.isFinite(invoiceLimit) ? invoiceCount >= invoiceLimit - 2 && invoiceCount < invoiceLimit : false,
      reachedLimit: Number.isFinite(invoiceLimit) ? invoiceCount >= invoiceLimit : false,
    })
  }, [business?.id, business?.subscription_plan])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    loadPreferences()
    loadNotifications()
    loadAnnouncements()
    loadSearchIndex()
    loadPlanUsage()
  }, [loadAnnouncements, loadNotifications, loadPlanUsage, loadPreferences, loadSearchIndex])

  useEffect(() => {
    if (!business?.id || !session?.user?.id) return undefined

    const channel = supabase
      .channel(`global-shell-${business.id}-${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `business_id=eq.${business.id}` },
        loadNotifications
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements', filter: `business_id=eq.${business.id}` },
        loadAnnouncements
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` },
        () => {
          loadSearchIndex()
          loadPlanUsage()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${business.id}` },
        loadSearchIndex
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff', filter: `business_id=eq.${business.id}` },
        loadSearchIndex
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [business?.id, loadAnnouncements, loadNotifications, loadPlanUsage, loadSearchIndex, session?.user?.id])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  )

  const derivedChecklist = useMemo(
    () =>
      buildChecklist({
        session,
        business,
        clients: searchIndex.clients,
        invoices: searchIndex.invoices,
        staff: searchIndex.staff,
        savedState: checklistState,
      }),
    [business, checklistState, searchIndex.clients, searchIndex.invoices, searchIndex.staff, session]
  )

  const activeAnnouncement = useMemo(() => {
    const dismissedIds = JSON.parse(localStorage.getItem('bizflow-dismissed-announcements') || '[]')
    return announcements.find((announcement) => !dismissedIds.includes(announcement.id)) || null
  }, [announcements])

  const filteredSearchGroups = useCallback(
    (query) => {
      const normalized = query.trim().toLowerCase()

      const invoices = searchIndex.invoices
        .filter((invoice) => {
          if (!normalized) return true
          return [invoice.invoice_number, normalizeClientName(invoice), invoice.status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalized)
        })
        .slice(0, 6)
        .map((invoice) => ({
          id: `invoice-${invoice.id}`,
          title: invoice.invoice_number || 'Invoice',
          description: `${normalizeClientName(invoice)} · ₦${Number(invoice.total || 0).toLocaleString()} · ${invoice.status || 'draft'}`,
          path: `/app/invoices/${invoice.id}`,
        }))

      const clients = searchIndex.clients
        .filter((client) => {
          if (!normalized) return true
          return [client.name, client.email, client.phone, client.business_name]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalized)
        })
        .slice(0, 6)
        .map((client) => ({
          id: `client-${client.id}`,
          title: client.name || 'Client',
          description: [client.email, client.business_name].filter(Boolean).join(' · '),
          path: `/app/clients/${client.id}`,
        }))

      const staff = searchIndex.staff
        .filter((member) => {
          if (!normalized) return true
          return [member.name, `${member.first_name || ''} ${member.last_name || ''}`.trim(), member.job_title, member.department]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalized)
        })
        .slice(0, 6)
        .map((member) => ({
          id: `staff-${member.id}`,
          title: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Staff member',
          description: [member.job_title, member.department].filter(Boolean).join(' · '),
          path: `/app/staff/${member.id}`,
        }))

      const settings = SETTINGS_LINKS.filter((entry) => {
        if (!normalized) return true
        return `${entry.title} ${entry.description}`.toLowerCase().includes(normalized)
      })

      const quickActions = QUICK_ACTIONS.filter((entry) => {
        if (!normalized) return true
        return `${entry.title} ${entry.description}`.toLowerCase().includes(normalized)
      })

      return [
        { key: 'Invoices', icon: '📄', items: invoices },
        { key: 'Clients', icon: '👥', items: clients },
        { key: 'Staff', icon: '👨‍💼', items: staff },
        { key: 'Settings', icon: '⚙️', items: settings },
        { key: 'Quick actions', icon: '🔗', items: quickActions },
      ].filter((group) => group.items.length > 0)
    },
    [searchIndex.clients, searchIndex.invoices, searchIndex.staff]
  )

  const markNotificationRead = useCallback(async (notificationId) => {
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item))
    )
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    const unreadIds = notifications.filter((item) => !item.is_read).map((item) => item.id)
    if (!unreadIds.length) return
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
  }, [notifications])

  const dismissNotification = useCallback(async (notificationId) => {
    setNotifications((current) => current.filter((item) => item.id !== notificationId))
    await supabase.from('notifications').update({ is_dismissed: true }).eq('id', notificationId)
  }, [])

  const dismissAnnouncement = useCallback((announcementId) => {
    const stored = JSON.parse(localStorage.getItem('bizflow-dismissed-announcements') || '[]')
    const next = Array.from(new Set([...stored, announcementId]))
    localStorage.setItem('bizflow-dismissed-announcements', JSON.stringify(next))
    setAnnouncements((current) => [...current])
  }, [])

  const updateTheme = useCallback(
    async (nextTheme) => {
      setTheme(nextTheme)
      await persistPreferences({ theme_preference: nextTheme, updated_at: new Date().toISOString() })
    },
    [persistPreferences]
  )

  const updateChecklistItem = useCallback(
    async (itemId, completed = true) => {
      const nextState = { ...checklistState, [itemId]: completed }
      setChecklistState(nextState)
      await persistPreferences({ checklist_state: nextState, updated_at: new Date().toISOString() })
    },
    [checklistState, persistPreferences]
  )

  const dismissChecklist = useCallback(async () => {
    setChecklistDismissed(true)
    await persistPreferences({ checklist_dismissed: true, updated_at: new Date().toISOString() })
  }, [persistPreferences])

  const value = useMemo(
    () => ({
      theme,
      setTheme: updateTheme,
      toggleTheme: () => updateTheme(theme === 'dark' ? 'light' : 'dark'),
      searchOpen,
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
      shortcutsOpen,
      openShortcuts: () => setShortcutsOpen(true),
      closeShortcuts: () => setShortcutsOpen(false),
      notifications,
      notificationsLoading,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      activeAnnouncement,
      dismissAnnouncement,
      filteredSearchGroups,
      searchLoading,
      checklist: {
        ...derivedChecklist,
        dismissed: checklistDismissed,
        dismissChecklist,
        updateChecklistItem,
      },
      planUsage,
      quickActions: QUICK_ACTIONS,
      settingsLinks: SETTINGS_LINKS,
      preferencesLoaded,
      session,
      business,
      setBusiness,
    }),
    [
      activeAnnouncement,
      business,
      checklistDismissed,
      derivedChecklist,
      dismissAnnouncement,
      dismissChecklist,
      filteredSearchGroups,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      notificationsLoading,
      planUsage,
      preferencesLoaded,
      searchLoading,
      searchOpen,
      session,
      setBusiness,
      shortcutsOpen,
      theme,
      unreadCount,
      updateChecklistItem,
      updateTheme,
      dismissNotification,
    ]
  )

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

AppShellProvider.propTypes = {
  children: PropTypes.node.isRequired,
  session: PropTypes.object,
  business: PropTypes.object,
  setBusiness: PropTypes.func,
}

export function useAppShell() {
  const context = useContext(AppShellContext)
  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider')
  }
  return context
}
