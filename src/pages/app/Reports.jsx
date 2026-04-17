import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'framer-motion'
import { CalendarRange, Download, FileSpreadsheet, Filter, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import useToast from '../../hooks/useToast'
import { formatCurrency, getBalance, getClientName, getPaidAmount } from './invoiceShared'
import { formatCurrency as formatNaira, getStaffFullName } from './staffShared'

const tabs = ['Financial Overview', 'Invoice Analytics', 'Client Analytics', 'Staff & Payroll Analytics']
const presets = ['This Week', 'This Month', 'This Quarter', 'This Year', 'Custom']
const brandColors = ['#1A56DB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9']

function currency(value) {
  return formatCurrency(value || 0, 'NGN')
}

function shortDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function monthLabel(value) {
  if (!value) return '—'
  const date = typeof value === 'string' && value.length === 7 ? new Date(`${value}-01`) : new Date(value)
  return date.toLocaleDateString('en-NG', { month: 'short', year: '2-digit' })
}

function startOfWeek(date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1)
  copy.setDate(diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function dateRangeFromPreset(preset) {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (preset === 'This Week') {
    return { start: startOfWeek(now), end }
  }
  if (preset === 'This Month') {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end }
  }
  if (preset === 'This Quarter') {
    const quarter = Math.floor(now.getMonth() / 3)
    return { start: new Date(now.getFullYear(), quarter * 3, 1), end }
  }
  if (preset === 'This Year') {
    return { start: new Date(now.getFullYear(), 0, 1), end }
  }
  return { start: null, end: null }
}

function previousRange({ start, end }) {
  if (!start || !end) return { start: null, end: null }
  const diff = end.getTime() - start.getTime()
  const previousEnd = new Date(start.getTime() - 1)
  const previousStart = new Date(previousEnd.getTime() - diff)
  return { start: previousStart, end: previousEnd }
}

function inRange(dateValue, range) {
  if (!dateValue) return false
  const value = new Date(dateValue)
  if (Number.isNaN(value.getTime())) return false
  if (range.start && value < range.start) return false
  if (range.end && value > range.end) return false
  return true
}

function groupByMonth(items, getDate, makeSeed) {
  const map = {}
  items.forEach((item) => {
    const value = getDate(item)
    if (!value) return
    const key = String(value).slice(0, 7)
    if (!key) return
    map[key] = map[key] || makeSeed(key)
    map[key].items.push(item)
  })
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key))
}

