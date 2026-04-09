import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Invoices({ business }) {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client_id: '', due_date: '', notes: '', items: [{ description: '', qty: 1, price: 0 }] })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [invRes, clientRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name)').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').eq('business_id', business.id)
    ])
    setInvoices(invRes.data || [])
    setClients(clientRes.data || [])
    setLoading(false)
  }

  function updateItem(i, field, value) {
    const items = [...form.items]
    items[i] = { ...items[i], [field]: value }
    setForm(f => ({ ...f, items }))
  }

  function addItem() { setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, price: 0 }] })) }
  function removeItem(i) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })) }

  const subtotal = form.items.reduce((s, item) => s + (Number(item.qty) * Number(item.price)), 0)
  const tax = subtotal * 0.075
  const total = subtotal + tax

  const fmt = (n) => '₦' + Number(n).toLocaleString()

  async function saveInvoice(e) {
    e.preventDefault()
    setSaving(true)
    const invNum = 'INV-' + Date.now().toString().slice(-6)
    const { error } = await supabase.from('invoices').insert({
      business_id: business.id,
      client_id: form.client_id || null,
      invoice_number: invNum,
      items: form.items,
      subtotal, tax, total,
      due_date: form.due_date || null,
      notes: form.notes,
      status: 'pending'
    })
    if (!error) { await loadData(); setShowModal(false); resetForm() }
    setSaving(false)
  }

  function resetForm() { setForm({ client_id: '', due_date: '', notes: '', items: [{ description: '', qty: 1, price: 0 }] }) }

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

  async function downloadPDF(inv) {
    const { jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    doc.setFontSize(22); doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', 14, 22)
    doc.setFontSize(11); doc.setFont('helvetica', 'normal')
    doc.text(business.name, 14, 32)
    doc.text(business.phone || '', 14, 38)
    doc.text(business.email || '', 14, 44)
    doc.setFontSize(11)
    doc.text(`Invoice #: ${inv.invoice_number}`, 140, 32)
    doc.text(`Date: ${new Date(inv.created_at).toLocaleDateString()}`, 140, 38)
    doc.text(`Status: ${inv.status.toUpperCase()}`, 140, 44)
    if (inv.clients?.name) { doc.setFont('helvetica', 'bold'); doc.text('Bill To:', 14, 58); doc.setFont('helvetica', 'normal'); doc.text(inv.clients.name, 14, 64) }
    const items = (inv.items || []).map(item => [item.description, item.qty, `₦${Number(item.price).toLocaleString()}`, `₦${(item.qty * item.price).toLocaleString()}`])
    autoTable(doc, { startY: 72, head: [['Description', 'Qty', 'Unit Price', 'Amount']], body: items, theme: 'striped', headStyles: { fillColor: [13, 124, 79] } })
    const y = doc.lastAutoTable.finalY + 10
    doc.setFont('helvetica', 'normal')
    doc.text(`Subtotal: ₦${Number(inv.subtotal).toLocaleString()}`, 140, y)
    doc.text(`Tax (7.5%): ₦${Number(inv.tax).toLocaleString()}`, 140, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ₦${Number(inv.total).toLocaleString()}`, 140, y + 14)
    if (inv.notes) { doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(`Notes: ${inv.notes}`, 14, y + 24) }
    doc.save(`${inv.invoice_number}.pdf`)
  }

  function shareWhatsApp(inv) {
    const client = clients.find(c => c.id === inv.client_id)
    const msg = `Hi${client ? ' ' + client.name : ''},\n\nPlease find your invoice details below:\n\nInvoice: ${inv.invoice_number}\nAmount: ${fmt(inv.total)}\nDue: ${inv.due_date || 'Upon receipt'}\n\nThank you for your business!\n\n— ${business.name}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Invoices</div>
          <div className="page-sub">Create, send and track your invoices</div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Invoice</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Invoiced', value: fmt(invoices.reduce((s, i) => s + (i.total || 0), 0)), color: '#0d7c4f' },
          { label: 'Paid', value: fmt(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)), color: '#15803d' },
          { label: 'Pending', value: fmt(invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || 0), 0)), color: '#a16207' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 20, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? <p style={{ color: '#94a3b8' }}>Loading invoices...</p> :
          invoices.length === 0 ?
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <h3>No invoices yet</h3>
              <p>Create your first invoice and start getting paid faster</p>
              <button className="btn-primary" onClick={() => setShowModal(true)}>Create Invoice</button>
            </div> :
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700 }}>{inv.invoice_number}</td>
                      <td>{inv.clients?.name || '—'}</td>
                      <td style={{ fontWeight: 700 }}>₦{Number(inv.total).toLocaleString()}</td>
                      <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                      <td>
                        <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                          style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: 12, cursor: 'pointer', color: inv.status === 'paid' ? '#15803d' : inv.status === 'overdue' ? '#b91c1c' : '#a16207' }}>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => downloadPDF(inv)} style={{ background: '#f0faf5', color: '#0d7c4f', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>PDF</button>
                          <button onClick={() => shareWhatsApp(inv)} style={{ background: '#f0fff4', color: '#15803d', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>WhatsApp</button>
                          <button onClick={() => deleteInvoice(inv.id)} style={{ background: '#fef2f2', color: '#b91c1c', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title">Create New Invoice</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={saveInvoice}>
              <div className="form-row">
                <div className="form-group">
                  <label>Client</label>
                  <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontWeight: 600, fontSize: 13 }}>Invoice Items</label>
                  <button type="button" onClick={addItem} style={{ background: '#f0faf5', color: '#0d7c4f', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add Item</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px 32px', gap: 8, marginBottom: 8 }}>
                    <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} required />
                    <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                    <input type="number" placeholder="Price (₦)" min="0" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} style={{ padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                    <button type="button" onClick={() => removeItem(i)} style={{ background: '#fef2f2', color: '#b91c1c', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16, textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Subtotal: {fmt(subtotal)}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Tax (7.5%): {fmt(tax)}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0a1628' }}>Total: {fmt(total)}</div>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea rows={2} placeholder="Payment terms, bank details, etc." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={saving}>
                {saving ? 'Saving...' : 'Create Invoice →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
