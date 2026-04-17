import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  Download,
  Eye,
  GripVertical,
  Link2,
  Mail,
  Plus,
  Save,
  Send,
  Trash2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'
import useToast from '../../hooks/useToast'
import {
  buildBusinessSnapshot,
  buildClientSnapshot,
  buildPaymentLink,
  exportInvoicePdf,
  formatCurrency,
  generateInvoiceNumber,
  getBalance,
} from './invoiceShared'

const itemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  qty: z.coerce.number().min(1, 'Qty must be at least 1'),
  unit_price: z.coerce.number().min(0, 'Unit price cannot be negative'),
  tax_percent: z.coerce.number().min(0).max(100),
})

const formSchema = z.object({
  client_search: z.string().optional(),
  client_name: z.string().min(1, 'Client name is required'),
  client_email: z.string().email('Enter a valid email').or(z.literal('')),
  client_address: z.string().optional(),
  invoice_number: z.string().min(1),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  currency: z.string().min(1),
  payment_terms: z.string().min(1),
  discount_type: z.enum(['amount', 'percent']),
  discount_value: z.coerce.number().min(0),
  notes: z.string().optional(),
  payment_terms_note: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
})

const defaultItem = { description: '', qty: 1, unit_price: 0, tax_percent: 7.5 }

function logInvoiceFormError(scope, error, businessId) {
  if (!error) return
  console.error(`[InvoiceForm:${scope}]`, {
    businessId,
    message: error.message || 'Unknown invoice form error',
    details: error.details || null,
    hint: error.hint || null,
    code: error.code || null,
  })
}

