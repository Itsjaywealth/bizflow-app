import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const emptyClient = { name: '', email: '', phone: '', address: '' }
const emptyItem = { description: '', qty: 1, price: 0 }
const emptyForm = { client_id: '', due_date: '', notes: '', items: [emptyItem], new_client: emptyClient, status: 'draft' }
const statuses = ['draft', 'sent', 'pending', 'partial', 'paid', 'overdue', 'cancelled']
const emptyPayment = { amount: '', method: 'Bank transfer', date: new Date().toISOString().slice(0, 10), note: '' }
const invoiceTemplates = [
  { label: 'Consulting Session', description: 'Consulting session', qty: 1, price: 25000 },
  { label: 'Delivery Charge', description: 'Delivery charge', qty: 1, price: 5000 },
  { label: 'Monthly Retainer', description: 'Monthly service retainer', qty: 1, price: 120000 },
]

function defaultDueDate(days = 7) {
  const next = new Date()
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

export default function Invoices({ business }) {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [paymentInvoice, setPaymentInvoice] = useState(null)
  const [paymentForm, setPaymentForm] = useState(emptyPayment)
  const [savingPayment, setSavingPayment] = useState(false)
  const [catalogQuery, setCatalogQuery] = useState('')

  // Realtime invoice data is keyed by the current business.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()

    const channel = supabase
      .channel(`invoices-realtime-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${business.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `business_id=eq.${business.id}` }, loadData)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [business.id])

  async function loadData() {
    const [invRes, clientRes, productRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name,email,phone,address)').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('business_id', business.id)
    ])
    setInvoices(invRes.data || [])
    setClients(clientRes.data || [])
    setProducts(productRes.data || [])
    setLoading(false)
  }

  const subtotal = form.items.reduce((s, item) => s + (Number(item.qty) * Number(item.price)), 0)
  const tax = subtotal * 0.075
  const total = subtotal + tax
  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  const getPaidAmount = (inv) => Number(inv.amount_paid ?? (inv.status === 'paid' ? inv.total : 0) ?? 0)
  const getBalance = (inv) => Math.max(Number(inv.total || 0) - getPaidAmount(inv), 0)
  const getPaymentHistory = (inv) => Array.isArray(inv.payment_history) ? inv.payment_history : []

  const filteredInvoices = invoices.filter(inv => {
    const clientName = inv.clients?.name || inv.client_snapshot?.name || ''
    const haystack = `${inv.invoice_number} ${clientName} ${inv.status}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesQuery && matchesStatus
  })

  function nextInvoiceNumber() {
    const year = new Date().getFullYear()
    return `BF-${year}-${String(invoices.length + 1).padStart(4, '0')}`
  }

  function businessSnapshot() {
    return {
      name: business.name,
      email: business.email,
      phone: business.phone,
      address: business.address,
      logo_url: business.logo_url,
      bank_name: business.bank_name,
      account_name: business.account_name,
      account_number: business.account_number,
      payment_link: business.payment_link
    }
  }

  function clientSnapshot(client) {
    return { name: client?.name || '', email: client?.email || '', phone: client?.phone || '', address: client?.address || '' }
  }

  function previewClient() {
    if (form.client_id) return clients.find(c => c.id === form.client_id) || {}
    return form.new_client
  }

  function resetForm() {
    setEditing(null)
    setShowPreview(false)
    setCatalogQuery('')
    setForm({ ...emptyForm, due_date: defaultDueDate() })
  }

  function openAdd() {
    resetForm()
    setShowModal(true)
  }

  function openEdit(inv) {
    const canEdit = ['draft', 'sent', 'pending', 'partial', 'overdue'].includes(inv.status)
    if (!canEdit) {
      alert('Paid invoices should not be edited. Create a new invoice or receipt instead.')
      return
    }
    setEditing(inv)
    setShowPreview(false)
    setForm({
      client_id: inv.client_id || '',
      due_date: inv.due_date || '',
      notes: inv.notes || '',
      items: inv.items?.length ? inv.items : [emptyItem],
      new_client: inv.client_id ? emptyClient : (inv.client_snapshot || emptyClient),
      status: inv.status || 'draft'
    })
    setShowModal(true)
  }

  function chooseSavedClient(clientId) {
    setForm(f => ({ ...f, client_id: clientId, new_client: emptyClient }))
  }

  function chooseManualClient() {
    setForm(f => ({ ...f, client_id: '', new_client: f.new_client.name ? f.new_client : emptyClient }))
  }

  function updateItem(i, field, value) {
    const items = [...form.items]
    items[i] = { ...items[i], [field]: value }
    setForm(f => ({ ...f, items }))
  }

  function updateNewClient(field, value) {
    setForm(f => ({ ...f, new_client: { ...f.new_client, [field]: value } }))
  }

  function addEmptyItem() {
    setForm(f => ({ ...f, items: [...f.items, { ...emptyItem }] }))
  }

  function removeItem(index) {
    setForm(f => {
      if (f.items.length === 1) return f
      return { ...f, items: f.items.filter((_, idx) => idx !== index) }
    })
  }

  function duplicateItem(index) {
    setForm(f => {
      const item = f.items[index]
      if (!item) return f
      const items = [...f.items]
      items.splice(index + 1, 0, { ...item })
      return { ...f, items }
    })
  }

  function addProduct(productId) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    setForm(f => ({ ...f, items: [...f.items, { description: product.name, qty: 1, price: product.price || 0 }] }))
  }

  function fillItemFromProduct(index, productId) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const items = [...form.items]
    items[index] = {
      ...items[index],
      description: product.name,
      price: product.price || 0
    }
    setForm(f => ({ ...f, items }))
  }

  async function resolveClient() {
    if (form.client_id) return clients.find(c => c.id === form.client_id)
    if (!form.new_client.name.trim()) return null
    if (editing && !editing.client_id) return { id: null, ...form.new_client }
    const payload = { ...form.new_client, name: form.new_client.name.trim(), business_id: business.id }
    const { data, error } = await supabase.from('clients').insert(payload).select().single()
    if (error) throw error
    return data
  }

  async function saveInvoice(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const cleanItems = form.items
        .map(item => ({
          description: (item.description || '').trim(),
          qty: Number(item.qty || 0),
          price: Number(item.price || 0)
        }))
        .filter(item => item.description && item.qty > 0)

      if (!cleanItems.length) {
        throw new Error('Add at least one invoice item with a description and quantity.')
      }

      const client = await resolveClient()
      const payload = {
        business_id: business.id,
        client_id: client?.id || null,
        business_snapshot: businessSnapshot(),
        client_snapshot: clientSnapshot(client),
        items: cleanItems,
        subtotal: cleanItems.reduce((sum, item) => sum + item.qty * item.price, 0),
        tax: cleanItems.reduce((sum, item) => sum + item.qty * item.price, 0) * 0.075,
        total: cleanItems.reduce((sum, item) => sum + item.qty * item.price, 0) * 1.075,
        due_date: form.due_date || null,
        notes: form.notes,
        status: form.status
      }
      const { error } = editing
        ? await supabase.from('invoices').update(payload).eq('id', editing.id)
        : await supabase.from('invoices').insert({ ...payload, invoice_number: nextInvoiceNumber(), public_token: crypto.randomUUID() })
      if (error) throw error
      await loadData()
      setShowModal(false)
      resetForm()
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  async function updateStatus(id, status) {
    const invoice = invoices.find(inv => inv.id === id)
    const payload = { status }
    if (invoice && status === 'paid') payload.amount_paid = invoice.total || 0
    if (invoice && ['draft', 'sent', 'pending', 'overdue', 'cancelled'].includes(status) && getPaidAmount(invoice) === 0) payload.amount_paid = 0
    await supabase.from('invoices').update(payload).eq('id', id)
    loadData()
  }

  function openPayment(inv) {
    const balance = getBalance(inv)
    setPaymentInvoice(inv)
    setPaymentForm({ ...emptyPayment, amount: balance || inv.total || '' })
  }

  async function recordPayment(e) {
    e.preventDefault()
    if (!paymentInvoice) return
    const amount = Number(paymentForm.amount)
    if (!amount || amount <= 0) {
      alert('Enter a valid payment amount.')
      return
    }
    const balance = getBalance(paymentInvoice)
    if (amount > balance) {
      alert(`Payment cannot be more than the balance due: ${fmt(balance)}.`)
      return
    }

    setSavingPayment(true)
    try {
      const existingHistory = getPaymentHistory(paymentInvoice)
      const nextPaid = getPaidAmount(paymentInvoice) + amount
      const nextStatus = nextPaid >= Number(paymentInvoice.total || 0) ? 'paid' : 'partial'
      const paymentRecord = {
        id: crypto.randomUUID(),
        amount,
        method: paymentForm.method,
        date: paymentForm.date || new Date().toISOString().slice(0, 10),
        note: paymentForm.note,
        recorded_at: new Date().toISOString()
      }
      const { error } = await supabase
        .from('invoices')
        .update({
          amount_paid: nextPaid,
          payment_history: [...existingHistory, paymentRecord],
          status: nextStatus
        })
        .eq('id', paymentInvoice.id)
      if (error) throw error
      await loadData()
      setPaymentInvoice(null)
      setPaymentForm(emptyPayment)
    } catch (error) {
      alert(error.message)
    } finally {
      setSavingPayment(false)
    }
  }

  async function deleteInvoice(id) {
    if (window.confirm('Delete this invoice?')) {
      await supabase.from('invoices').delete().eq('id', id)
      loadData()
    }
  }

  function publicUrl(inv) {
    return `${window.location.origin}/invoice/${inv.public_token}`
  }

  async function copyLink(inv) {
    await navigator.clipboard.writeText(publicUrl(inv))
    alert('Invoice link copied.')
  }

  async function makePDF(inv, type = 'invoice') {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    const snapshot = inv.business_snapshot || businessSnapshot()
    const client = inv.client_snapshot || inv.clients || {}
    doc.setFontSize(22); doc.setFont('helvetica', 'bold')
    doc.text(type === 'receipt' ? 'PAYMENT RECEIPT' : 'INVOICE', 14, 22)
    doc.setFontSize(11); doc.setFont('helvetica', 'normal')
    doc.text(snapshot.name || business.name, 14, 32)
    doc.text(snapshot.phone || '', 14, 38)
    doc.text(snapshot.email || '', 14, 44)
    doc.text(`Invoice #: ${inv.invoice_number}`, 140, 32)
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, 140, 38)
    doc.text(`Status: ${type === 'receipt' ? 'PAID' : inv.status.toUpperCase()}`, 140, 44)
    if (client.name) { doc.setFont('helvetica', 'bold'); doc.text('Bill To:', 14, 58); doc.setFont('helvetica', 'normal'); doc.text(client.name, 14, 64) }
    const items = (inv.items || []).map(item => [item.description, item.qty, fmt(item.price), fmt(item.qty * item.price)])
    autoTable(doc, { startY: 72, head: [['Description', 'Qty', 'Unit Price', 'Amount']], body: items, theme: 'striped', headStyles: { fillColor: [13, 124, 79] } })
    const y = doc.lastAutoTable.finalY + 10
    doc.text(`Subtotal: ${fmt(inv.subtotal)}`, 140, y)
    doc.text(`VAT (7.5%): ${fmt(inv.tax)}`, 140, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ${fmt(inv.total)}`, 140, y + 14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Amount paid: ${fmt(getPaidAmount(inv))}`, 140, y + 22)
    doc.text(`Balance due: ${fmt(getBalance(inv))}`, 140, y + 28)
    if (type === 'receipt') doc.text('Payment received. Thank you.', 14, y + 36)
    else if (inv.public_token) doc.text(`View online: ${publicUrl(inv)}`, 14, y + 36)
    doc.save(type === 'receipt' ? `receipt-${inv.invoice_number}.pdf` : `${inv.invoice_number}.pdf`)
  }

  function shareWhatsApp(inv) {
    const client = inv.client_snapshot || inv.clients || {}
    const msg = `Hi${client.name ? ' ' + client.name : ''},\n\nPlease view your invoice below:\n\nInvoice: ${inv.invoice_number}\nAmount: ${fmt(inv.total)}\nPaid: ${fmt(getPaidAmount(inv))}\nBalance: ${fmt(getBalance(inv))}\nDue: ${inv.due_date || 'Upon receipt'}\nLink: ${publicUrl(inv)}\n\nThank you.\n\n- ${business.name}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function paymentReminder(inv) {
    const client = inv.client_snapshot || inv.clients || {}
    const msg = `Hello${client.name ? ' ' + client.name : ''}, this is a friendly reminder for invoice ${inv.invoice_number} from ${business.name}. Balance due: ${fmt(getBalance(inv))}. Please view it here: ${publicUrl(inv)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function previewInvoice() {
    const client = previewClient()
    return (
      <div className="invoice-preview-card">
        <div className="public-invoice-topbar">
          <div>
            <div className="landing-logo-text">BizFlow <span>NG</span></div>
            <p>{business.name}</p>
          </div>
          <strong>{editing?.invoice_number || nextInvoiceNumber()}</strong>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Bill To</div>
          <strong>{client.name || 'Customer name'}</strong>
          <p style={{ color: '#64748b' }}>{client.email || client.phone || 'Customer contact details'}</p>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
          <tbody>{form.items.map((item, index) => <tr key={index}><td>{item.description || 'Item description'}</td><td>{item.qty}</td><td>{fmt(item.price)}</td><td>{fmt(item.qty * item.price)}</td></tr>)}</tbody>
        </table>
        <div className="invoice-total-box"><div>Subtotal: {fmt(subtotal)}</div><div>VAT (7.5%): {fmt(tax)}</div><strong>Total: {fmt(total)}</strong></div>
      </div>
    )
  }

  const filteredProducts = products.filter(product =>
    `${product.name} ${product.description || ''}`.toLowerCase().includes(catalogQuery.toLowerCase())
  ).slice(0, 6)
  const activeClient = form.client_id ? clients.find(client => client.id === form.client_id) : null
  const isManualClient = !form.client_id
  const invoiceReadiness = [
    { label: 'Client selected or typed', done: Boolean(activeClient || form.new_client.name.trim()) },
    { label: 'At least one item added', done: form.items.some(item => (item.description || '').trim() && Number(item.qty) > 0) },
    { label: 'Due date selected', done: Boolean(form.due_date) },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">Create, preview, share, edit and track invoices</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ New Invoice</button>
      </div>

      <div className="launch-helper-card">
        <div>
          <strong>Create invoices without extra setup</strong>
          <p>BizFlow lets you type a new customer directly on the invoice, then save them automatically for later use.</p>
        </div>
        <div className="launch-helper-actions">
          <Link className="btn-outline" to="/products">Manage products</Link>
          <Link className="btn-outline" to="/settings">Update payment details</Link>
        </div>
      </div>

      <div className="section-grid">
        <div className="stat-card"><div className="stat-label">Total Invoiced</div><div className="stat-value" style={{ color: '#0d7c4f' }}>{fmt(invoices.reduce((s, i) => s + (i.total || 0), 0))}</div></div>
        <div className="stat-card"><div className="stat-label">Amount Paid</div><div className="stat-value" style={{ color: '#15803d' }}>{fmt(invoices.reduce((s, i) => s + getPaidAmount(i), 0))}</div></div>
        <div className="stat-card"><div className="stat-label">Balance Due</div><div className="stat-value" style={{ color: '#a16207' }}>{fmt(invoices.filter(i => i.status !== 'cancelled').reduce((s, i) => s + getBalance(i), 0))}</div></div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <input placeholder="Search invoice or client..." value={query} onChange={e => setQuery(e.target.value)} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        {loading ? <p style={{ color: '#94a3b8' }}>Loading invoices...</p> :
          filteredInvoices.length === 0 ?
            <div className="empty-state"><div className="empty-icon">🧾</div><h3>No invoices found</h3><p>Create your first invoice. You can add the client while creating it.</p><button className="btn-primary" onClick={openAdd}>Create Invoice</button></div> :
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Invoice #</th><th>Client</th><th>Total</th><th>Paid</th><th>Balance</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{filteredInvoices.map(inv => <tr key={inv.id}><td style={{ fontWeight: 700 }}>{inv.invoice_number}</td><td>{inv.clients?.name || inv.client_snapshot?.name || '—'}</td><td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td><td style={{ color: '#15803d', fontWeight: 800 }}>{fmt(getPaidAmount(inv))}</td><td style={{ color: getBalance(inv) > 0 ? '#a16207' : '#15803d', fontWeight: 800 }}>{fmt(getBalance(inv))}</td><td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td><td><select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></td><td><div className="action-row"><a className="mini-action green" href={publicUrl(inv)} target="_blank" rel="noreferrer">View</a>{getBalance(inv) > 0 && inv.status !== 'cancelled' && <button className="mini-action green" onClick={() => openPayment(inv)}>Record Payment</button>}<button className="mini-action" onClick={() => openEdit(inv)}>Edit</button><button className="mini-action" onClick={() => copyLink(inv)}>Copy</button><button className="mini-action" onClick={() => makePDF(inv)}>PDF</button><button className="mini-action green" onClick={() => shareWhatsApp(inv)}>Share</button>{getBalance(inv) > 0 && <button className="mini-action" onClick={() => paymentReminder(inv)}>Reminder</button>}{getPaidAmount(inv) > 0 && <button className="mini-action green" onClick={() => makePDF(inv, 'receipt')}>Receipt</button>}<button className="mini-action red" onClick={() => deleteInvoice(inv.id)}>Delete</button></div></td></tr>)}</tbody>
              </table>
            </div>
        }
      </div>

      {paymentInvoice && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPaymentInvoice(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Record Payment</div>
                <p className="modal-subtitle">Add a manual payment received for {paymentInvoice.invoice_number}.</p>
              </div>
              <button className="modal-close" onClick={() => setPaymentInvoice(null)}>x</button>
            </div>
            <div className="payment-summary-grid">
              <div><span>Total</span><strong>{fmt(paymentInvoice.total)}</strong></div>
              <div><span>Paid</span><strong>{fmt(getPaidAmount(paymentInvoice))}</strong></div>
              <div><span>Balance</span><strong>{fmt(getBalance(paymentInvoice))}</strong></div>
            </div>
            <form onSubmit={recordPayment}>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount Received</label>
                  <input type="number" min="1" max={getBalance(paymentInvoice)} value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Payment Date</label>
                  <input type="date" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={paymentForm.method} onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value }))}>
                  <option>Bank transfer</option>
                  <option>Cash</option>
                  <option>POS</option>
                  <option>Mobile money</option>
                  <option>Payment link</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note or Reference</label>
                <textarea rows={2} placeholder="Transfer reference, bank name, or internal note" value={paymentForm.note} onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))} />
              </div>
              {getPaymentHistory(paymentInvoice).length > 0 && (
                <div className="payment-history-box">
                  <strong>Previous payments</strong>
                  {getPaymentHistory(paymentInvoice).map(payment => (
                    <div key={payment.id || payment.recorded_at} className="payment-history-row">
                      <span>{payment.date} · {payment.method}</span>
                      <b>{fmt(payment.amount)}</b>
                    </div>
                  ))}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={savingPayment}>{savingPayment ? 'Saving payment...' : 'Save Payment'}</button>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal invoice-modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">{editing ? 'Edit Invoice' : 'Create New Invoice'}</div>
                <p className="modal-subtitle">Preview before saving, then share as PDF, invoice link, or WhatsApp message.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={saveInvoice}>
              <div className="invoice-form-section">
                <h3>Who is this invoice for?</h3>
                <p>If this is a new customer, enter their details below. BizFlow will save them automatically for next time.</p>
                {clients.length > 0 && (
                  <>
                    <div className="customer-mode-row">
                      <button type="button" className={`customer-mode-button ${!isManualClient ? 'active' : ''}`} onClick={() => chooseSavedClient(form.client_id || clients[0].id)}>Use saved client</button>
                      <button type="button" className={`customer-mode-button ${isManualClient ? 'active' : ''}`} onClick={chooseManualClient}>Add new client here</button>
                    </div>
                    {!isManualClient && (
                      <div className="form-group">
                        <label>Choose a saved client</label>
                        <select value={form.client_id} onChange={e => chooseSavedClient(e.target.value)}>
                          <option value="">Select client</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {activeClient && <small className="field-help">Using {activeClient.name}{activeClient.phone ? ` · ${activeClient.phone}` : ''}{activeClient.email ? ` · ${activeClient.email}` : ''}.</small>}
                      </div>
                    )}
                  </>
                )}
                {clients.length === 0 && <div className="notice success">You do not need to add clients first. Type the customer details here and BizFlow will create the client record with this invoice.</div>}
                {isManualClient && <><div className="form-group"><label>Client Name *</label><input placeholder="Customer or company name" value={form.new_client.name} onChange={e => updateNewClient('name', e.target.value)} required /></div><div className="form-row"><div className="form-group"><label>Email</label><input type="email" placeholder="client@email.com" value={form.new_client.email} onChange={e => updateNewClient('email', e.target.value)} /></div><div className="form-group"><label>Phone</label><input placeholder="+234 800 000 0000" value={form.new_client.phone} onChange={e => updateNewClient('phone', e.target.value)} /></div></div><div className="form-group"><label>Address</label><input placeholder="Client address" value={form.new_client.address} onChange={e => updateNewClient('address', e.target.value)} /></div></>}
              </div>

              <div className="invoice-form-section">
                <div className="invoice-progress-strip">
                  {invoiceReadiness.map(item => (
                    <div key={item.label} className={`invoice-progress-item ${item.done ? 'done' : ''}`}>
                      <span>{item.done ? '✓' : '•'}</span>
                      <strong>{item.label}</strong>
                    </div>
                  ))}
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></div>
                  <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                </div>
                {products.length > 0 && (
                  <div className="catalog-picker">
                    <div className="catalog-picker-head">
                      <div>
                        <strong>Saved products and services</strong>
                        <p>Pick from your catalog to fill invoice items faster.</p>
                      </div>
                      <input placeholder="Search saved items..." value={catalogQuery} onChange={e => setCatalogQuery(e.target.value)} />
                    </div>
                    <div className="catalog-card-grid">
                      {filteredProducts.map(product => (
                        <button key={product.id} type="button" className="catalog-card" onClick={() => addProduct(product.id)}>
                          <span>{product.description || 'Saved product or service'}</span>
                          <strong>{product.name}</strong>
                          <b>{fmt(product.price)}</b>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {products.length === 0 && (
                  <div className="notice success" style={{ marginBottom: 14 }}>
                    You can create this invoice now. Later, add repeat products or services in Products to speed up future invoices.
                  </div>
                )}
                <div className="quick-chip-row">
                  {invoiceTemplates.map(template => (
                    <button
                      key={template.label}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, items: [...f.items, { description: template.description, qty: template.qty, price: template.price }] }))}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
                <div className="action-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}><label style={{ fontWeight: 700, fontSize: 13 }}>Invoice Items</label><button type="button" onClick={addEmptyItem} className="mini-action green">+ Add Item</button></div>
                {form.items.map((item, i) => (
                  <div key={i} className="invoice-item-card">
                    <div className="invoice-item-card-head">
                      <strong>Item {i + 1}</strong>
                      <div className="action-row">
                        <button type="button" className="mini-action" onClick={() => duplicateItem(i)}>Duplicate</button>
                        <button type="button" className="mini-action red" onClick={() => removeItem(i)} disabled={form.items.length === 1}>Remove</button>
                      </div>
                    </div>
                    {products.length > 0 && (
                      <div className="form-group">
                        <label>Fill from saved product or service</label>
                        <select value="" onChange={e => { fillItemFromProduct(i, e.target.value); e.target.value = '' }}>
                          <option value="">Choose saved item...</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name} - {fmt(p.price)}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="invoice-item-row invoice-item-row-advanced">
                      <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} required />
                      <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} />
                      <input type="number" placeholder="Price (N)" min="0" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} />
                      <div className="invoice-line-total">{fmt(Number(item.qty || 0) * Number(item.price || 0))}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="invoice-total-box"><div>Subtotal: {fmt(subtotal)}</div><div>VAT (7.5%): {fmt(tax)}</div><strong>Total: {fmt(total)}</strong></div>
              <div className="form-group"><label>Notes (optional)</label><textarea rows={2} placeholder="Payment terms, delivery notes, etc." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <button type="button" className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }} onClick={() => setShowPreview(p => !p)}>{showPreview ? 'Hide Preview' : 'Preview Invoice'}</button>
              {showPreview && previewInvoice()}
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Invoice'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
