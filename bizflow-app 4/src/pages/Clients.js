import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Clients({ business }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm({ name: '', email: '', phone: '', address: '' }); setShowModal(true) }
  function openEdit(c) { setEditing(c.id); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' }); setShowModal(true) }

  async function save(e) {
    e.preventDefault(); setSaving(true)
    if (editing) {
      await supabase.from('clients').update(form).eq('id', editing)
    } else {
      await supabase.from('clients').insert({ ...form, business_id: business.id })
    }
    await loadClients(); setShowModal(false); setSaving(false)
  }

  async function deleteClient(id) {
    if (window.confirm('Delete this client?')) {
      await supabase.from('clients').delete().eq('id', id)
      loadClients()
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-sub">Manage all your clients in one place</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Client</button>
      </div>

      <div className="card">
        {loading ? <p style={{ color: '#94a3b8' }}>Loading clients...</p> :
          clients.length === 0 ?
            <div className="empty-state">
              <div className="empty-icon">🤝</div>
              <h3>No clients yet</h3>
              <p>Add your first client to start creating invoices for them</p>
              <button className="btn-primary" onClick={openAdd}>Add Client</button>
            </div> :
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, background: '#e8f7f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#0d7c4f' }}>{c.name[0].toUpperCase()}</div><span style={{ fontWeight: 600 }}>{c.name}</span></div></td>
                      <td>{c.email || '—'}</td>
                      <td>{c.phone || '—'}</td>
                      <td>{c.address || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(c)} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteClient(c.id)} style={{ background: '#fef2f2', color: '#b91c1c', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Client' : 'Add New Client'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Client Name *</label><input placeholder="Emeka Obi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input type="email" placeholder="emeka@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label>Phone</label><input placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label>Address</label><input placeholder="123 Lagos Street" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Client →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
