import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Building2, Grid2X2, List, Mail, MessageCircle, Phone, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import useToast from '../../hooks/useToast'
import {
  buildClientStats,
  buildCoreClientPayload,
  buildRichClientPayload,
  clientAvatarTone,
  formatClientCurrency,
  getClientBusiness,
  getClientName,
  getClientStatus,
  getClientTags,
} from './clientShared'

const formSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  company_name: z.string().optional(),
  client_type: z.enum(['Individual', 'Business', 'Government']),
  status: z.enum(['active', 'inactive', 'lead']),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  same_as_phone: z.boolean().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  currency_preference: z.enum(['NGN', 'USD', 'GBP']),
  payment_terms: z.enum(['Net 7', 'Net 14', 'Net 30']),
  credit_limit: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  tag_input: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const defaultValues = {
  name: '',
  company_name: '',
  client_type: 'Individual',
  status: 'active',
  email: '',
  phone: '',
  whatsapp_number: '',
  same_as_phone: true,
  address: '',
  city: '',
  state: '',
  country: 'Nigeria',
  postal_code: '',
  currency_preference: 'NGN',
  payment_terms: 'Net 7',
  credit_limit: 0,
  notes: '',
  tag_input: '',
  tags: [],
}

const statusOptions = ['all', 'active', 'inactive', 'lead']

