import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Plus,
  Users,
  Wallet,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import useAuth from '../../hooks/useAuth'
import useCountUp from '../../hooks/useCountUp'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'

const chartRanges = [
  { key: 'year', label: 'This Year' },
  { key: 'sixMonths', label: 'Last 6 Months' },
  { key: 'thirtyDays', label: 'Last 30 Days' },
]

const statusColors = {
  paid: '#10B981',
  pending: '#F59E0B',
  overdue: '#EF4444',
  draft: '#94A3B8',
}

const seedRevenue = [
  { label: 'Nov', value: 320000 },
  { label: 'Dec', value: 480000 },
  { label: 'Jan', value: 410000 },
  { label: 'Feb', value: 560000 },
  { label: 'Mar', value: 610000 },
  { label: 'Apr', value: 530000 },
]

function currency(value) {
  return `₦${Number(value || 0).toLocaleString()}`
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function isSameDay(dateA, dateB) {
  return dateA.toDateString() === dateB.toDateString()
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function timeAgo(dateString) {
  const value = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - value.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function statusVariant(status) {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'danger'
  if (status === 'pending' || status === 'partial' || status === 'sent') return 'warning'
  return 'neutral'
}

function deriveTrend(current, previous) {
  if (!previous) return '+0.0%'
  const diff = ((current - previous) / previous) * 100
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}%`
}

function DashboardStatCard({
  title,
  value,
  subvalue,
  trend,
  trendTone = 'neutral',
  icon,
  iconClassName,
  onClick,
  loading,
  sparkline = [],
  isCurrency = true,
}) {
  const count = useCountUp(value)
  const chartId = title.toLowerCase().replace(/\s+/g, '-')

  return (
    <Card
      hover={!loading && Boolean(onClick)}
      className={[
        'h-full overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5',
        onClick ? 'cursor-pointer' : '',
      ].join(' ').trim()}
      {...(onClick ? { onClick } : {})}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-11 w-11 rounded-2xl" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-500">{title}</p>
              <h3 className="mt-3 text-3xl font-black tracking-tight text-neutral-950">
                {typeof value === 'number' ? (isCurrency ? currency(count) : count.toLocaleString()) : value}
              </h3>
              {subvalue ? <p className="mt-2 text-sm font-medium text-neutral-500">{subvalue}</p> : null}
            </div>
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}>
              {icon}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className={`text-sm font-semibold ${trendTone === 'success' ? 'text-emerald-600' : trendTone === 'danger' ? 'text-red-500' : 'text-neutral-500'}`}>
              {trend}
            </span>
            <div className="h-14 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline.map((item, index) => ({ index, value: item }))}>
                  <defs>
                    <linearGradient id={`spark-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1A56DB" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#1A56DB" strokeWidth={2} fill={`url(#spark-${chartId})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

DashboardStatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  subvalue: PropTypes.string,
  trend: PropTypes.string.isRequired,
  trendTone: PropTypes.oneOf(['success', 'danger', 'neutral']),
  icon: PropTypes.node.isRequired,
  iconClassName: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  loading: PropTypes.bool,
  sparkline: PropTypes.arrayOf(PropTypes.number),
  isCurrency: PropTypes.bool,
}

function DashboardErrorState({ onRetry }) {
  return (
    <Card className="rounded-3xl border-red-200 bg-red-50">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-red-700">We could not load your dashboard right now.</h2>
          <p className="mt-2 text-sm leading-6 text-red-600">
            Your business data is safe. Let’s retry and pull the latest summary again.
          </p>
        </div>
        <Button variant="danger" onClick={onRetry}>Retry dashboard</Button>
      </div>
    </Card>
  )
}

DashboardErrorState.propTypes = {
  onRetry: PropTypes.func.isRequired,
}

export default function Dashboard({ business }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('sixMonths')
  const [invoiceRows, setInvoiceRows] = useState([])
  const [clients, setClients] = useState([])
  const [staff, setStaff] = useState([])
  const [activities, setActivities] = useState([])
  const [showAllActivity, setShowAllActivity] = useState(false)
  const [reminders, setReminders] = useState([])

  useEffect(() => {
    if (!business?.id) return undefined
    loadDashboard()

    const channel = supabase
      .channel(`app-dashboard-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` }, loadDashboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${business.id}` }, loadDashboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff', filter: `business_id=eq.${business.id}` }, loadDashboard)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [business?.id])

  async function fetchInvoices() {
    const joinedResponse = await supabase
      .from('invoices')
      .select('id,invoice_number,total,status,due_date,amount_paid,created_at,updated_at,client_snapshot,clients(name)')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (!joinedResponse.error) return joinedResponse.data || []

    const fallbackResponse = await supabase
      .from('invoices')
      .select('id,invoice_number,total,status,due_date,amount_paid,created_at,updated_at,client_snapshot')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (!fallbackResponse.error) return fallbackResponse.data || []

    throw fallbackResponse.error || joinedResponse.error
  }

  async function fetchClients() {
    const preferredResponse = await supabase
      .from('clients')
      .select('id,name,created_at,active')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (!preferredResponse.error) return preferredResponse.data || []

    const fallbackResponse = await supabase
      .from('clients')
      .select('id,name,created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (!fallbackResponse.error) return fallbackResponse.data || []

    throw fallbackResponse.error || preferredResponse.error
  }

  async function fetchStaff() {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async function loadDashboard() {
    if (!business?.id) return
    setLoading(true)
    setError('')

    try {
      const [nextInvoices, nextClients, nextStaff] = await Promise.all([
        fetchInvoices(),
        fetchClients(),
        fetchStaff(),
      ])

      setInvoiceRows(nextInvoices)
      setClients(nextClients)
      setStaff(nextStaff)
      setActivities(buildActivities(nextInvoices, nextClients, nextStaff))
      setReminders(buildReminders(nextInvoices, nextStaff))
      setLoading(false)
    } catch (fetchError) {
      setError(fetchError?.message || 'Unable to load dashboard')
      setLoading(false)
    }
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || business?.name?.split(' ')[0] || 'there'
  const todayLabel = formatLongDate(now)

  const pendingInvoices = useMemo(
    () => invoiceRows.filter((invoice) => !['paid', 'cancelled'].includes(invoice.status)),
    [invoiceRows],
  )

  const overdueInvoices = useMemo(
    () => pendingInvoices.filter((invoice) => invoice.due_date && new Date(invoice.due_date) < now),
    [pendingInvoices, now],
  )

  const paidRevenue = useMemo(
    () => invoiceRows.reduce((sum, invoice) => sum + Number(invoice.amount_paid ?? (invoice.status === 'paid' ? invoice.total : 0) ?? 0), 0),
    [invoiceRows],
  )

  const activeClients = useMemo(
    () => clients.filter((client) => client.active !== false).length,
    [clients],
  )

  const onLeaveToday = useMemo(
    () => staff.filter((member) => `${member.status || ''}`.toLowerCase().includes('leave')).length,
    [staff],
  )

  const pendingAmount = useMemo(
    () => pendingInvoices.reduce((sum, invoice) => sum + Math.max(Number(invoice.total || 0) - Number(invoice.amount_paid || 0), 0), 0),
    [pendingInvoices],
  )

  const monthlyRevenue = useMemo(
    () => buildRevenueSeries(invoiceRows, range),
    [invoiceRows, range],
  )

  const previousRevenue = useMemo(() => {
    if (monthlyRevenue.length < 2) return 0
    return monthlyRevenue[monthlyRevenue.length - 2]?.value || 0
  }, [monthlyRevenue])

  const statusBreakdown = useMemo(() => {
    const base = {
      paid: 0,
      pending: 0,
      overdue: 0,
      draft: 0,
    }

    invoiceRows.forEach((invoice) => {
      const normalized = invoice.status === 'partial' || invoice.status === 'sent' ? 'pending' : invoice.status
      if (normalized === 'paid') base.paid += 1
      else if (normalized === 'draft') base.draft += 1
      else if (invoice.due_date && new Date(invoice.due_date) < now && normalized !== 'paid') base.overdue += 1
      else base.pending += 1
    })

    return [
      { name: 'Paid', value: base.paid, color: statusColors.paid },
      { name: 'Pending', value: base.pending, color: statusColors.pending },
      { name: 'Overdue', value: base.overdue, color: statusColors.overdue },
      { name: 'Draft', value: base.draft, color: statusColors.draft },
    ]
  }, [invoiceRows, now])

  const isNewWorkspace = !loading && invoiceRows.length === 0 && clients.length === 0 && staff.length === 0
  const visibleActivities = showAllActivity ? activities : activities.slice(0, 4)

  if (error) {
    return <DashboardErrorState onRetry={loadDashboard} />
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-card"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Daily overview</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-neutral-950 md:text-4xl">{greeting}, {firstName} 👋</h1>
            <p className="mt-3 text-sm leading-7 text-neutral-500">Here’s your business summary for today.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-600">
            <CalendarDays className="mr-2 inline h-4 w-4 text-primary" />
            {todayLabel}
          </div>
        </div>

        {overdueInvoices.length > 0 ? (
          <button
            type="button"
            onClick={() => navigate('/app/invoices?filter=pending')}
            className="mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-left text-sm font-semibold text-red-700 transition hover:border-red-300"
          >
            <span className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ You have {overdueInvoices.length} overdue invoice{overdueInvoices.length === 1 ? '' : 's'}. Resolve now →
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        ) : null}
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total Revenue"
          value={paidRevenue}
          trend={`${deriveTrend(monthlyRevenue[monthlyRevenue.length - 1]?.value || 0, previousRevenue)} from last period`}
          trendTone="success"
          icon={<Wallet className="h-5 w-5 text-primary" />}
          iconClassName="bg-primary/10"
          loading={loading}
          sparkline={monthlyRevenue.map((item) => item.value)}
        />
        <DashboardStatCard
          title="Active Clients"
          value={activeClients}
          subvalue={`${clients.length} total clients`}
          trend={`+${Math.min(clients.length, 3)} this week`}
          trendTone="success"
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          iconClassName="bg-emerald-100"
          loading={loading}
          sparkline={buildMiniTrend(clients.length)}
          isCurrency={false}
        />
        <DashboardStatCard
          title="Pending Invoices"
          value={pendingAmount}
          subvalue={`${pendingInvoices.length} open invoice${pendingInvoices.length === 1 ? '' : 's'}`}
          trend={`${overdueInvoices.length} overdue`}
          trendTone={overdueInvoices.length ? 'danger' : 'neutral'}
          icon={<FileText className="h-5 w-5 text-amber-600" />}
          iconClassName="bg-amber-100"
          onClick={() => navigate('/app/invoices?filter=pending')}
          loading={loading}
          sparkline={buildMiniTrend(pendingInvoices.length)}
        />
        <DashboardStatCard
          title="Total Staff"
          value={staff.length}
          subvalue={`${onLeaveToday} on leave today`}
          trend="Team visibility updated"
          trendTone="neutral"
          icon={<BriefcaseBusiness className="h-5 w-5 text-violet-600" />}
          iconClassName="bg-violet-100"
          loading={loading}
          sparkline={buildMiniTrend(staff.length)}
          isCurrency={false}
        />
      </section>

      {isNewWorkspace ? (
        <EmptyState
          illustration={<CheckCircle2 className="h-14 w-14 text-primary" />}
          title="Your workspace is ready. Let’s bring it to life."
          description="BizFlow NG is set up for you. The next few steps will turn this into a fully working business workspace."
          ctaLabel="Add your first client"
          onCta={() => navigate('/app/clients')}
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card className="rounded-[32px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Revenue Overview</h2>
              <p className="mt-1 text-sm text-neutral-500">A clean look at how revenue is trending across your business.</p>
            </div>
            <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
              {chartRanges.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRange(option.key)}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold transition',
                    range === option.key ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-900',
                  ].join(' ').trim()}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 h-[320px]">
            {loading ? (
              <Skeleton variant="card" className="h-full rounded-[28px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1A56DB" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `₦${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 20px 45px rgba(15,23,42,0.08)' }}
                    formatter={(value) => [currency(value), 'Revenue']}
                    labelStyle={{ color: '#0F172A', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#1A56DB" strokeWidth={3} fill="url(#dashboardRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="rounded-[32px]">
          <div>
            <h2 className="text-xl font-bold text-neutral-950">Invoice Breakdown</h2>
            <p className="mt-1 text-sm text-neutral-500">See what is paid, pending, overdue, or still in draft.</p>
          </div>

          <div className="mt-6 h-[280px]">
            {loading ? (
              <Skeleton variant="card" className="h-full rounded-[28px]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" innerRadius={72} outerRadius={108} paddingAngle={4}>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-950 text-xl font-black">
                    {invoiceRows.length}
                  </text>
                  <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-sm font-medium">
                    invoices
                  </text>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {statusBreakdown.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{entry.name}</p>
                  <p className="text-xs text-neutral-500">{entry.value} invoice{entry.value === 1 ? '' : 's'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <Card className="rounded-[32px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Recent Transactions</h2>
              <p className="mt-1 text-sm text-neutral-500">The latest invoices and payment status changes.</p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="row" className="w-full rounded-2xl" />
                ))}
              </div>
            ) : invoiceRows.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center">
                <h3 className="text-lg font-bold text-neutral-950">No invoices yet</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">Once you create an invoice, your latest transactions will appear here automatically.</p>
              </div>
            ) : (
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Invoice #</th>
                    <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Client</th>
                    <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Amount</th>
                    <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Date</th>
                    <th className="px-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceRows.slice(0, 5).map((invoice) => (
                    <tr key={invoice.id} className="rounded-2xl bg-neutral-50">
                      <td className="rounded-l-2xl px-4 py-4 text-sm font-bold text-neutral-950">{invoice.invoice_number}</td>
                      <td className="px-4 py-4 text-sm text-neutral-600">{invoice.clients?.name || invoice.client_snapshot?.name || 'Unassigned client'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-neutral-950">{currency(invoice.total)}</td>
                      <td className="px-4 py-4 text-sm text-neutral-500">{new Date(invoice.created_at).toLocaleDateString('en-NG')}</td>
                      <td className="rounded-r-2xl px-4 py-4 text-sm">
                        <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-5">
            <Link to="/app/invoices" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View All Invoices <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <Card className="rounded-[32px]">
          <div>
            <h2 className="text-xl font-bold text-neutral-950">Quick Actions</h2>
            <p className="mt-1 text-sm text-neutral-500">Jump into the tasks that keep your business moving.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {[
              { label: 'New Invoice', to: '/app/invoices', icon: <FileText className="h-5 w-5" />, className: 'bg-primary text-white hover:bg-primary-dark' },
              { label: 'Add Client', to: '/app/clients', icon: <Users className="h-5 w-5" />, className: 'bg-emerald-500 text-white hover:bg-emerald-600' },
              { label: 'Add Staff', to: '/app/staff', icon: <Plus className="h-5 w-5" />, className: 'bg-violet-500 text-white hover:bg-violet-600' },
              { label: 'Run Payroll', to: '/app/payroll', icon: <CreditCard className="h-5 w-5" />, className: 'bg-amber-400 text-neutral-950 hover:bg-amber-500' },
            ].map((action) => (
              <Link key={action.label} to={action.to} className="no-underline">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`rounded-3xl p-5 shadow-card transition ${action.className}`}>
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    {action.icon}
                  </div>
                  <p className="text-base font-bold">{action.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[32px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Recent Activity</h2>
              <p className="mt-1 text-sm text-neutral-500">Important events across invoices, clients, and your team.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} variant="row" className="w-full rounded-2xl" />)
            ) : visibleActivities.length === 0 ? (
              <p className="text-sm text-neutral-500">Activity will appear here once you start using BizFlow.</p>
            ) : (
              visibleActivities.map((item, index) => (
                <div key={`${item.type}-${index}`} className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className={`mt-1 h-3 w-3 rounded-full ${item.dotClassName}`} />
                  <Avatar name={item.actor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-500">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-neutral-400">{item.time}</span>
                </div>
              ))
            )}
          </div>

          {activities.length > 4 ? (
            <div className="mt-5">
              <Button variant="outline" onClick={() => setShowAllActivity((value) => !value)}>
                {showAllActivity ? 'Show less' : 'Load more'}
              </Button>
            </div>
          ) : null}
        </Card>

        <Card className="rounded-[32px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Reminders</h2>
              <p className="mt-1 text-sm text-neutral-500">Stay ahead of what needs attention this week.</p>
            </div>
            <Button variant="ghost" leftIcon={<Plus className="h-4 w-4" />}>Add Reminder</Button>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="row" className="w-full rounded-2xl" />)
            ) : reminders.map((item) => (
              <label key={item.id} className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                <input
                  type="checkbox"
                  checked={Boolean(item.done)}
                  onChange={() => setReminders((current) => current.map((reminder) => (
                    reminder.id === item.id ? { ...reminder, done: !reminder.done } : reminder
                  )))}
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className={`mt-1 h-3 w-3 rounded-full ${item.dotClassName}`} />
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${item.done ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>{item.title}</p>
                  <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

Dashboard.propTypes = {
  business: PropTypes.object,
}

function buildRevenueSeries(invoices, range) {
  if (!invoices.length) {
    return seedRevenue
  }

  if (range === 'thirtyDays') {
    const days = Array.from({ length: 30 }).map((_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - index))
      return {
        key: date.toISOString().slice(0, 10),
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        value: 0,
      }
    })

    invoices.forEach((invoice) => {
      if (invoice.status !== 'paid' && !invoice.amount_paid) return
      const key = (invoice.updated_at || invoice.created_at || '').slice(0, 10)
      const day = days.find((entry) => entry.key === key)
      if (day) {
        day.value += Number(invoice.amount_paid ?? invoice.total ?? 0)
      }
    })

    return days
  }

  const monthCount = range === 'year' ? 12 : 6
  const months = Array.from({ length: monthCount }).map((_, index) => {
    const reference = new Date()
    reference.setMonth(reference.getMonth() - (monthCount - 1 - index))
    return {
      key: `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}`,
      label: reference.toLocaleString('en-NG', { month: 'short' }),
      value: 0,
    }
  })

  invoices.forEach((invoice) => {
    if (invoice.status !== 'paid' && !invoice.amount_paid) return
    const key = (invoice.updated_at || invoice.created_at || '').slice(0, 7)
    const month = months.find((entry) => entry.key === key)
    if (month) {
      month.value += Number(invoice.amount_paid ?? invoice.total ?? 0)
    }
  })

  return months
}

function buildMiniTrend(value) {
  const base = Math.max(1, value || 0)
  return [base * 0.55, base * 0.72, base * 0.88, base]
}

function buildActivities(invoices, clients, staff) {
  const invoiceActivities = invoices.slice(0, 4).map((invoice) => ({
    type: 'invoice',
    actor: invoice.clients?.name || invoice.client_snapshot?.name || 'Client',
    title: invoice.status === 'paid' ? `${invoice.invoice_number} paid` : `${invoice.invoice_number} updated`,
    description: `${invoice.clients?.name || invoice.client_snapshot?.name || 'A client'} ${invoice.status === 'paid' ? 'completed payment' : `is now marked ${invoice.status}`}.`,
    time: timeAgo(invoice.updated_at || invoice.created_at),
    dotClassName: invoice.status === 'paid' ? 'bg-emerald-500' : invoice.status === 'overdue' ? 'bg-red-500' : 'bg-amber-400',
    createdAt: invoice.updated_at || invoice.created_at,
  }))

  const clientActivities = clients.slice(0, 3).map((client) => ({
    type: 'client',
    actor: client.name,
    title: `New client added`,
    description: `${client.name} was added to your workspace.`,
    time: timeAgo(client.created_at),
    dotClassName: 'bg-primary',
    createdAt: client.created_at,
  }))

  const staffActivities = staff.slice(0, 3).map((member) => ({
    type: 'staff',
    actor: member.name || member.full_name || 'Staff member',
    title: `${member.name || member.full_name || 'A staff member'} added`,
    description: `${member.role || 'Team role'} is now part of your staff directory.`,
    time: timeAgo(member.created_at),
    dotClassName: 'bg-violet-500',
    createdAt: member.created_at,
  }))

  return [...invoiceActivities, ...clientActivities, ...staffActivities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
}

function buildReminders(invoices, staff) {
  const dueSoon = invoices
    .filter((invoice) => invoice.due_date && !['paid', 'cancelled'].includes(invoice.status))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 2)
    .map((invoice) => {
      const dueDate = new Date(invoice.due_date)
      const daysLeft = Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      return {
        id: `invoice-${invoice.id}`,
        title: `${invoice.invoice_number} due in ${daysLeft || 0} day${daysLeft === 1 ? '' : 's'}`,
        description: `${currency(Math.max(Number(invoice.total || 0) - Number(invoice.amount_paid || 0), 0))} still outstanding`,
        dotClassName: 'bg-amber-400',
        done: false,
      }
    })

  const payrollReminder = {
    id: 'payroll-monthly',
    title: 'Payroll due on 28th',
    description: 'Prepare salaries, deductions, and net pay before month-end.',
    dotClassName: 'bg-primary',
    done: false,
  }

  const birthdayToday = staff.find((member) => {
    if (!member.birthday && !member.date_of_birth) return false
    return isSameDay(new Date(member.birthday || member.date_of_birth), new Date())
  })

  const birthdayReminder = birthdayToday ? [{
    id: 'birthday-today',
    title: `${birthdayToday.name || birthdayToday.full_name || 'A team member'}'s birthday today 🎂`,
    description: 'A good moment to make the team feel appreciated.',
    dotClassName: 'bg-pink-500',
    done: false,
  }] : []

  return [...dueSoon, payrollReminder, ...birthdayReminder].slice(0, 4)
}
