import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyForm = { name: '', email: '', phone: '', address: '' }

export default function Clients({ business }) {
  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const [clientRes, invoiceRes] = await Promise.all([
      supabase.from('clients').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').eq('business_id', business.id)
    ])
    setClients(clientRes.data || [])
    setInvoices(invoiceRes.data || [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(c) { setEditing(c.id); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' }); setShowModal(true) }
  async function save(e) { e.preventDefault(); setSaving(true); if (editing) await supabase.from('clients').update(form).eq('id', editing); else await supabase.from('clients').insert({ ...form, business_id: business.id }); await loadClients(); setShowModal(false); setSaving(false) }
  async function deleteClient(id) { if (window.confirm('Delete this client?')) { await supabase.from('clients').delete().eq('id', id); loadClients() } }
  function clientSummary(client) {
    const records = invoices.filter(inv => inv.client_id === client.id)
    const paidAmount = (inv) => Number(inv.amount_paid ?? (inv.status === 'paid' ? inv.total : 0) ?? 0)
    const balance = (inv) => Math.max(Number(inv.total || 0) - paidAmount(inv), 0)
    return {
      count: records.length,
      paid: records.reduce((sum, inv) => sum + paidAmount(inv), 0),
      pending: records.filter(inv => inv.status !== 'cancelled').reduce((sum, inv) => sum + balance(inv), 0),
      records
    }
  }
  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  const filtered = clients.filter(c => `${c.name} ${c.email || ''} ${c.phone || ''}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="page-header"><div><div className="page-title">Clients</div><div className="page-sub">Manage clients and review their invoice history</div></div><button className="btn-primary" onClick={openAdd}>+ Add Client</button></div>
      <div className="card">
        <div className="table-toolbar"><input placeholder="Search clients..." value={query} onChange={e => setQuery(e.target.value)} /><span /></div>
        {loading ? <p style={{ color: '#94a3b8' }}>Loading clients...</p> : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">🤝</div><h3>No clients found</h3><p>Add your first client or create one while making an invoice.</p><button className="btn-primary" onClick={openAdd}>Add Client</button></div> : <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Invoices</th><th>Outstanding</th><th>Actions</th></tr></thead><tbody>{filtered.map(c => { const summary = clientSummary(c); return <tr key={c.id}><td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, background: '#e8f7f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#0d7c4f' }}>{c.name[0].toUpperCase()}</div><span style={{ fontWeight: 600 }}>{c.name}</span></div></td><td>{c.email || '—'}</td><td>{c.phone || '—'}</td><td>{summary.count}</td><td style={{ color: '#a16207', fontWeight: 800 }}>{fmt(summary.pending)}</td><td><div className="action-row"><button className="mini-action green" onClick={() => setSelectedClient(c)}>History</button><button className="mini-action" onClick={() => openEdit(c)}>Edit</button><button className="mini-action red" onClick={() => deleteClient(c.id)}>Delete</button></div></td></tr> })}</tbody></table></div>}
      </div>
      {selectedClient && <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedClient(null)}><div className="modal" style={{ maxWidth: 720 }}><div className="modal-header"><div className="modal-title">{selectedClient.name} History</div><button className="modal-close" onClick={() => setSelectedClient(null)}>x</button></div>{clientSummary(selectedClient).records.length === 0 ? <p style={{ color: '#64748b' }}>No invoices for this client yet.</p> : <table><thead><tr><th>Invoice</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{clientSummary(selectedClient).records.map(inv => <tr key={inv.id}><td>{inv.invoice_number}</td><td style={{ fontWeight: 800 }}>{fmt(inv.total)}</td><td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td><td>{new Date(inv.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>}</div></div>}
      {showModal && <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}><div className="modal"><div className="modal-header"><div className="modal-title">{editing ? 'Edit Client' : 'Add New Client'}</div><button className="modal-close" onClick={() => setShowModal(false)}>x</button></div><form onSubmit={save}><div className="form-group"><label>Client Name *</label><input placeholder="Customer name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div><div className="form-row"><div className="form-group"><label>Email</label><input type="email" placeholder="client@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div><div className="form-group"><label>Phone</label><input placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div></div><div className="form-group"><label>Address</label><input placeholder="Client address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div><button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Client'}</button></form></div></div>}
    </div>
  )
}