export default function Clients({ business }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('Date Added')
  const [viewMode, setViewMode] = useState('card')
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const tags = watch('tags') || []
  const tagInput = watch('tag_input') || ''
  const sameAsPhone = watch('same_as_phone')
  const phoneValue = watch('phone')

  useEffect(() => {
    if (!business?.id) return undefined
    loadClients()

    const channel = supabase
      .channel(`app-clients-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${business.id}` }, loadClients)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` }, loadClients)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [business?.id])

  useEffect(() => {
    if (sameAsPhone) {
      setValue('whatsapp_number', phoneValue || '')
    }
  }, [phoneValue, sameAsPhone, setValue])

  async function loadClients() {
    setLoading(true)
    const [clientRes, invoiceRes] = await Promise.all([
      supabase.from('clients').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
    ])
    setClients(clientRes.data || [])
    setInvoices(invoiceRes.data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditingClient(null)
    reset(defaultValues)
    setShowModal(true)
  }

  function openEdit(client) {
    setEditingClient(client)
    reset({
      name: getClientName(client),
      company_name: client.company_name || client.business_name || '',
      client_type: client.client_type || 'Individual',
      status: getClientStatus(client),
      email: client.email || '',
      phone: client.phone || '',
      whatsapp_number: client.whatsapp_number || client.phone || '',
      same_as_phone: (client.whatsapp_number || client.phone || '') === (client.phone || ''),
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      country: client.country || 'Nigeria',
      postal_code: client.postal_code || '',
      currency_preference: client.currency_preference || 'NGN',
      payment_terms: client.payment_terms || 'Net 7',
      credit_limit: client.credit_limit || 0,
      notes: client.notes || '',
      tag_input: '',
      tags: getClientTags(client),
    })
    setShowModal(true)
  }

  async function persistClient(values) {
    setSaving(true)
    const richPayload = buildRichClientPayload(values, business.id)
    const corePayload = buildCoreClientPayload(values, business.id)

    const primaryQuery = editingClient
      ? supabase.from('clients').update(richPayload).eq('id', editingClient.id).select().single()
      : supabase.from('clients').insert(richPayload).select().single()

    let result = await primaryQuery

    if (result.error) {
      const fallbackQuery = editingClient
        ? supabase.from('clients').update(corePayload).eq('id', editingClient.id).select().single()
        : supabase.from('clients').insert(corePayload).select().single()

      result = await fallbackQuery
    }

    setSaving(false)

    if (result.error) {
      toast.error(result.error.message || 'Unable to save client.')
      return
    }

    toast.success(editingClient ? 'Client updated.' : 'Client created.')
    setShowModal(false)
    setEditingClient(null)
    await loadClients()
  }

  async function deleteClient(id) {
    if (!window.confirm('Delete this client?')) return
    await supabase.from('clients').delete().eq('id', id)
    toast.success('Client deleted.')
    loadClients()
  }

  async function bulkDelete() {
    if (!selectedIds.length) return
    if (!window.confirm(`Delete ${selectedIds.length} selected client(s)?`)) return
    await supabase.from('clients').delete().in('id', selectedIds)
    setSelectedIds([])
    toast.success('Selected clients deleted.')
    loadClients()
  }

  function addTag() {
    const value = tagInput.trim()
    if (!value || tags.includes(value)) return
    setValue('tags', [...tags, value])
    setValue('tag_input', '')
  }

  function removeTag(tag) {
    setValue('tags', tags.filter((item) => item !== tag))
  }

  const clientRows = useMemo(() => {
    const rows = clients.map((client) => {
      const stats = buildClientStats(client, invoices)
      return {
        ...client,
        stats,
        derivedStatus: client.status || (stats.records.length ? 'active' : 'lead'),
      }
    }).filter((client) => {
      const haystack = `${getClientName(client)} ${client.email || ''} ${client.phone || ''}`.toLowerCase()
      const matchesQuery = haystack.includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'all' || client.derivedStatus === statusFilter
      return matchesQuery && matchesStatus
    })

    return rows.sort((left, right) => {
      if (sortBy === 'Name') return getClientName(left).localeCompare(getClientName(right))
      if (sortBy === 'Total Spent') return right.stats.totalPaid - left.stats.totalPaid
      return new Date(right.created_at || 0) - new Date(left.created_at || 0)
    })
  }, [clients, invoices, query, sortBy, statusFilter])

  const totalPages = Math.max(1, Math.ceil(clientRows.length / 10))
  const currentPage = Math.min(page, totalPages)
  const pagedClients = clientRows.slice((currentPage - 1) * 10, currentPage * 10)

  useEffect(() => {
    setPage(1)
  }, [query, statusFilter, sortBy, viewMode])

  const activeCount = clientRows.filter((client) => client.derivedStatus === 'active').length
  const leadCount = clientRows.filter((client) => client.derivedStatus === 'lead').length
  const totalSpent = clientRows.reduce((sum, client) => sum + client.stats.totalPaid, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-sub">Track relationships, payment history, CRM notes, and client-level activity from one polished workspace.</div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Client</Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} variant="card" className="h-32 rounded-3xl" />) : (
          <>
            <StatCard label="Total clients" value={clientRows.length} note="Saved CRM records" />
            <StatCard label="Active" value={activeCount} note="With ongoing activity" tone="success" />
            <StatCard label="Leads" value={leadCount} note="Need conversion follow-up" tone="warning" />
            <StatCard label="Total spent" value={formatClientCurrency(totalSpent)} note="Across all payments received" />
          </>
        )}
      </section>

      <Card className="rounded-[30px]">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <label className="flex min-w-[260px] items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <Search className="h-4 w-4 text-neutral-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, phone" className="w-full border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800">
              {statusOptions.map((option) => <option key={option} value={option}>{option === 'all' ? 'All status' : option.charAt(0).toUpperCase() + option.slice(1)}</option>)}
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800">
              {['Name', 'Date Added', 'Total Spent'].map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>

          <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
            <button type="button" onClick={() => setViewMode('card')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${viewMode === 'card' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'}`}><Grid2X2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => setViewMode('table')} className={`rounded-xl px-3 py-2 text-sm font-semibold ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'}`}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {viewMode === 'table' && selectedIds.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
            <p className="text-sm font-semibold text-neutral-900">{selectedIds.length} client{selectedIds.length === 1 ? '' : 's'} selected</p>
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={bulkDelete}>Bulk delete</Button>
          </div>
        ) : null}

        {loading ? (
          viewMode === 'card' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} variant="card" className="h-72 rounded-3xl" />)}</div>
          ) : (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} variant="row" className="w-full rounded-2xl" />)}</div>
          )
        ) : clientRows.length === 0 ? (
          <EmptyState illustration={<UserRound className="h-14 w-14 text-primary" />} title="No clients yet. Add your first client!" description="Build your CRM by saving clients now or adding them while creating invoices." ctaLabel="Add Client" onCta={openAdd} />
        ) : viewMode === 'card' ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedClients.map((client, index) => (
              <motion.div key={client.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <ClientCard client={client} onView={() => navigate(`/app/clients/${client.id}`)} onInvoice={() => navigate(`/app/invoices/new?clientId=${client.id}`)} onEdit={() => openEdit(client)} onDelete={() => deleteClient(client.id)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" checked={pagedClients.length > 0 && selectedIds.length === pagedClients.length} onChange={(event) => setSelectedIds(event.target.checked ? pagedClients.map((client) => client.id) : [])} /></th>
                  <th>Avatar + Name</th>
                  <th>Business</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedClients.map((client) => (
                  <tr key={client.id}>
                    <td><input type="checkbox" checked={selectedIds.includes(client.id)} onChange={() => setSelectedIds((current) => current.includes(client.id) ? current.filter((item) => item !== client.id) : [...current, client.id])} /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl font-bold ${clientAvatarTone(getClientName(client))}`}>{getClientName(client).slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="font-semibold text-neutral-900">{getClientName(client)}</div>
                          <div className="text-xs text-neutral-500">{client.client_type || 'Client'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getClientBusiness(client)}</td>
                    <td>{client.email || '—'}</td>
                    <td>{client.phone || '—'}</td>
                    <td className="font-bold text-neutral-900">{formatClientCurrency(client.stats.totalPaid)}</td>
                    <td><Badge variant={client.derivedStatus === 'active' ? 'success' : client.derivedStatus === 'lead' ? 'warning' : 'neutral'}>{client.derivedStatus}</Badge></td>
                    <td>{client.stats.lastActivity ? new Date(client.stats.lastActivity).toLocaleDateString('en-NG') : '—'}</td>
                    <td>
                      <div className="action-row">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/app/clients/${client.id}`)}>View</Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/app/invoices/new?clientId=${client.id}`)}>New Invoice</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {clientRows.length > 0 ? (
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-neutral-200 pt-5">
            <p className="text-sm text-neutral-500">Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, clientRows.length)} of {clientRows.length} clients</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
              <span className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingClient ? 'Edit client' : 'Add client'}>
        <form onSubmit={handleSubmit(persistClient)} className="space-y-6">
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-950">Personal Info</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full name" error={errors.name?.message} {...register('name')} />
              <Input label="Business / Company name" {...register('company_name')} />
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Client type</span>
              <select {...register('client_type')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                {['Individual', 'Business', 'Government'].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-950">Contact</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Email" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" {...register('phone')} />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" {...register('same_as_phone')} />
              Same as phone
            </label>
            <Input label="WhatsApp number" {...register('whatsapp_number')} />
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-950">Address</h3>
            <Input label="Street address" {...register('address')} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="City" {...register('city')} />
              <Input label="State" {...register('state')} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Country" {...register('country')} />
              <Input label="Postal code" {...register('postal_code')} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-950">Financial</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-neutral-700">Currency preference</span>
                <select {...register('currency_preference')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                  {['NGN', 'USD', 'GBP'].map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-neutral-700">Payment terms</span>
                <select {...register('payment_terms')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                  {['Net 7', 'Net 14', 'Net 30'].map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <Input label="Credit limit" type="number" {...register('credit_limit')} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-neutral-950">Notes & Tags</h3>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Notes</span>
              <textarea {...register('notes')} rows={4} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900" />
            </label>
            <div className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Tags</span>
              <div className="flex gap-2">
                <Input className="flex-1" placeholder="Type and press add" value={tagInput} onChange={(event) => setValue('tag_input', event.target.value)} />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button key={tag} type="button" onClick={() => removeTag(tag)} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {tag} ×
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={saving}>Save Client</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

Clients.propTypes = { business: PropTypes.object }

function StatCard({ label, value, note, tone = 'neutral' }) {
  const toneClasses = { neutral: 'text-neutral-950', success: 'text-emerald-600', warning: 'text-amber-500' }
  return (
    <Card className="rounded-3xl">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <h3 className={`mt-3 text-3xl font-black tracking-tight ${toneClasses[tone]}`}>{value}</h3>
      <p className="mt-2 text-sm text-neutral-500">{note}</p>
    </Card>
  )
}

StatCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, note: PropTypes.string.isRequired, tone: PropTypes.oneOf(['neutral', 'success', 'warning']) }

function ClientCard({ client, onView, onInvoice, onEdit, onDelete }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group rounded-[28px] border border-neutral-200 bg-neutral-50 p-5 shadow-sm transition-shadow hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl font-bold ${clientAvatarTone(getClientName(client))}`}>{getClientName(client).slice(0, 2).toUpperCase()}</div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{getClientName(client)}</h3>
            <p className="mt-1 text-sm text-neutral-500">{getClientBusiness(client)}</p>
          </div>
        </div>
        <Badge variant={client.derivedStatus === 'active' ? 'success' : client.derivedStatus === 'lead' ? 'warning' : 'neutral'}>{client.derivedStatus}</Badge>
      </div>

      <div className="mt-4 space-y-2 text-sm text-neutral-500">
        <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {client.email || 'No email'}</div>
        <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {client.phone || 'No phone'}</div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Total invoiced</p>
          <p className="mt-2 text-lg font-black text-neutral-900">{formatClientCurrency(client.stats.totalInvoiced)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Last activity</p>
          <p className="mt-2 text-sm font-bold text-neutral-900">{client.stats.lastActivity ? new Date(client.stats.lastActivity).toLocaleDateString('en-NG') : 'No activity yet'}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
        <Button variant="outline" size="sm" onClick={onView}>View</Button>
        <Button variant="outline" size="sm" onClick={onInvoice}>New Invoice</Button>
        <Button variant="outline" size="sm" leftIcon={<MessageCircle className="h-4 w-4" />} onClick={() => window.open(`https://wa.me/${(client.whatsapp_number || client.phone || '').replace(/[^\d]/g, '')}`)}>Message</Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
        <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
      </div>
    </motion.div>
  )
}

ClientCard.propTypes = {
  client: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onInvoice: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