function trendString(current, previous) {
  if (!previous) return '+0.0%'
  const diff = ((current - previous) / previous) * 100
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}%`
}

function average(values) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

async function exportReportPdf(element, fileName) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' })
  const imageData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = (canvas.height * pageWidth) / canvas.width
  pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight)
  pdf.save(fileName)
}

async function exportWorkbook(sheets, fileName) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  sheets.forEach(({ name, data }) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, name)
  })
  XLSX.writeFile(workbook, fileName)
}

export default function Reports({ business }) {
  const toast = useToast()
  const reportRef = useRef(null)
  const [activeTab, setActiveTab] = useState('Financial Overview')
  const [preset, setPreset] = useState('This Month')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])
  const [expenses, setExpenses] = useState([])
  const [clients, setClients] = useState([])
  const [staff, setStaff] = useState([])
  const [payrollRuns, setPayrollRuns] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])

  useEffect(() => {
    if (!business?.id) return undefined
    loadReports()

    const channel = supabase
      .channel(`app-reports-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll_runs', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leave_requests', filter: `business_id=eq.${business.id}` }, loadReports)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [business?.id])

  async function loadReports() {
    setLoading(true)
    const [invoiceRes, expenseRes, clientRes, staffRes, payrollRes, leaveRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name), client_snapshot').eq('business_id', business.id).order('created_at', { ascending: true }),
      supabase.from('expenses').select('*').eq('business_id', business.id).order('expense_date', { ascending: true }),
      supabase.from('clients').select('*').eq('business_id', business.id).order('created_at', { ascending: true }),
      supabase.from('staff').select('*').eq('business_id', business.id).order('created_at', { ascending: true }),
      supabase.from('payroll_runs').select('*').eq('business_id', business.id).order('processed_at', { ascending: true }),
      supabase.from('leave_requests').select('*').eq('business_id', business.id).order('created_at', { ascending: true }),
    ])
    setInvoices(invoiceRes.data || [])
    setExpenses(expenseRes.error ? [] : (expenseRes.data || []))
    setClients(clientRes.data || [])
    setStaff(staffRes.data || [])
    setPayrollRuns(payrollRes.error ? [] : (payrollRes.data || []))
    setLeaveRequests(leaveRes.error ? [] : (leaveRes.data || []))
    setLoading(false)
  }

  const range = useMemo(() => {
    if (preset === 'Custom') {
      return {
        start: customRange.start ? new Date(customRange.start) : null,
        end: customRange.end ? new Date(`${customRange.end}T23:59:59.999`) : null,
      }
    }
    return dateRangeFromPreset(preset)
  }, [customRange, preset])

  const priorRange = useMemo(() => previousRange(range), [range])

  const filteredInvoices = useMemo(() => invoices.filter((invoice) => inRange(invoice.created_at, range)), [invoices, range])
  const filteredExpenses = useMemo(() => expenses.filter((expense) => inRange(expense.expense_date || expense.created_at, range)), [expenses, range])
  const filteredClients = useMemo(() => clients.filter((client) => inRange(client.created_at, range)), [clients, range])
  const filteredPayrollRuns = useMemo(() => payrollRuns.filter((run) => inRange(run.processed_at || run.created_at, range)), [payrollRuns, range])
  const filteredLeaveRequests = useMemo(() => leaveRequests.filter((request) => inRange(request.created_at, range)), [leaveRequests, range])

  const previousInvoices = useMemo(() => invoices.filter((invoice) => inRange(invoice.created_at, priorRange)), [invoices, priorRange])
  const previousExpenses = useMemo(() => expenses.filter((expense) => inRange(expense.expense_date || expense.created_at, priorRange)), [expenses, priorRange])

  const totals = useMemo(() => {
    const revenue = filteredInvoices.reduce((sum, invoice) => sum + getPaidAmount(invoice), 0)
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const outstanding = filteredInvoices.reduce((sum, invoice) => sum + getBalance(invoice), 0)
    const previousRevenue = previousInvoices.reduce((sum, invoice) => sum + getPaidAmount(invoice), 0)
    const previousExpenseTotal = previousExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    return {
      revenue,
      expenses: totalExpenses,
      profit: revenue - totalExpenses,
      outstanding,
      revenueTrend: trendString(revenue, previousRevenue),
      expenseTrend: trendString(totalExpenses, previousExpenseTotal),
    }
  }, [filteredExpenses, filteredInvoices, previousExpenses, previousInvoices])

  const financialMonthly = useMemo(() => {
    const map = {}
    const take = (key) => {
      map[key] = map[key] || { key, label: monthLabel(key), revenue: 0, target: 0, expenses: 0, cashIn: 0, cashOut: 0, paid: 0, pending: 0, overdue: 0, draft: 0 }
      return map[key]
    }
    invoices.forEach((invoice) => {
      const key = String(invoice.created_at || '').slice(0, 7)
      if (!key) return
      const row = take(key)
      const paid = getPaidAmount(invoice)
      row.revenue += paid
      row.cashIn += paid
      row.target = Math.max(row.target, row.revenue * 1.15 || invoice.total || 0)
      row[invoice.status] = (row[invoice.status] || 0) + 1
    })
    expenses.forEach((expense) => {
      const key = String(expense.expense_date || expense.created_at || '').slice(0, 7)
      if (!key) return
      const row = take(key)
      row.expenses += Number(expense.amount || 0)
      row.cashOut += Number(expense.amount || 0)
    })
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key)).slice(-6)
  }, [expenses, invoices])

  const clientRevenueRows = useMemo(() => {
    const grouped = filteredInvoices.reduce((acc, invoice) => {
      const name = getClientName(invoice)
      acc[name] = acc[name] || { client: name, revenue: 0, invoiced: 0, outstanding: 0, lastActivity: invoice.created_at }
      acc[name].revenue += getPaidAmount(invoice)
      acc[name].invoiced += Number(invoice.total || 0)
      acc[name].outstanding += getBalance(invoice)
      acc[name].lastActivity = invoice.created_at > acc[name].lastActivity ? invoice.created_at : acc[name].lastActivity
      return acc
    }, {})
    return Object.values(grouped).sort((a, b) => b.revenue - a.revenue)
  }, [filteredInvoices])

  const paymentStatusData = useMemo(() => {
    const statusCount = filteredInvoices.reduce((acc, invoice) => {
      const key = invoice.status || 'draft'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return Object.entries(statusCount).map(([name, value], index) => ({
      name,
      value,
      color: brandColors[index % brandColors.length],
    }))
  }, [filteredInvoices])

  const recentTransactions = useMemo(() => filteredInvoices.slice(-20).reverse().map((invoice) => ({
    id: invoice.id,
    reference: invoice.invoice_number,
    client: getClientName(invoice),
    amount: Number(invoice.total || 0),
    paid: getPaidAmount(invoice),
    date: invoice.created_at,
    status: invoice.status || 'draft',
  })), [filteredInvoices])

  const invoiceAnalytics = useMemo(() => {
    const totalSent = filteredInvoices.filter((invoice) => ['sent', 'pending', 'partial', 'overdue', 'paid'].includes(invoice.status)).length
    const averageInvoiceValue = average(filteredInvoices.map((invoice) => Number(invoice.total || 0)))
    const paidInvoices = filteredInvoices.filter((invoice) => invoice.status === 'paid' || Number(invoice.amount_paid || 0) > 0)
    const averageDaysToPay = average(paidInvoices.map((invoice) => {
      if (!invoice.created_at || !invoice.updated_at) return 0
      return Math.max(0, Math.round((new Date(invoice.updated_at) - new Date(invoice.created_at)) / (1000 * 60 * 60 * 24)))
    }))
    const collectionRate = filteredInvoices.length ? (paidInvoices.length / filteredInvoices.length) * 100 : 0

    const sentVsPaid = financialMonthly.map((row) => ({
      label: row.label,
      sent: filteredInvoices.filter((invoice) => String(invoice.created_at || '').slice(0, 7) === row.key).length,
      paid: filteredInvoices.filter((invoice) => String(invoice.created_at || '').slice(0, 7) === row.key && invoice.status === 'paid').length,
    }))

    const today = new Date()
    const aging = filteredInvoices.reduce((acc, invoice) => {
      if (invoice.status === 'paid') return acc
      const due = invoice.due_date ? new Date(invoice.due_date) : new Date(invoice.created_at)
      const overdueDays = Math.max(0, Math.round((today - due) / (1000 * 60 * 60 * 24)))
      if (overdueDays <= 30) acc.current += 1
      else if (overdueDays <= 60) acc.mid += 1
      else acc.late += 1
      return acc
    }, { current: 0, mid: 0, late: 0 })

    return {
      totalSent,
      averageInvoiceValue,
      averageDaysToPay,
      collectionRate,
      sentVsPaid,
      aging: [
        { bucket: '0–30 days', value: aging.current },
        { bucket: '31–60 days', value: aging.mid },
        { bucket: '60+ days', value: aging.late },
      ],
    }
  }, [filteredInvoices, financialMonthly])

  const clientAnalytics = useMemo(() => {
    const activeClients = clients.filter((client) => {
      const activity = invoices.some((invoice) => (invoice.client_id && invoice.client_id === client.id) || getClientName(invoice) === (client.name || client.full_name))
      return activity
    })
    const previousActive = clients.filter((client) => inRange(client.created_at, priorRange))
    const retentionRate = previousActive.length ? (activeClients.length / previousActive.length) * 100 : 0
    const topContribution = clientRevenueRows.length && totals.revenue ? (clientRevenueRows[0].revenue / totals.revenue) * 100 : 0

    const growthOverTime = groupByMonth(clients, (client) => client.created_at, (key) => ({ key, label: monthLabel(key), clients: 0, items: [] }))
      .map((row, index, rows) => ({
        label: row.label,
        clients: rows.slice(0, index + 1).reduce((sum, current) => sum + current.items.length, 0),
      }))

    const typeBreakdown = clients.reduce((acc, client) => {
      const key = client.client_type || 'Unspecified'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const stateBreakdown = clients.reduce((acc, client) => {
      const key = client.state || 'Unspecified'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return {
      totalActiveClients: activeClients.length,
      newClients: filteredClients.length,
      retentionRate,
      topContribution,
      growthOverTime,
      typeBreakdown: Object.entries(typeBreakdown).map(([name, value], index) => ({ name, value, color: brandColors[index % brandColors.length] })),
      stateBreakdown: Object.entries(stateBreakdown).map(([state, value]) => ({ state, value })).sort((a, b) => b.value - a.value).slice(0, 8),
      topClientsTable: clientRevenueRows.slice(0, 10).map((client) => ({
        name: client.client,
        totalInvoiced: client.invoiced,
        totalPaid: client.revenue,
        outstanding: client.outstanding,
        lastActivity: client.lastActivity,
      })),
    }
  }, [clientRevenueRows, clients, filteredClients, invoices, priorRange, totals.revenue])

  const payrollAnalytics = useMemo(() => {
    const totalPayrollCost = filteredPayrollRuns.reduce((sum, run) => sum + Number(run.total_net || 0), 0)
    const avgSalary = average(staff.map((member) => Number(member.gross_salary || member.salary || 0)))
    const departmentHeadcount = staff.reduce((acc, member) => {
      const key = member.department || 'Unassigned'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const leaveUtilization = leaveRequests.length ? (filteredLeaveRequests.length / leaveRequests.length) * 100 : 0

    const payrollTrend = groupByMonth(payrollRuns, (run) => run.processed_at || run.created_at, (key) => ({ key, label: monthLabel(key), total: 0, items: [] }))
      .map((row) => ({
        label: row.label,
        total: row.items.reduce((sum, run) => sum + Number(run.total_net || 0), 0),
      }))

    const leaveByType = filteredLeaveRequests.reduce((acc, request) => {
      const key = request.leave_type || 'Other'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    return {
      totalPayrollCost,
      avgSalary,
      departmentHeadcount: Object.entries(departmentHeadcount).map(([department, value]) => ({ department, value })),
      leaveUtilization,
      payrollTrend,
      leaveByType: Object.entries(leaveByType).map(([name, value], index) => ({ name, value, color: brandColors[index % brandColors.length] })),
    }
  }, [filteredLeaveRequests, filteredPayrollRuns, leaveRequests.length, payrollRuns, staff])

  async function handleExportPdf() {
    if (!reportRef.current) return
    await exportReportPdf(reportRef.current, `bizflow-report-${preset.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    toast.success('Report PDF generated.')
  }

  async function handleExportExcel() {
    await exportWorkbook([
      {
        name: 'Financial',
        data: financialMonthly.map((row) => ({
          Month: row.label,
          Revenue: row.revenue,
          Expenses: row.expenses,
          CashIn: row.cashIn,
          CashOut: row.cashOut,
        })),
      },
      {
        name: 'Invoices',
        data: recentTransactions.map((row) => ({
          Invoice: row.reference,
          Client: row.client,
          Amount: row.amount,
          Paid: row.paid,
          Status: row.status,
          Date: shortDate(row.date),
        })),
      },
      {
        name: 'Clients',
        data: clientAnalytics.topClientsTable,
      },
      {
        name: 'Payroll',
        data: payrollAnalytics.departmentHeadcount,
      },
    ], `bizflow-report-${preset.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
    toast.success('Excel workbook exported.')
  }

  const hasData = filteredInvoices.length || filteredExpenses.length || filteredClients.length || filteredPayrollRuns.length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" ref={reportRef}>
      <section className="page-header">
        <div>
          <div className="page-title">Reports &amp; Analytics</div>
          <div className="page-sub">Track revenue, collections, client performance, payroll cost, and business health with one polished analytics workspace.</div>
        </div>
        <div className="page-header-actions">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600">
            <CalendarRange className="h-4 w-4" />
            <select value={preset} onChange={(event) => setPreset(event.target.value)} className="bg-transparent text-sm font-semibold text-neutral-800 focus:outline-none">
              {presets.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          {preset === 'Custom' ? (
            <>
              <input type="date" value={customRange.start} onChange={(event) => setCustomRange((current) => ({ ...current, start: event.target.value }))} className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700" />
              <input type="date" value={customRange.end} onChange={(event) => setCustomRange((current) => ({ ...current, end: event.target.value }))} className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700" />
            </>
          ) : null}
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleExportPdf}>Export Report</Button>
          <Button variant="outline" leftIcon={<FileSpreadsheet className="h-4 w-4" />} onClick={handleExportExcel}>Export to Excel</Button>
        </div>
      </section>

      <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} variant="card" className="h-36 rounded-3xl" />)}
        </div>
      ) : !hasData ? (
        <EmptyState
          illustration={<TrendingUp className="h-14 w-14 text-primary" />}
          title="No data for this period"
          description="Create invoices, add clients, record expenses, or run payroll to unlock reporting insights for this time range."
        />
      ) : null}

      {!loading && hasData && activeTab === 'Financial Overview' ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Revenue" value={currency(totals.revenue)} detail={`${totals.revenueTrend} vs last period`} tone="success" />
            <KpiCard label="Total Expenses" value={currency(totals.expenses)} detail={`${totals.expenseTrend} vs last period`} tone="danger" />
            <KpiCard label="Net Profit" value={currency(totals.profit)} detail={totals.profit >= 0 ? 'Revenue ahead of expenses' : 'Expenses ahead of revenue'} tone={totals.profit >= 0 ? 'success' : 'danger'} />
            <KpiCard label="Outstanding Receivables" value={currency(totals.outstanding)} detail="Still awaiting collection" tone="warning" />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <ChartCard title="Revenue vs Target">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={financialMonthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `₦${Number(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => currency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#1A56DB" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="target" fill="#C7D2FE" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Revenue by Client">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clientRevenueRows.slice(0, 5)} layout="vertical" margin={{ left: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `₦${Number(value / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="client" width={120} />
                  <Tooltip formatter={(value) => currency(value)} />
                  <Bar dataKey="revenue" fill="#10B981" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ChartCard title="Cash Flow">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={financialMonthly}>
                  <defs>
                    <linearGradient id="cashIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1A56DB" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="cashOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `₦${Number(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => currency(value)} />
                  <Area type="monotone" dataKey="cashIn" stroke="#1A56DB" fill="url(#cashIn)" strokeWidth={3} />
                  <Area type="monotone" dataKey="cashOut" stroke="#EF4444" fill="url(#cashOut)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Payment Status Distribution">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={paymentStatusData} dataKey="value" nameKey="name" innerRadius={75} outerRadius={110} paddingAngle={3}>
                    {paymentStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} invoice${value === 1 ? '' : 's'}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap gap-3">
                {paymentStatusData.map((entry) => (
                  <div key={entry.name} className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          <Card className="rounded-[32px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-950">Recent transactions</h2>
                <p className="mt-1 text-sm text-neutral-500">The latest 20 invoice records in the selected period.</p>
              </div>
              <Badge variant="info">{recentTransactions.length} records</Badge>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((row) => (
                    <tr key={row.id}>
                      <td className="font-semibold text-neutral-900">{row.reference}</td>
                      <td>{row.client}</td>
                      <td>{currency(row.amount)}</td>
                      <td>{currency(row.paid)}</td>
                      <td>{shortDate(row.date)}</td>
                      <td><Badge variant={row.status === 'paid' ? 'success' : row.status === 'overdue' ? 'danger' : row.status === 'draft' ? 'neutral' : 'warning'}>{row.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}

      {!loading && hasData && activeTab === 'Invoice Analytics' ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Invoices Sent" value={invoiceAnalytics.totalSent} detail="Sent or client-ready invoices" tone="info" />
            <KpiCard label="Average Invoice Value" value={currency(invoiceAnalytics.averageInvoiceValue)} detail="Across selected invoices" tone="success" />
            <KpiCard label="Average Days to Pay" value={`${invoiceAnalytics.averageDaysToPay.toFixed(0)} days`} detail="Based on paid invoices" tone="warning" />
            <KpiCard label="Collection Rate" value={`${invoiceAnalytics.collectionRate.toFixed(0)}%`} detail="Paid invoices as a share of all invoices" tone="success" />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <ChartCard title="Invoices Sent vs Paid">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={invoiceAnalytics.sentVsPaid}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#1A56DB" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="paid" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Invoice Aging">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={invoiceAnalytics.aging}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <Card className="rounded-[32px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-950">Top 10 Clients by Revenue</h2>
                <p className="mt-1 text-sm text-neutral-500">Combined table and visual ranking for the strongest customer accounts.</p>
              </div>
              <Badge variant="info">{clientRevenueRows.slice(0, 10).length} clients</Badge>
            </div>
            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Revenue</th>
                      <th>Total Invoiced</th>
                      <th>Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientRevenueRows.slice(0, 10).map((client) => (
                      <tr key={client.client}>
                        <td className="font-semibold text-neutral-900">{client.client}</td>
                        <td>{currency(client.revenue)}</td>
                        <td>{currency(client.invoiced)}</td>
                        <td>{currency(client.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientRevenueRows.slice(0, 10)} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `₦${Number(value / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="client" width={120} />
                    <Tooltip formatter={(value) => currency(value)} />
                    <Bar dataKey="revenue" fill="#1A56DB" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </>
      ) : null}

      {!loading && hasData && activeTab === 'Client Analytics' ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Active Clients" value={clientAnalytics.totalActiveClients} detail="Clients with invoice activity" tone="success" />
            <KpiCard label="New Clients This Period" value={clientAnalytics.newClients} detail="Created within this range" tone="info" />
            <KpiCard label="Client Retention Rate" value={`${clientAnalytics.retentionRate.toFixed(0)}%`} detail="Active clients vs previous range" tone="warning" />
            <KpiCard label="Top Client Contribution" value={`${clientAnalytics.topContribution.toFixed(0)}%`} detail="Largest revenue share" tone="success" />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <ChartCard title="Client Growth Over Time">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={clientAnalytics.growthOverTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="clients" stroke="#1A56DB" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Revenue by Industry / Type">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={clientAnalytics.typeBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                    {clientAnalytics.typeBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <ChartCard title="Client Map by Location">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clientAnalytics.stateBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="state" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F59E0B" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card className="rounded-[32px]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-950">Top 10 Clients</h2>
                  <p className="mt-1 text-sm text-neutral-500">Best-performing clients with invoice, payment, and balance context.</p>
                </div>
                <Badge variant="info">{clientAnalytics.topClientsTable.length} clients</Badge>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Total Invoiced</th>
                      <th>Total Paid</th>
                      <th>Outstanding</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientAnalytics.topClientsTable.map((client) => (
                      <tr key={client.name}>
                        <td className="font-semibold text-neutral-900">{client.name}</td>
                        <td>{currency(client.totalInvoiced)}</td>
                        <td>{currency(client.totalPaid)}</td>
                        <td>{currency(client.outstanding)}</td>
                        <td>{shortDate(client.lastActivity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      ) : null}

      {!loading && hasData && activeTab === 'Staff & Payroll Analytics' ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Payroll Cost" value={currency(payrollAnalytics.totalPayrollCost)} detail="For the selected period" tone="danger" />
            <KpiCard label="Avg Salary" value={currency(payrollAnalytics.avgSalary)} detail="Current gross salary average" tone="info" />
            <KpiCard label="Headcount by Department" value={payrollAnalytics.departmentHeadcount.length} detail="Tracked departments" tone="success" />
            <KpiCard label="Leave Utilization Rate" value={`${payrollAnalytics.leaveUtilization.toFixed(0)}%`} detail="Leave activity in period" tone="warning" />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <ChartCard title="Payroll Cost Trend">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={payrollAnalytics.payrollTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `₦${Number(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => currency(value)} />
                  <Line type="monotone" dataKey="total" stroke="#1A56DB" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Department Headcount Comparison">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={payrollAnalytics.departmentHeadcount}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <ChartCard title="Leave Requests by Type">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={payrollAnalytics.leaveByType} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                    {payrollAnalytics.leaveByType.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card className="rounded-[32px]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-950">Payroll and team notes</h2>
                  <p className="mt-1 text-sm text-neutral-500">Practical people insights from the current reporting window.</p>
                </div>
                <Badge variant="info">{staff.length} staff</Badge>
              </div>
              <div className="mt-6 grid gap-3">
                {staff.slice(0, 6).map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div>
                      <p className="font-semibold text-neutral-900">{getStaffFullName(member)}</p>
                      <p className="text-sm text-neutral-500">{member.department || 'Unassigned'} • {member.job_title || member.role || 'Team member'}</p>
                    </div>
                    <strong className="text-sm font-bold text-neutral-950">{formatNaira(member.gross_salary || member.salary || 0)}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </motion.div>
  )
}

Reports.propTypes = {
  business: PropTypes.object,
}

function KpiCard({ label, value, detail, tone = 'info' }) {
  const toneClasses = {
    success: 'text-emerald-600',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-primary',
  }

  return (
    <Card className="rounded-3xl">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <h3 className={`mt-3 text-3xl font-black tracking-tight ${toneClasses[tone]}`}>{value}</h3>
      <p className="mt-2 text-sm text-neutral-500">{detail}</p>
    </Card>
  )
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  detail: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['success', 'warning', 'danger', 'info']),
}

function ChartCard({ title, children }) {
  return (
    <Card className="rounded-[32px]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-neutral-950">{title}</h2>
        <Badge variant="info">Live</Badge>
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  )
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
