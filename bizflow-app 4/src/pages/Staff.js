import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Staff({ business }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', salary: '', status: 'active' })

  useEffect(() => { loadStaff() }, [])

  async function loadStaff() {
    const { data } = await supabase.from('staff').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
    setStaff(data || [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm({ name: '', role: '', email: '', phone: '', salary: '', status: 'active' }); setShowModal(true) }
  function openEdit(s) { setEditing(s.id); setForm({ name: s.name, role: s.role || '', email: s.email || '', phone: s.phone || '', salary: s.salary || '', status: s.status }); setShowModal(true) }

  async function save(e) {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, salary: Number(form.salary) || 0 }
    if (editing) await supabase.from('staff').update(payload).eq('id', editing)
    else await supabase.from('staff').insert({ ...payload, business_id: business.id })
    await loadStaff(); setShowModal(false); setSaving(false)
  }

  async function deleteStaff(id) {
    if (window.confirm('Remove this staff member?')) {
      await supabase.from('staff').delete().eq('id', id)
      loadStaff()
    }
  }

  const totalPayroll = staff.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.salary || 0), 0)
  const fmt = (n) => '₦' + Number(n).toLocaleString()

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Team</div>
          <div className="page-sub">Manage your staff and payroll</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Staff</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">Total Staff</div><div className="stat-value">{staff.length}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value" style={{ color: '#0d7c4f' }}>{staff.filter(s => s.status === 'active').length}</div></div>
        <div className="stat-card"><div className="stat-label">Monthly Payroll</div><div className="stat-value" style={{ fontSize: 18 }}>{fmt(totalPayroll)}</div></div>
      </div>

      <div className="card">
        {loading ? <p style={{ color: '#94a3b8' }}>Loading staff...</p> :
          staff.length === 0 ?
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No staff added yet</h3>
              <p>Add your team members to track salaries and manage your workforce</p>
              <button className="btn-primary" onClick={openAdd}>Add Staff Member</button>
            </div> :
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Monthly Salary</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, background: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#7c3aed' }}>{s.name[0].toUpperCase()}</div><div><div style={{ fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{s.email || ''}</div></div></div></td>
                      <td>{s.role || '—'}</td>
                      <td>{s.phone || '—'}</td>
                      <td style={{ fontWeight: 700, color: '#0d7c4f' }}>{s.salary ? fmt(s.salary) : '—'}</td>
                      <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(s)} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteStaff(s.id)} style={{ background: '#fef2f2', color: '#b91c1c', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>🗑</button>
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
              <div className="modal-title">{editing ? 'Edit Staff Member' : 'Add Staff Member'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Full Name *</label><input placeholder="Adaeze Okonkwo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Job Role</label><input placeholder="Senior Designer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
                <div className="form-group"><label>Monthly Salary (₦)</label><input type="number" placeholder="150000" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input type="email" placeholder="adaeze@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-group"><label>Phone</label><input placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on leave">On Leave</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Staff Member →'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