export default function InvoiceForm({ business }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const previewRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState([])
  const [existingInvoices, setExistingInvoices] = useState([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [generatedPaymentLink, setGeneratedPaymentLink] = useState('')
  const [dragIndex, setDragIndex] = useState(null)

  const {
    register,
    control,
    watch,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_search: '',
      client_name: '',
      client_email: '',
      client_address: '',
      invoice_number: '',
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      currency: 'NGN',
      payment_terms: 'Net 7',
      discount_type: 'amount',
      discount_value: 0,
      notes: '',
      payment_terms_note: '',
      items: [defaultItem],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  })

  useEffect(() => {
    if (!business?.id) return
    loadForm()
  }, [business?.id, id, searchParams])

  async function loadForm() {
    setLoading(true)
    const [clientRes, invoiceRes] = await Promise.allSettled([
      supabase.from('clients').select('*').eq('business_id', business.id).order('name'),
      supabase.from('invoices').select('*').eq('business_id', business.id).order('created_at'),
    ])

    const clientError = clientRes.status === 'fulfilled' ? clientRes.value.error : clientRes.reason
    const invoiceError = invoiceRes.status === 'fulfilled' ? invoiceRes.value.error : invoiceRes.reason

    if (clientError) logInvoiceFormError('load-clients', clientError, business.id)
    if (invoiceError) logInvoiceFormError('load-invoices', invoiceError, business.id)

    const nextClients = clientRes.status === 'fulfilled' && !clientRes.value.error ? (clientRes.value.data || []) : []
    const nextInvoices = invoiceRes.status === 'fulfilled' && !invoiceRes.value.error ? (invoiceRes.value.data || []) : []
    setClients(nextClients)
    setExistingInvoices(nextInvoices)

    if (clientError && invoiceError) {
      toast.error('We could not load invoice setup data right now.')
    }

    if (id) {
      const current = nextInvoices.find((invoice) => invoice.id === id)
      if (current) {
        reset({
          client_search: current.client_snapshot?.name || '',
          client_name: current.client_snapshot?.name || '',
          client_email: current.client_snapshot?.email || '',
          client_address: current.client_snapshot?.address || '',
          invoice_number: current.invoice_number,
          issue_date: (current.created_at || '').slice(0, 10),
          due_date: current.due_date || '',
          currency: current.currency || 'NGN',
          payment_terms: current.payment_terms || 'Net 7',
          discount_type: current.discount_type || 'amount',
          discount_value: current.discount_value || 0,
          notes: current.notes || '',
          payment_terms_note: current.payment_terms_note || '',
          items: current.items?.map((item) => ({
            description: item.description || '',
            qty: Number(item.qty || 1),
            unit_price: Number(item.unit_price ?? item.price ?? 0),
            tax_percent: Number(item.tax_percent ?? 7.5),
          })) || [defaultItem],
        })
        setSelectedClientId(current.client_id || '')
        setGeneratedPaymentLink(buildPaymentLink(current, current.business_snapshot || business))
      }
    } else {
      reset((current) => ({
        ...current,
        invoice_number: generateInvoiceNumber(nextInvoices),
      }))

      const prefillClientId = searchParams.get('clientId')
      if (prefillClientId) {
        const prefillClient = nextClients.find((client) => client.id === prefillClientId)
        if (prefillClient) {
          setSelectedClientId(prefillClient.id)
          reset((current) => ({
            ...current,
            invoice_number: generateInvoiceNumber(nextInvoices),
            client_search: prefillClient.name,
            client_name: prefillClient.name,
            client_email: prefillClient.email || '',
            client_address: prefillClient.address || '',
          }))
        }
      }
    }

    setLoading(false)
  }

  const values = watch()
  const searchedClients = useMemo(() => {
    const term = (values.client_search || '').toLowerCase()
    if (!term) return clients.slice(0, 6)
    return clients.filter((client) => `${client.name} ${client.email || ''}`.toLowerCase().includes(term)).slice(0, 6)
  }, [clients, values.client_search])

  const lineItems = values.items || []
  const subtotal = lineItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unit_price || 0), 0)
  const taxTotal = lineItems.reduce((sum, item) => sum + ((Number(item.qty || 0) * Number(item.unit_price || 0)) * Number(item.tax_percent || 0)) / 100, 0)
  const discountAmount = values.discount_type === 'percent'
    ? (subtotal * Number(values.discount_value || 0)) / 100
    : Number(values.discount_value || 0)
  const grandTotal = Math.max(subtotal + taxTotal - discountAmount, 0)

  function chooseClient(client) {
    setSelectedClientId(client.id)
    setValue('client_search', client.name)
    setValue('client_name', client.name)
    setValue('client_email', client.email || '')
    setValue('client_address', client.address || '')
  }

  async function upsertClientPayload(payload) {
    if (selectedClientId) {
      return clients.find((client) => client.id === selectedClientId) || null
    }

    const name = payload.client_name.trim()
    const existing = clients.find((client) => client.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing

    const { data, error } = await supabase
      .from('clients')
      .insert({
        business_id: business.id,
        name,
        email: payload.client_email || null,
        address: payload.client_address || null,
      })
      .select()
      .single()

    if (error) {
      logInvoiceFormError('upsert-client', error, business.id)
      throw error
    }
    return data
  }

  async function persistInvoice(payload, nextStatus) {
    setSaving(true)
    try {
      const client = await upsertClientPayload(payload)
      const invoicePayload = {
        business_id: business.id,
        client_id: client?.id || null,
        business_snapshot: buildBusinessSnapshot(business),
        client_snapshot: buildClientSnapshot({
          name: payload.client_name,
          email: payload.client_email,
          address: payload.client_address,
        }),
        invoice_number: payload.invoice_number,
        due_date: payload.due_date,
        notes: payload.notes,
        payment_terms: payload.payment_terms,
        payment_terms_note: payload.payment_terms_note,
        currency: payload.currency,
        discount_type: payload.discount_type,
        discount_value: Number(payload.discount_value || 0),
        items: payload.items.map((item) => ({
          description: item.description,
          qty: Number(item.qty),
          unit_price: Number(item.unit_price),
          price: Number(item.unit_price),
          tax_percent: Number(item.tax_percent),
          amount: Number(item.qty) * Number(item.unit_price),
        })),
        subtotal,
        tax: taxTotal,
        total: grandTotal,
        status: nextStatus,
      }

      let invoiceId = id

      if (id) {
        const { error } = await supabase.from('invoices').update(invoicePayload).eq('id', id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('invoices').insert({
          ...invoicePayload,
          public_token: crypto.randomUUID(),
          created_at: payload.issue_date ? `${payload.issue_date}T09:00:00.000Z` : undefined,
        }).select().single()
        if (error) throw error
        invoiceId = data.id
      }

      toast.success(nextStatus === 'draft' ? 'Invoice saved as draft.' : 'Invoice saved successfully.')
      navigate(`/app/invoices/${invoiceId}`)
    } catch (error) {
      logInvoiceFormError('persist', error, business.id)
      toast.error(error.message || 'Unable to save invoice.')
    } finally {
      setSaving(false)
    }
  }

  function handleSendToClient(payload) {
    persistInvoice(payload, 'sent')
  }

  async function handleGeneratePaymentLink() {
    const invoiceLike = {
      invoice_number: values.invoice_number,
      total: grandTotal,
      public_token: id ? existingInvoices.find((invoice) => invoice.id === id)?.public_token : crypto.randomUUID(),
      client_snapshot: {
        email: values.client_email,
      },
    }
    const nextLink = buildPaymentLink(invoiceLike, business)
    setGeneratedPaymentLink(nextLink)
    try {
      await navigator.clipboard.writeText(nextLink)
    } catch (error) {
      logInvoiceFormError('copy-payment-link', error, business.id)
      toast.error('Unable to copy the payment link right now.')
      return
    }
    toast.success('Payment link generated and copied.')
  }

  async function handleDownloadPdf() {
    if (!previewRef.current) return
    try {
      await exportInvoicePdf(previewRef.current, `${values.invoice_number || 'invoice'}.pdf`)
    } catch (error) {
      logInvoiceFormError('download-pdf', error, business.id)
      toast.error('Unable to generate the invoice PDF right now.')
      return
    }
    toast.success('Invoice PDF downloaded.')
  }

  function onDragStart(index) {
    setDragIndex(index)
  }

  function onDrop(index) {
    if (dragIndex === null || dragIndex === index) return
    move(dragIndex, index)
    setDragIndex(null)
  }

  const qrCells = useMemo(() => generatedPaymentLink ? Array.from({ length: 441 }).map((_, index) => {
    const source = generatedPaymentLink.charCodeAt(index % generatedPaymentLink.length) || 0
    return (source + index * 13) % 5 < 2
  }) : [], [generatedPaymentLink])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-24 rounded-3xl" />
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
          <Skeleton variant="card" className="h-[820px] rounded-3xl" />
          <Skeleton variant="card" className="h-[820px] rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <Link to="/app/invoices" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to invoices
          </Link>
          <div className="page-title">{id ? `Edit Invoice ${values.invoice_number}` : 'New Invoice'}</div>
          <div className="page-sub">Build a polished invoice, preview it live, and send it to your client without leaving BizFlow.</div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <Card className="rounded-[32px]">
          <form className="space-y-8" onSubmit={handleSubmit((payload) => persistInvoice(payload, 'draft'))}>
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-neutral-950">To</h2>
                <p className="mt-1 text-sm text-neutral-500">Search an existing client or add a new one inline.</p>
              </div>
              <Input
                label="Search existing client"
                placeholder="Start typing a client name..."
                prefixIcon={<Search className="h-4 w-4" />}
                {...register('client_search')}
              />
              {searchedClients.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {searchedClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => chooseClient(client)}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${selectedClientId === client.id ? 'border-primary bg-primary/8 shadow-glow' : 'border-emerald-400/12 bg-neutral-50 hover:border-primary/40 hover:bg-emerald-500/8 dark:bg-white/5'}`}
                    >
                      <div className="font-semibold text-neutral-900">{client.name}</div>
                      <div className="text-sm text-neutral-500">{client.email || 'No email'}</div>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Client name" error={errors.client_name?.message} {...register('client_name')} />
                <Input label="Client email" error={errors.client_email?.message} {...register('client_email')} />
              </div>
              <Input label="Client address" error={errors.client_address?.message} {...register('client_address')} />
            </section>

            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-neutral-950">Invoice details</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input label="Invoice number" error={errors.invoice_number?.message} {...register('invoice_number')} />
                <Input label="Issue date" type="date" error={errors.issue_date?.message} {...register('issue_date')} />
                <Input label="Due date" type="date" error={errors.due_date?.message} {...register('due_date')} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-700">Currency</span>
                  <select {...register('currency')} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5">
                    {['NGN', 'USD', 'GBP', 'EUR'].map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-700">Payment terms</span>
                  <select {...register('payment_terms')} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5">
                    {['Net 7', 'Net 14', 'Net 30', 'Custom'].map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neutral-950">Line items</h2>
                  <p className="mt-1 text-sm text-neutral-500">Add services or products, adjust tax, and reorder as needed.</p>
                </div>
                <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={() => append(defaultItem)}>
                  Add line item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onDrop(index)}
                    className="rounded-3xl border border-emerald-400/12 bg-neutral-50 p-4 dark:bg-white/5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500">
                        <GripVertical className="h-4 w-4" />
                        Item {index + 1}
                      </div>
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => remove(index)} disabled={fields.length === 1}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-[2fr_0.7fr_0.9fr_0.8fr_auto]">
                      <Input label="Description" error={errors.items?.[index]?.description?.message} {...register(`items.${index}.description`)} />
                      <Input label="Qty" type="number" error={errors.items?.[index]?.qty?.message} {...register(`items.${index}.qty`)} />
                      <Input label="Unit Price" type="number" error={errors.items?.[index]?.unit_price?.message} {...register(`items.${index}.unit_price`)} />
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold text-neutral-700">Tax %</span>
                        <select {...register(`items.${index}.tax_percent`)} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5">
                          <option value="0">0%</option>
                          <option value="7.5">7.5% VAT</option>
                          <option value="10">10%</option>
                          <option value="15">15%</option>
                        </select>
                      </label>
                      <div className="rounded-2xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm dark:bg-white/5">
                        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Amount</span>
                        <strong className="mt-3 block text-base font-bold text-neutral-950">{formatCurrency(Number(values.items?.[index]?.qty || 0) * Number(values.items?.[index]?.unit_price || 0), values.currency)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-700">Notes</span>
                  <textarea {...register('notes')} rows={4} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-neutral-700">Payment terms details</span>
                  <textarea {...register('payment_terms_note')} rows={4} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
                </label>
              </div>

              <div className="space-y-4 rounded-3xl border border-emerald-400/12 bg-neutral-50 p-5 dark:bg-white/5">
                <div className="flex items-center justify-between text-sm text-neutral-600"><span>Subtotal</span><strong>{formatCurrency(subtotal, values.currency)}</strong></div>
                <div className="flex items-center justify-between text-sm text-neutral-600"><span>Tax total</span><strong>{formatCurrency(taxTotal, values.currency)}</strong></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-neutral-700">Discount type</span>
                    <select {...register('discount_type')} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5">
                      <option value="amount">₦ amount</option>
                      <option value="percent">% percent</option>
                    </select>
                  </label>
                  <Input label="Discount" type="number" {...register('discount_value')} />
                </div>
                <div className="rounded-2xl bg-brand-gradient px-4 py-4 text-white shadow-glow">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-emerald-50/85">Grand Total</span>
                  <strong className="mt-2 block text-3xl font-black">{formatCurrency(grandTotal, values.currency)}</strong>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
              <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>Save as Draft</Button>
              <Button type="button" variant="outline" leftIcon={<Eye className="h-4 w-4" />} onClick={() => setShowPreview(true)}>Preview Invoice</Button>
              <Button type="button" variant="outline" leftIcon={<Send className="h-4 w-4" />} onClick={handleSubmit(handleSendToClient)}>Send to Client</Button>
              <Button type="button" variant="outline" leftIcon={<Link2 className="h-4 w-4" />} onClick={handleGeneratePaymentLink}>Generate Payment Link</Button>
              <Button type="button" variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleDownloadPdf}>Download PDF</Button>
            </div>
          </form>
        </Card>

        <Card className="rounded-[32px]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Live preview</h2>
              <p className="mt-1 text-sm text-neutral-500">Your invoice updates as you edit.</p>
            </div>
            <BadgePreview status={id ? 'editing' : 'new'} />
          </div>
          <InvoicePreviewCard
            ref={previewRef}
            business={business}
            invoice={values}
            subtotal={subtotal}
            taxTotal={taxTotal}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            paymentLink={generatedPaymentLink}
          />
          {generatedPaymentLink ? (
            <div className="mt-5 rounded-3xl border border-emerald-400/12 bg-neutral-50 p-5 dark:bg-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950">Payment link ready</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">Copy and share this payment link with your client.</p>
                </div>
                <Button variant="ghost" size="sm" leftIcon={<Copy className="h-4 w-4" />} onClick={() => navigator.clipboard.writeText(generatedPaymentLink)}>
                  Copy
                </Button>
              </div>
              <div className="mt-4 break-all rounded-2xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-600 dark:bg-white/5">{generatedPaymentLink}</div>
              <div className="mt-4 inline-grid grid-cols-[repeat(21,minmax(0,1fr))] gap-[2px] rounded-2xl bg-white/90 p-3 shadow-sm dark:bg-white/5">
                {qrCells.map((filled, index) => (
                  <span key={index} className={`h-2.5 w-2.5 rounded-[2px] ${filled ? 'bg-neutral-900' : 'bg-neutral-100'}`} />
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Invoice Preview">
        <InvoicePreviewCard
          business={business}
          invoice={values}
          subtotal={subtotal}
          taxTotal={taxTotal}
          discountAmount={discountAmount}
          grandTotal={grandTotal}
          paymentLink={generatedPaymentLink}
          watermark={values.invoice_number && !id ? 'DRAFT' : ''}
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button leftIcon={<Download className="h-4 w-4" />} onClick={handleDownloadPdf}>Download PDF</Button>
          <Button variant="outline" leftIcon={<Mail className="h-4 w-4" />} onClick={handleSubmit(handleSendToClient)}>Send via Email</Button>
          {generatedPaymentLink ? <Button variant="outline" leftIcon={<Link2 className="h-4 w-4" />} onClick={() => navigator.clipboard.writeText(generatedPaymentLink)}>Copy Payment Link</Button> : null}
        </div>
      </Modal>
    </div>
  )
}

InvoiceForm.propTypes = {
  business: PropTypes.object,
}

function BadgePreview({ status }) {
  return <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{status}</span>
}

BadgePreview.propTypes = {
  status: PropTypes.string.isRequired,
}

const InvoicePreviewCard = React.forwardRef(function InvoicePreviewCard({
  business,
  invoice,
  subtotal,
  taxTotal,
  discountAmount,
  grandTotal,
  paymentLink,
  watermark = '',
}, ref) {
  return (
    <div ref={ref} className="relative rounded-[32px] border border-emerald-400/15 bg-white/95 p-6 shadow-card dark:bg-white/5">
      {watermark ? <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-24deg] text-7xl font-black tracking-[0.22em] text-neutral-200/80">{watermark}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">BizFlow NG</p>
          <h3 className="mt-3 text-3xl font-black text-neutral-950">INVOICE</h3>
          <p className="mt-2 text-sm text-neutral-500">{invoice.invoice_number}</p>
        </div>
        <div className="text-right">
          {business?.logo_url ? <img src={business.logo_url} alt={business.name} className="ml-auto max-h-16 rounded-xl object-contain" /> : null}
          <p className="mt-3 font-bold text-neutral-900">{business?.name}</p>
          <p className="text-sm text-neutral-500">{business?.email || business?.phone}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">From</p>
          <p className="mt-2 font-bold text-neutral-900">{business?.name}</p>
          <p className="mt-2 text-sm leading-6 text-neutral-500">{business?.address || 'Business address'}</p>
        </div>
        <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">To</p>
          <p className="mt-2 font-bold text-neutral-900">{invoice.client_name}</p>
          <p className="mt-2 text-sm leading-6 text-neutral-500">{invoice.client_email || 'Client email'}</p>
          <p className="text-sm leading-6 text-neutral-500">{invoice.client_address || 'Client address'}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-emerald-400/12 px-4 py-4"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Issue date</span><strong className="mt-2 block text-sm text-neutral-900">{invoice.issue_date}</strong></div>
        <div className="rounded-2xl border border-emerald-400/12 px-4 py-4"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Due date</span><strong className="mt-2 block text-sm text-neutral-900">{invoice.due_date}</strong></div>
        <div className="rounded-2xl border border-emerald-400/12 px-4 py-4"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Currency</span><strong className="mt-2 block text-sm text-neutral-900">{invoice.currency}</strong></div>
        <div className="rounded-2xl border border-emerald-400/12 px-4 py-4"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Terms</span><strong className="mt-2 block text-sm text-neutral-900">{invoice.payment_terms}</strong></div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-emerald-400/12">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Description</th>
              <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Qty</th>
              <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Unit</th>
              <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Tax</th>
              <th className="bg-neutral-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 dark:bg-white/5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td className="border-t border-neutral-100 px-4 py-4 text-sm text-neutral-900">{item.description}</td>
                <td className="border-t border-neutral-100 px-4 py-4 text-sm text-neutral-500">{item.qty}</td>
                <td className="border-t border-neutral-100 px-4 py-4 text-sm text-neutral-500">{formatCurrency(item.unit_price, invoice.currency)}</td>
                <td className="border-t border-neutral-100 px-4 py-4 text-sm text-neutral-500">{item.tax_percent}%</td>
                <td className="border-t border-neutral-100 px-4 py-4 text-sm font-bold text-neutral-900">{formatCurrency(Number(item.qty || 0) * Number(item.unit_price || 0), invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-full max-w-sm space-y-3 rounded-3xl bg-neutral-50 p-5 dark:bg-white/5">
          <div className="flex items-center justify-between text-sm text-neutral-600"><span>Subtotal</span><strong>{formatCurrency(subtotal, invoice.currency)}</strong></div>
          <div className="flex items-center justify-between text-sm text-neutral-600"><span>Tax</span><strong>{formatCurrency(taxTotal, invoice.currency)}</strong></div>
          <div className="flex items-center justify-between text-sm text-neutral-600"><span>Discount</span><strong>- {formatCurrency(discountAmount, invoice.currency)}</strong></div>
          <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-lg font-black text-neutral-950"><span>Total</span><strong>{formatCurrency(grandTotal, invoice.currency)}</strong></div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Notes</p>
          <p className="mt-2 text-sm leading-6 text-neutral-500">{invoice.notes || 'No notes added.'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Payment terms</p>
          <p className="mt-2 text-sm leading-6 text-neutral-500">{invoice.payment_terms_note || 'Payment is due under the selected terms above.'}</p>
        </div>
      </div>

      {paymentLink ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={paymentLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-button">PAY NOW →</a>
        </div>
      ) : null}
    </div>
  )
})

InvoicePreviewCard.propTypes = {
  business: PropTypes.object,
  invoice: PropTypes.object.isRequired,
  subtotal: PropTypes.number.isRequired,
  taxTotal: PropTypes.number.isRequired,
  discountAmount: PropTypes.number.isRequired,
  grandTotal: PropTypes.number.isRequired,
  paymentLink: PropTypes.string,
  watermark: PropTypes.string,
}
