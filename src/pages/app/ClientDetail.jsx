import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Mail, MessageCircle, Phone, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import useToast from '../../hooks/useToast'
import { buildClientStats, clientAvatarTone, formatClientCurrency, getClientAddress, getClientBusiness, getClientName, getClientStatus, getClientTags } from './clientShared'

const tabs = ['overview', 'invoices', 'activity', 'files']

function logClientDetailError(scope, error, businessId, clientId) {
  if (!error) return
  console.error(`[ClientDetail:${scope}]`, {
    businessId,
    clientId,
    message: error.message || 'Unknown client detail error',
    details: error.details || null,
    hint: error.hint || null,
    code: error.code || null,
  })
}

export default function ClientDetail({ business }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [client, setClient] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!id || !business?.id) return
    loadClient()
  }, [id, business?.id])

  async function loadClient() {
    setLoading(true)
    const [clientRes, invoiceRes] = await Promise.allSettled([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('invoices').select('*').eq('client_id', id).eq('business_id', business.id).order('created_at', { ascending: false }),
    ])

    const clientError = clientRes.status === 'fulfilled' ? clientRes.value.error : clientRes.reason
    const invoiceError = invoiceRes.status === 'fulfilled' ? invoiceRes.value.error : invoiceRes.reason

    if (clientError) logClientDetailError('load-client', clientError, business.id, id)
    if (invoiceError) logClientDetailError('load-invoices', invoiceError, business.id, id)

    const nextClient = clientRes.status === 'fulfilled' && !clientRes.value.error ? (clientRes.value.data || null) : null
    const nextInvoices = invoiceRes.status === 'fulfilled' && !invoiceRes.value.error ? (invoiceRes.value.data || []) : []

    setClient(nextClient)
    setInvoices(nextInvoices)
    setNotes(nextClient?.notes || '')

    if (nextClient) {
      await loadFiles()
    } else {
      setFiles([])
    }

    if (clientError && invoiceError) {
      toast.error('We could not load this client right now.')
    }

    setLoading(false)
  }

  async function loadFiles() {
    const { data, error } = await supabase.storage.from('client-files').list(`${business.id}/${id}`, { limit: 50 })
    if (error) {
      logClientDetailError('load-files', error, business.id, id)
      setFiles([])
      return
    }
    setFiles(data || [])
  }

  async function saveNotes() {
    if (!client) return
    setSavingNotes(true)
    const { error } = await supabase.from('clients').update({ notes }).eq('id', client.id)
    setSavingNotes(false)
    if (error) {
      logClientDetailError('save-notes', error, business.id, id)
      toast.error('Notes could not be saved with the current client schema.')
      return
    }
    toast.success('Notes updated.')
    loadClient()
  }

  async function deleteClient() {
    if (!window.confirm('Delete this client?')) return
    const { error } = await supabase.from('clients').delete().eq('id', client.id)
    if (error) {
      logClientDetailError('delete', error, business.id, id)
      toast.error(error.message || 'Client could not be deleted.')
      return
    }
    toast.success('Client deleted.')
    navigate('/app/clients')
  }

  async function uploadFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${business.id}/${id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('client-files').upload(path, file, { upsert: true })
    setUploading(false)
    if (error) {
      logClientDetailError('upload-file', error, business.id, id)
      toast.error('Upload failed. Make sure the client-files bucket exists.')
      return
    }
    toast.success('File uploaded.')
    loadFiles()
  }

  const stats = useMemo(() => buildClientStats(client || {}, invoices), [client, invoices])
  const timeline = useMemo(() => {
    if (!client) return []
    const base = [
      { label: 'Client record created', time: client.created_at },
      { label: 'Client profile last updated', time: client.updated_at || client.created_at },
    ]
    const invoiceEvents = invoices.flatMap((invoice) => ([
      { label: `Invoice ${invoice.invoice_number} created`, time: invoice.created_at },
      { label: `Invoice ${invoice.invoice_number} ${invoice.status}`, time: invoice.updated_at || invoice.created_at },
      ...(Array.isArray(invoice.payment_history) ? invoice.payment_history.map((payment) => ({ label: `Payment received: ${formatClientCurrency(payment.amount, invoice.currency || 'NGN')}`, time: payment.recorded_at || payment.date })) : []),
    ]))
    return [...base, ...invoiceEvents].filter((item) => item.time).sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [client, invoices])

  if (loading) return <Skeleton variant="card" className="h-[780px] rounded-3xl" />
  if (!client) return <Card className="rounded-[32px]"><h2 className="text-xl font-bold text-neutral-950">Client not found</h2></Card>

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="page-header">
        <div>
          <Link to="/app/clients" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> Back to clients</Link>
          <div className="flex items-center gap-4">
            <div className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl text-lg font-black ${clientAvatarTone(getClientName(client))}`}>{getClientName(client).slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="page-title">{getClientName(client)}</div>
              <div className="page-sub">{getClientBusiness(client)}</div>
            </div>
          </div>
        </div>
        <div className="page-header-actions">
          <Badge variant={getClientStatus(client) === 'active' ? 'success' : getClientStatus(client) === 'lead' ? 'warning' : 'neutral'}>{getClientStatus(client)}</Badge>
          <Button variant="outline" onClick={() => navigate(`/app/invoices/new?clientId=${client.id}`)}>New Invoice</Button>
          <Button variant="outline" onClick={() => window.open(`https://wa.me/${(client.whatsapp_number || client.phone || '').replace(/[^\d]/g, '')}`)}>Send Message</Button>
          <Button variant="outline" onClick={() => navigate('/app/clients')}>Edit</Button>
          <Button variant="danger" onClick={deleteClient}>Delete</Button>
        </div>
      </section>

      <div className="inline-flex rounded-2xl border border-emerald-400/12 bg-neutral-50 p-1 dark:bg-white/5">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? 'bg-brand-gradient text-white shadow-glow' : 'text-neutral-500 hover:bg-emerald-500/8 hover:text-primary'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[32px]">
            <h2 className="text-xl font-bold text-neutral-950">Contact info</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={client.email || 'Not added'} href={client.email ? `mailto:${client.email}` : ''} />
              <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value={client.phone || 'Not added'} href={client.phone ? `tel:${client.phone}` : ''} />
              <InfoCard icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" value={client.whatsapp_number || client.phone || 'Not added'} href={client.whatsapp_number || client.phone ? `https://wa.me/${(client.whatsapp_number || client.phone).replace(/[^\d]/g, '')}` : ''} />
              <InfoCard icon={<FileText className="h-4 w-4" />} label="Address" value={getClientAddress(client) || 'Not added'} />
            </div>

            <h2 className="mt-8 text-xl font-bold text-neutral-950">Notes</h2>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} className="mt-4 w-full rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
            <div className="mt-4">
              <Button loading={savingNotes} onClick={saveNotes}>Save notes</Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[32px]">
              <h2 className="text-xl font-bold text-neutral-950">Financial summary</h2>
              <div className="mt-5 grid gap-3">
                <SummaryRow label="Total invoiced" value={formatClientCurrency(stats.totalInvoiced, client.currency_preference || 'NGN')} />
                <SummaryRow label="Total paid" value={formatClientCurrency(stats.totalPaid, client.currency_preference || 'NGN')} />
                <SummaryRow label="Outstanding" value={formatClientCurrency(stats.outstanding, client.currency_preference || 'NGN')} />
                <SummaryRow label="Client since" value={client.created_at ? new Date(client.created_at).toLocaleDateString('en-NG') : '—'} />
              </div>
            </Card>

            <Card className="rounded-[32px]">
              <h2 className="text-xl font-bold text-neutral-950">Tags</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {getClientTags(client).length === 0 ? <p className="text-sm text-neutral-500">No tags added yet.</p> : getClientTags(client).map((tag) => <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{tag}</span>)}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === 'invoices' ? (
        <Card className="rounded-[32px]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Invoices</h2>
              <p className="mt-1 text-sm text-neutral-500">All invoices linked to this client.</p>
            </div>
            <Button onClick={() => navigate(`/app/invoices/new?clientId=${client.id}`)}>New Invoice for this client</Button>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-sm text-neutral-500">No invoices for this client yet.</td></tr>
                ) : invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-semibold text-neutral-900">{invoice.invoice_number}</td>
                    <td className="font-bold text-neutral-900">{formatClientCurrency(invoice.total, invoice.currency || 'NGN')}</td>
                    <td><Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}>{invoice.status}</Badge></td>
                    <td>{new Date(invoice.created_at).toLocaleDateString('en-NG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === 'activity' ? (
        <Card className="rounded-[32px]">
          <h2 className="text-xl font-bold text-neutral-950">Activity timeline</h2>
          <div className="mt-5 space-y-4">
            {timeline.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-start gap-4 rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
                <span className="mt-1 h-3 w-3 rounded-full bg-primary" />
                <div>
                  <p className="font-semibold text-neutral-900">{item.label}</p>
                  <p className="text-sm text-neutral-500">{new Date(item.time).toLocaleString('en-NG')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {activeTab === 'files' ? (
        <Card className="rounded-[32px]">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Files</h2>
              <p className="mt-1 text-sm text-neutral-500">Upload and manage client-specific files in Supabase Storage.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
              <Plus className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload file'}
              <input type="file" className="hidden" onChange={uploadFile} />
            </label>
          </div>
          <div className="grid gap-3">
            {files.length === 0 ? <p className="text-sm text-neutral-500">No files uploaded yet.</p> : files.map((file) => (
              <a key={file.name} href={`${supabase.storage.from('client-files').getPublicUrl(`${business.id}/${id}/${file.name}`).data.publicUrl}`} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 transition hover:border-emerald-400/40 hover:bg-emerald-500/8 dark:bg-white/5">
                <span className="text-sm font-medium text-neutral-700">{file.name}</span>
                <span className="text-xs text-neutral-400">{Math.round((file.metadata?.size || 0) / 1024)} KB</span>
              </a>
            ))}
          </div>
        </Card>
      ) : null}
    </motion.div>
  )
}

ClientDetail.propTypes = { business: PropTypes.object }

function InfoCard({ icon, label, value, href = '' }) {
  const content = (
    <div className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">{icon}{label}</div>
      <p className="mt-2 text-sm font-medium text-neutral-700">{value}</p>
    </div>
  )
  return href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{content}</a> : content
}

InfoCard.propTypes = { icon: PropTypes.node.isRequired, label: PropTypes.string.isRequired, value: PropTypes.string.isRequired, href: PropTypes.string }

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
      <span className="text-sm text-neutral-600">{label}</span>
      <strong className="text-sm font-bold text-neutral-950">{value}</strong>
    </div>
  )
}

SummaryRow.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string.isRequired }
