import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Download, Link2, Mail, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import useToast from '../../hooks/useToast'
import {
  buildPaymentLink,
  exportInvoicePdf,
  formatCurrency,
  getBalance,
  getPaidAmount,
  statusVariant,
} from './invoiceShared'

export default function InvoiceDetail({ business }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const previewRef = useRef(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoice()
  }, [id])

  async function loadInvoice() {
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(name,email)')
      .eq('id', id)
      .single()

    if (error) {
      toast.error('Unable to load invoice.')
      setLoading(false)
      return
    }
    setInvoice(data)
    setLoading(false)
  }

  async function markPaid() {
    await supabase.from('invoices').update({ status: 'paid', amount_paid: invoice.total || 0 }).eq('id', invoice.id)
    toast.success('Invoice marked as paid.')
    loadInvoice()
  }

  async function deleteInvoice() {
    const confirmed = window.confirm('Delete this invoice?')
    if (!confirmed) return
    await supabase.from('invoices').delete().eq('id', invoice.id)
    toast.success('Invoice deleted.')
    navigate('/app/invoices')
  }

  function sendReminder() {
    const clientEmail = invoice?.clients?.email || invoice?.client_snapshot?.email || ''
    const message = `Hello ${invoice?.clients?.name || invoice?.client_snapshot?.name || ''}, this is a reminder for invoice ${invoice?.invoice_number}. Outstanding balance: ${formatCurrency(getBalance(invoice), invoice?.currency || 'NGN')}.`
    window.open(`mailto:${clientEmail}?subject=${encodeURIComponent(`Reminder: ${invoice.invoice_number}`)}&body=${encodeURIComponent(message)}`)
  }

  const paymentLink = useMemo(() => buildPaymentLink(invoice, invoice?.business_snapshot || business), [business, invoice])
  const timeline = useMemo(() => ([
    { label: 'Created', done: Boolean(invoice?.created_at), note: invoice?.created_at ? new Date(invoice.created_at).toLocaleString('en-NG') : 'Pending' },
    { label: 'Sent', done: ['sent', 'pending', 'partial', 'overdue', 'paid'].includes(invoice?.status), note: ['sent', 'pending', 'partial', 'overdue', 'paid'].includes(invoice?.status) ? 'Client-ready' : 'Not yet sent' },
    { label: 'Viewed', done: ['partial', 'overdue', 'paid'].includes(invoice?.status), note: ['partial', 'overdue', 'paid'].includes(invoice?.status) ? 'Customer activity recorded' : 'Awaiting client view' },
    { label: 'Paid', done: invoice?.status === 'paid', note: invoice?.status === 'paid' ? `Paid ${formatCurrency(getPaidAmount(invoice), invoice?.currency || 'NGN')}` : 'Awaiting payment' },
  ]), [invoice])

  const activityLog = useMemo(() => {
    if (!invoice) return []
    const log = [
      { label: `Invoice created on ${new Date(invoice.created_at).toLocaleDateString('en-NG')}`, time: new Date(invoice.created_at).toLocaleString('en-NG') },
    ]
    if (['sent', 'pending', 'partial', 'overdue', 'paid'].includes(invoice.status)) {
      log.push({ label: `Invoice sent to ${invoice.clients?.email || invoice.client_snapshot?.email || 'client email'}`, time: new Date(invoice.updated_at || invoice.created_at).toLocaleString('en-NG') })
    }
    if (Array.isArray(invoice.payment_history)) {
      invoice.payment_history.forEach((payment) => {
        log.push({ label: `Payment of ${formatCurrency(payment.amount, invoice.currency || 'NGN')} recorded via ${payment.method}`, time: payment.date || payment.recorded_at })
      })
    }
    if (invoice.status === 'paid') {
      log.push({ label: `Invoice fully settled`, time: new Date(invoice.updated_at || invoice.created_at).toLocaleString('en-NG') })
    }
    return log
  }, [invoice])

  if (loading) {
    return <Skeleton variant="card" className="h-[760px] rounded-3xl" />
  }

  if (!invoice) {
    return (
      <Card className="rounded-[32px]">
        <h2 className="text-xl font-bold text-neutral-950">Invoice not found</h2>
        <p className="mt-2 text-sm text-neutral-500">This invoice may have been deleted or moved.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <Link to="/app/invoices" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to invoices
          </Link>
          <div className="page-title">{invoice.invoice_number}</div>
          <div className="page-sub">Full invoice preview, payment progress, and activity history in one place.</div>
        </div>
        <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[32px]">
          <div ref={previewRef} className="space-y-8 rounded-[28px] border border-emerald-400/15 bg-white/95 p-6 dark:bg-white/5">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">BizFlow NG</p>
                <h2 className="mt-3 text-3xl font-black text-neutral-950">INVOICE</h2>
                <p className="mt-2 text-sm text-neutral-500">{invoice.invoice_number}</p>
              </div>
              <div className="text-right">
                {invoice.business_snapshot?.logo_url ? <img src={invoice.business_snapshot.logo_url} alt={invoice.business_snapshot?.name} className="ml-auto max-h-16 object-contain" /> : null}
                <p className="mt-3 font-bold text-neutral-900">{invoice.business_snapshot?.name}</p>
                <p className="text-sm text-neutral-500">{invoice.business_snapshot?.email || invoice.business_snapshot?.phone}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">From</p>
                <p className="mt-2 font-bold text-neutral-900">{invoice.business_snapshot?.name}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{invoice.business_snapshot?.address}</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">To</p>
                <p className="mt-2 font-bold text-neutral-900">{invoice.client_snapshot?.name}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{invoice.client_snapshot?.email}</p>
                <p className="text-sm leading-6 text-neutral-500">{invoice.client_snapshot?.address}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-emerald-400/12">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Description</th>
                    <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Qty</th>
                    <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Unit Price</th>
                    <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => (
                    <tr key={index}>
                      <td className="border-t border-neutral-100 px-4 py-4 text-sm text-neutral-900">{item.description}</td>
                      <td className="border-t border-neutral-100 px-4 py-4 text-sm text-neutral-500">{item.qty}</td>
                      <td className="border-t border-neutral-100 px-4 py-4 text-sm text-neutral-500">{formatCurrency(item.unit_price ?? item.price, invoice.currency || 'NGN')}</td>
                      <td className="border-t border-neutral-100 px-4 py-4 text-sm font-bold text-neutral-900">{formatCurrency(Number(item.qty || 0) * Number((item.unit_price ?? item.price) || 0), invoice.currency || 'NGN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-3 rounded-3xl bg-neutral-50 p-5 dark:bg-white/5">
                <div className="flex items-center justify-between text-sm text-neutral-600"><span>Subtotal</span><strong>{formatCurrency(invoice.subtotal, invoice.currency || 'NGN')}</strong></div>
                <div className="flex items-center justify-between text-sm text-neutral-600"><span>Tax</span><strong>{formatCurrency(invoice.tax, invoice.currency || 'NGN')}</strong></div>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-lg font-black text-neutral-950"><span>Total</span><strong>{formatCurrency(invoice.total, invoice.currency || 'NGN')}</strong></div>
                <div className="flex items-center justify-between text-sm text-emerald-600"><span>Paid</span><strong>{formatCurrency(getPaidAmount(invoice), invoice.currency || 'NGN')}</strong></div>
                <div className="flex items-center justify-between text-sm font-bold text-amber-600"><span>Balance</span><strong>{formatCurrency(getBalance(invoice), invoice.currency || 'NGN')}</strong></div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[32px]">
            <h2 className="text-xl font-bold text-neutral-950">Status timeline</h2>
            <div className="mt-5 space-y-4">
              {timeline.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className={`mt-1 inline-flex h-4 w-4 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                  <div>
                    <p className="font-semibold text-neutral-900">{item.label}</p>
                    <p className="text-sm text-neutral-500">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[32px]">
            <h2 className="text-xl font-bold text-neutral-950">Action sidebar</h2>
            <div className="mt-5 grid gap-3">
              <Button leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={markPaid}>Mark as Paid</Button>
              <Button variant="outline" leftIcon={<Mail className="h-4 w-4" />} onClick={sendReminder}>Send Reminder</Button>
              <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => navigate(`/app/invoices/${invoice.id}/edit`)}>Edit</Button>
              <Button variant="outline" leftIcon={<Link2 className="h-4 w-4" />} onClick={() => navigator.clipboard.writeText(paymentLink)}>Copy Payment Link</Button>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => exportInvoicePdf(previewRef.current, `${invoice.invoice_number}.pdf`)}>Download PDF</Button>
              <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={deleteInvoice}>Delete</Button>
            </div>
          </Card>

          <Card className="rounded-[32px]">
            <h2 className="text-xl font-bold text-neutral-950">Activity log</h2>
            <div className="mt-5 space-y-4">
              {activityLog.map((entry, index) => (
                <div key={`${entry.label}-${index}`} className="flex items-start gap-4 rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
                  <span className="mt-1 h-3 w-3 rounded-full bg-primary" />
                  <div>
                    <p className="font-semibold text-neutral-900">{entry.label}</p>
                    <p className="text-sm text-neutral-500">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

InvoiceDetail.propTypes = {
  business: PropTypes.object,
}
