import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowDownWideNarrow,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Link2,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Dropdown from '../../components/ui/Dropdown'
import useToast from '../../hooks/useToast'
import {
  buildPaymentLink,
  buildPublicInvoiceUrl,
  formatCurrency,
  getBalance,
  getClientName,
  getPaidAmount,
  statusVariant,
} from './invoiceShared'

const perPage = 10
const statusOptions = ['all', 'draft', 'pending', 'paid', 'overdue']

export default function Invoices({ business }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState(searchParams.get('filter') || 'all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })

  useEffect(() => {
    if (!business?.id) return undefined
    loadInvoices()

    const channel = supabase
      .channel(`app-invoices-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` }, loadInvoices)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [business?.id])

  async function loadInvoices() {
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(name,email), payment_history')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Unable to load invoices right now.')
      setLoading(false)
      return
    }

    setInvoices(data || [])
    setLoading(false)
  }

  const filteredInvoices = useMemo(() => {
    const rows = invoices
      .map((invoice) => {
        const dueDate = invoice.due_date ? new Date(invoice.due_date) : null
        const overdue = dueDate && new Date(dueDate.toDateString()) < new Date(new Date().toDateString()) && getBalance(invoice) > 0
        return {
          ...invoice,
          derivedStatus: overdue && invoice.status !== 'paid' ? 'overdue' : invoice.status,
        }
      })
      .filter((invoice) => {
        const haystack = `${invoice.invoice_number} ${getClientName(invoice)}`.toLowerCase()
        const queryMatch = haystack.includes(query.toLowerCase())
        const statusMatch = status === 'all' || invoice.derivedStatus === status
        const createdAt = invoice.created_at ? new Date(invoice.created_at) : null
        const fromMatch = fromDate ? createdAt >= new Date(fromDate) : true
        const toMatch = toDate ? createdAt <= new Date(`${toDate}T23:59:59`) : true
        return queryMatch && statusMatch && fromMatch && toMatch
      })

    const sorted = [...rows].sort((left, right) => {
      const a = left[sortConfig.key]
      const b = right[sortConfig.key]
      if (sortConfig.key === 'client') {
        return sortConfig.direction === 'asc'
          ? getClientName(left).localeCompare(getClientName(right))
          : getClientName(right).localeCompare(getClientName(left))
      }
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? Number(left.total || 0) - Number(right.total || 0) : Number(right.total || 0) - Number(left.total || 0)
      }
      if (sortConfig.direction === 'asc') return `${a || ''}`.localeCompare(`${b || ''}`)
      return `${b || ''}`.localeCompare(`${a || ''}`)
    })

    return sorted
  }, [fromDate, invoices, query, sortConfig, status, toDate])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const visibleInvoices = filteredInvoices.slice((currentPage - 1) * perPage, currentPage * perPage)

  const totals = useMemo(() => ({
    invoiced: invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
    paid: invoices.reduce((sum, invoice) => sum + getPaidAmount(invoice), 0),
    pending: invoices.reduce((sum, invoice) => sum + Math.max(getBalance(invoice), 0), 0),
    overdue: invoices
      .filter((invoice) => invoice.due_date && new Date(invoice.due_date) < new Date() && getBalance(invoice) > 0)
      .reduce((sum, invoice) => sum + getBalance(invoice), 0),
  }), [invoices])

  useEffect(() => {
    setPage(1)
  }, [query, status, fromDate, toDate, sortConfig])

  function toggleSort(key) {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  function toggleAllVisible(checked) {
    if (checked) {
      setSelectedIds(visibleInvoices.map((invoice) => invoice.id))
      return
    }
    setSelectedIds([])
  }

  function toggleSingle(id) {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ))
  }

  async function exportCsv() {
    const rows = filteredInvoices.map((invoice) => ({
      invoice_number: invoice.invoice_number,
      client: getClientName(invoice),
      issue_date: invoice.created_at,
      due_date: invoice.due_date || '',
      amount: invoice.total || 0,
      paid: getPaidAmount(invoice),
      balance: getBalance(invoice),
      status: invoice.derivedStatus,
    }))

    const headers = Object.keys(rows[0] || {
      invoice_number: '',
      client: '',
      issue_date: '',
      due_date: '',
      amount: '',
      paid: '',
      balance: '',
      status: '',
    })
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'bizflow-invoices.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this invoice?')
    if (!confirmed) return
    await supabase.from('invoices').delete().eq('id', id)
    toast.success('Invoice deleted.')
    loadInvoices()
  }

  async function bulkDelete() {
    if (!selectedIds.length) return
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected invoice(s)?`)
    if (!confirmed) return
    await supabase.from('invoices').delete().in('id', selectedIds)
    setSelectedIds([])
    toast.success('Selected invoices deleted.')
    loadInvoices()
  }

  async function bulkMarkPaid() {
    if (!selectedIds.length) return
    const selectedInvoices = invoices.filter((invoice) => selectedIds.includes(invoice.id))
    await Promise.all(selectedInvoices.map((invoice) => (
      supabase.from('invoices').update({ status: 'paid', amount_paid: invoice.total || 0 }).eq('id', invoice.id)
    )))
    setSelectedIds([])
    toast.success('Selected invoices marked as paid.')
    loadInvoices()
  }

  function sendReminder(invoice) {
    const clientName = getClientName(invoice)
    const message = `Hello ${clientName}, this is a reminder for invoice ${invoice.invoice_number}. Outstanding balance: ${formatCurrency(getBalance(invoice))}.`
    window.open(`mailto:${invoice.clients?.email || invoice.client_snapshot?.email || ''}?subject=${encodeURIComponent(`Invoice reminder: ${invoice.invoice_number}`)}&body=${encodeURIComponent(message)}`)
    toast.success('Reminder draft opened.')
  }

  function bulkReminders() {
    const selected = invoices.filter((invoice) => selectedIds.includes(invoice.id))
    selected.forEach((invoice) => sendReminder(invoice))
  }

  async function copyPaymentLink(invoice) {
    const link = buildPaymentLink(invoice, invoice.business_snapshot || business)
    await navigator.clipboard.writeText(link)
    toast.success('Payment link copied.')
  }

  const showingFrom = filteredInvoices.length ? (currentPage - 1) * perPage + 1 : 0
  const showingTo = Math.min(currentPage * perPage, filteredInvoices.length)

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">Track billing, payment status, reminders, and invoice records from one polished workspace.</div>
        </div>
        <div className="page-header-actions">
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/app/invoices/new')}>
            New Invoice
          </Button>
        </div>
      </section>

      <Card className="rounded-[30px]">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,minmax(0,0.7fr))_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <Search className="h-4 w-4 text-neutral-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by client or invoice number"
              className="w-full border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800">
            {statusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            <CalendarRange className="h-4 w-4" />
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="border-0 bg-transparent text-neutral-800 focus:outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            <CalendarRange className="h-4 w-4" />
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="border-0 bg-transparent text-neutral-800 focus:outline-none" />
          </label>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} variant="card" className="h-32 rounded-3xl" />) : (
          <>
            <InvoiceStatCard label="Total Invoiced" value={formatCurrency(totals.invoiced)} />
            <InvoiceStatCard label="Total Paid" value={formatCurrency(totals.paid)} tone="success" />
            <InvoiceStatCard label="Pending" value={formatCurrency(totals.pending)} tone="warning" />
            <InvoiceStatCard label="Overdue" value={formatCurrency(totals.overdue)} tone="danger" />
          </>
        )}
      </section>

      <Card className="rounded-[30px]">
        {selectedIds.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
            <p className="text-sm font-semibold text-neutral-900">{selectedIds.length} invoice{selectedIds.length === 1 ? '' : 's'} selected</p>
            <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={bulkDelete}>Delete selected</Button>
            <Button variant="outline" size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={bulkMarkPaid}>Mark as paid</Button>
            <Button variant="outline" size="sm" leftIcon={<Mail className="h-4 w-4" />} onClick={bulkReminders}>Send reminders</Button>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} variant="row" className="w-full rounded-2xl" />)}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            illustration={<FileText className="h-14 w-14 text-primary" />}
            title="Create your first invoice"
            description="Your invoice list will show every draft, pending payment, and paid invoice once you start billing clients."
            ctaLabel="New Invoice"
            onCta={() => navigate('/app/invoices/new')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="px-3">
                      <input
                        type="checkbox"
                        checked={visibleInvoices.length > 0 && selectedIds.length === visibleInvoices.length}
                        onChange={(event) => toggleAllVisible(event.target.checked)}
                      />
                    </th>
                    {[
                      { label: 'Invoice #', key: 'invoice_number' },
                      { label: 'Client', key: 'client' },
                      { label: 'Issue Date', key: 'created_at' },
                      { label: 'Due Date', key: 'due_date' },
                      { label: 'Amount', key: 'amount' },
                      { label: 'Status', key: 'status' },
                    ].map((column) => (
                      <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
                        <button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-2">
                          {column.label}
                          <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInvoices.map((invoice) => {
                    const overdue = invoice.derivedStatus === 'overdue'
                    return (
                      <tr key={invoice.id} className={`bg-neutral-50 ${overdue ? 'border-l-4 border-red-400' : ''}`}>
                        <td className="rounded-l-2xl px-3 py-4">
                          <input type="checkbox" checked={selectedIds.includes(invoice.id)} onChange={() => toggleSingle(invoice.id)} />
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-neutral-950">{invoice.invoice_number}</td>
                        <td className="px-4 py-4 text-sm text-neutral-600">{getClientName(invoice)}</td>
                        <td className="px-4 py-4 text-sm text-neutral-500">{new Date(invoice.created_at).toLocaleDateString('en-NG')}</td>
                        <td className="px-4 py-4 text-sm text-neutral-500">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-NG') : '—'}</td>
                        <td className="px-4 py-4 text-sm font-bold text-neutral-950">{formatCurrency(invoice.total)}</td>
                        <td className="px-4 py-4 text-sm"><Badge variant={statusVariant(invoice.derivedStatus)}>{invoice.derivedStatus}</Badge></td>
                        <td className="rounded-r-2xl px-4 py-4 text-sm">
                          <Dropdown
                            trigger={<span className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700"><MoreHorizontal className="h-4 w-4" /> Actions</span>}
                            items={[
                              { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => navigate(`/app/invoices/${invoice.id}`) },
                              { label: 'Edit', icon: <FileText className="h-4 w-4" />, onClick: () => navigate(`/app/invoices/${invoice.id}/edit`) },
                              { label: 'Send Reminder', icon: <Mail className="h-4 w-4" />, onClick: () => sendReminder(invoice) },
                              { label: 'Copy Payment Link', icon: <Link2 className="h-4 w-4" />, onClick: () => copyPaymentLink(invoice) },
                              { label: 'Download PDF', icon: <Download className="h-4 w-4" />, onClick: () => navigate(`/app/invoices/${invoice.id}`) },
                              { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => handleDelete(invoice.id) },
                            ]}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-500">Showing {showingFrom}–{showingTo} of {filteredInvoices.length} invoices</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
                <span className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

Invoices.propTypes = {
  business: PropTypes.object,
}

function InvoiceStatCard({ label, value, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'text-neutral-900',
    success: 'text-emerald-600',
    warning: 'text-amber-500',
    danger: 'text-red-500',
  }

  return (
    <Card className="rounded-3xl">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <h3 className={`mt-3 text-3xl font-black tracking-tight ${toneClasses[tone]}`}>{value}</h3>
    </Card>
  )
}

InvoiceStatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['neutral', 'success', 'warning', 'danger']),
}
