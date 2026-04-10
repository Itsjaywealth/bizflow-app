import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const emptyClient = { name: '', email: '', phone: '', address: '' }
const emptyItem = { description: '', qty: 1, price: 0 }

export default function Invoices({ business }) {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_id: '',
    due_date: '',
    notes: '',
    items: [emptyItem],
    new_client: emptyClient
  })

  useEffect(() => { loadData() }, [])

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

  function updateItem(i, field, value) {
    const items = [...form.items]
    items[i] = { ...items[i], [field]: value }
    setForm(f => ({ ...f, items }))
  }

  function updateNewClient(field, value) {
    setForm(f => ({ ...f, new_client: { ...f.new_client, [field]: value } }))
  }

  function addProduct(productId) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    setForm(f => ({ ...f, items: [...f.items, { description: product.name, qty: 1, price: product.price || 0 }] }))
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, emptyItem] }))
  }

  function removeItem(i) {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  }

  const subtotal = form.items.reduce((s, item) => s + (Number(item.qty) * Number(item.price)), 0)
  const tax = subtotal * 0.075
  const total = subtotal + tax
  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()

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
    return {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || ''
    }
  }

  async function resolveClient() {
    if (form.client_id) return clients.find(c => c.id === form.client_id)
    if (!form.new_client.name.trim()) return null

    const payload = {
      ...form.new_client,
      name: form.new_client.name.trim(),
      business_id: business.id
    }
    const { data, error } = await supabase.from('clients').insert(payload).select().single()
    if (error) throw error
    return data
  }

  async function saveInvoice(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const client = await resolveClient()
      const { error } = await supabase.from('invoices').insert({
        business_id: business.id,
        client_id: client?.id || null,
        invoice_number: nextInvoiceNumber(),
        public_token: crypto.randomUUID(),
        business_snapshot: businessSnapshot(),
        client_snapshot: clientSnapshot(client),
        items: form.items,
        subtotal,
        tax,
        total,
        due_date: form.due_date || null,
        notes: form.notes,
        status: 'pending'
      })
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

  function resetForm() {
    setForm({ client_id: '', due_date: '', notes: '', items: [emptyItem], new_client: emptyClient })
  }

  async function updateStatus(id, status) {
    await supabase.from('invoices').update({ status }).eq('id', id)
    loadData()
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

  async function downloadPDF(inv) {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    const snapshot = inv.business_snapshot || businessSnapshot()
    doc.setFontSize(22); doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 14, 22)
    doc.setFontSize(11); doc.setFont('helvetica', 'normal')
    doc.text(snapshot.name || business.name, 14, 32)
    doc.text(snapshot.phone || '', 14, 38)
    doc.text(snapshot.email || '', 14, 44)
    doc.text(`Invoice #: ${inv.invoice_number}`, 140, 32)
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, 140, 38)
    doc.text(`Status: ${inv.status.toUpperCase()}`, 140, 44)
    const client = inv.client_snapshot || inv.clients || {}
    if (client.name) { doc.setFont('helvetica', 'bold'); doc.text('Bill To:', 14, 58); doc.setFont('helvetica', 'normal'); doc.text(client.name, 14, 64) }
    const items = (inv.items || []).map(item => [item.description, item.qty, fmt(item.price), fmt(item.qty * item.price)])
    autoTable(doc, { startY: 72, head: [['Description', 'Qty', 'Unit Price', 'Amount']], body: items, theme: 'striped', headStyles: { fillColor: [13, 124, 79] } })
    const y = doc.lastAutoTable.finalY + 10
    doc.setFont('helvetica', 'normal')
    doc.text(`Subtotal: ${fmt(inv.subtotal)}`, 140, y)
    doc.text(`VAT (7.5%): ${fmt(inv.tax)}`, 140, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ${fmt(inv.total)}`, 140, y + 14)
    if (snapshot.bank_name) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
      doc.text(`Payment: ${snapshot.bank_name} • ${snapshot.account_number || ''} • ${snapshot.account_name || ''}`, 14, y + 28)
    }
    if (inv.public_token) doc.text(`View online: ${publicUrl(inv)}`, 14, y + 36)
    if (inv.notes) doc.text(`Notes: ${inv.notes}`, 14, y + 46)
    doc.save(`${inv.invoice_number}.pdf`)
  }

  function shareWhatsApp(inv) {
    const client = inv.client_snapshot || inv.clients || {}
    const msg = `Hi${client.name ? ' ' + client.name : ''},\n\nPlease view your invoice below:\n\nInvoice: ${inv.invoice_number}\nAmount: ${fmt(inv.total)}\nDue: ${inv.due_date || 'Upon receipt'}\nLink: ${publicUrl(inv)}\n\nThank you.\n\n— ${business.name}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">Create, share, download and track invoices</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Invoice</button>
      </div>

      <div className="section-grid">
        <div className="stat-card"><div className="stat-label">Total Invoiced</div><div className="stat-value" style={{ color: '#0d7c4f' }}>{fmt(invoices.reduce((s, i) => s + (i.total || 0), 0))}</div></div>
        <div className="stat-card"><div className="stat-label">Paid</div><div className="stat-value" style={{ color: '#15803d' }}>{fmt(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0))}</div></div>
        <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value" style={{ color: '#a16207' }}>{fmt(invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || 0), 0))}</div></div>
      </div>

      <div className="card">
        {loading ? <p style={{ color: '#94a3b8' }}>Loading invoices...</p> :
          invoices.length === 0 ?
            <div className="empty-state"><div className="empty-icon">🧾</div><h3>No invoices yet</h3><p>Create your first invoice. You can add the client while creating it.</p><button className="btn-primary" onClick={() => setShowModal(true)}>Create Invoice</button></div> :
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{invoices.map(inv => <tr key={inv.id}><td style={{ fontWeight: 700 }}>{inv.invoice_number}</td><td>{inv.clients?.name || inv.client_snapshot?.name || '—'}</td><td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td><td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td><td><select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)} style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: 12, cursor: 'pointer', color: inv.status === 'paid' ? '#15803d' : inv.status === 'overdue' ? '#b91c1c' : '#a16207' }}><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select></td><td><div className="action-row"><a className="mini-action green" href={publicUrl(inv)} target="_blank" rel="noreferrer">View</a><button className="mini-action" onClick={() => copyLink(inv)}>Copy Link</button><button className="mini-action" onClick={() => downloadPDF(inv)}>PDF</button><button className="mini-action green" onClick={() => shareWhatsApp(inv)}>Reminder</button><button className="mini-action red" onClick={() => deleteInvoice(inv.id)}>Delete</button></div></td></tr>)}</tbody>
              </table>
            </div>
        }
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal invoice-modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">Create New Invoice</div>
                <p className="modal-subtitle">Add a client, line items, due date, then share as PDF or WhatsApp reminder.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={saveInvoice}>
              <div className="invoice-form-section">
                <div>
                  <h3>Client details</h3>
                  <p>Choose an existing client or type a new client below.</p>
                </div>
                {clients.length > 0 && (
                  <div className="form-group">
                    <label>Existing Client</label>
                    <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value, new_client: e.target.value ? emptyClient : f.new_client }))}>
                      <option value="">Create or enter a new client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {!form.client_id && (
                  <>
                    <div className="form-group"><label>Client Name *</label><input placeholder="Customer or company name" value={form.new_client.name} onChange={e => updateNewClient('name', e.target.value)} required /></div>
                    <div className="form-row"><div className="form-group"><label>Email</label><input type="email" placeholder="client@email.com" value={form.new_client.email} onChange={e => updateNewClient('email', e.target.value)} /></div><div className="form-group"><label>Phone</label><input placeholder="+234 800 000 0000" value={form.new_client.phone} onChange={e => updateNewClient('phone', e.target.value)} /></div></div>
                    <div className="form-group"><label>Address</label><input placeholder="Client address" value={form.new_client.address} onChange={e => updateNewClient('address', e.target.value)} /></div>
                  </>
                )}
              </div>

              <div className="invoice-form-section">
                <div className="form-row">
                  <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                  {products.length > 0 && <div className="form-group"><label>Add saved product/service</label><select onChange={e => { addProduct(e.target.value); e.target.value = '' }}><option value="">Choose product...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} - {fmt(p.price)}</option>)}</select></div>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: 700, fontSize: 13 }}>Invoice Items</label>
                  <button type="button" onClick={addItem} className="mini-action green">+ Add Item</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="invoice-item-row">
                    <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} required />
                    <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                    <input type="number" placeholder="Price (N)" min="0" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                    <button type="button" onClick={() => removeItem(i)} style={{ background: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>x</button>
                  </div>
                ))}
              </div>

              <div className="invoice-total-box"><div>Subtotal: {fmt(subtotal)}</div><div>VAT (7.5%): {fmt(tax)}</div><strong>Total: {fmt(total)}</strong></div>
              <div className="form-group"><label>Notes (optional)</label><textarea rows={2} placeholder="Payment terms, delivery notes, etc." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={saving}>{saving ? 'Saving...' : 'Create Invoice'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
