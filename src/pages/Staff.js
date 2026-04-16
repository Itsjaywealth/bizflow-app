import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyForm = { name: '', role: '', email: '', phone: '', salary: '', status: 'active' }
const statuses = ['active', 'inactive', 'on leave']
const commonRoles = ['Sales', 'Operations', 'Admin', 'Dispatch', 'Customer Support', 'Designer', 'Manager']

export default function Staff({ business }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState(emptyForm)

  // Staff loading is scoped to the active business.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadStaff() }, [])

  async function loadStaff() {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
    setStaff(data || [])
    setLoading(false)
  }

  function openAdd(role = '') {
    setEditing(null)
    setForm({ ...emptyForm, role })
    setShowModal(true)
  }

  function openEdit(member) {
    setEditing(member.id)
    setForm({
      name: member.name,
      role: member.role || '',
      email: member.email || '',
      phone: member.phone || '',
      salary: member.salary || '',
      status: member.status || 'active'
    })
    setShowModal(true)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, salary: Number(form.salary) || 0 }
    if (editing) await supabase.from('staff').update(payload).eq('id', editing)
    else await supabase.from('staff').insert({ ...payload, business_id: business.id })
    await loadStaff()
    setShowModal(false)
    setSaving(false)
  }

  async function deleteStaff(id) {
    if (window.confirm('Remove this staff member?')) {
      await supabase.from('staff').delete().eq('id', id)
      loadStaff()
    }
  }

  function contactStaff(member) {
    if (!member.phone) {
      alert('Add a phone number for this staff member first.')
      return
    }
    const msg = `Hello ${member.name}, this is a message from ${business.name}.`
    const phone = member.phone.replace(/[^\d]/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  const activeStaff = staff.filter(s => s.status === 'active')
  const totalPayroll = activeStaff.reduce((sum, s) => sum + (s.salary || 0), 0)
  const averageSalary = activeStaff.length ? totalPayroll / activeStaff.length : 0
  const filtered = staff.filter(member => {
    const haystack = `${member.name} ${member.role || ''} ${member.email || ''} ${member.phone || ''}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesQuery && matchesStatus
  })
  const roleSummary = Object.entries(staff.reduce((acc, member) => {
    const role = member.role || 'Unassigned'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Team</div>
          <div className="page-sub">Keep staff contacts, roles, salary records and active status in one place</div>
        </div>
        <button className="btn-primary" onClick={() => openAdd()}>+ Add Staff</button>
      </div>

      <div className="section-grid">
        <div className="stat-card"><div className="stat-label">Total Staff</div><div className="stat-value">{staff.length}</div><div className="stat-change" style={{ color: '#64748b' }}>All team records</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value" style={{ color: '#0d7c4f' }}>{activeStaff.length}</div><div className="stat-change up">Currently working</div></div>
        <div className="stat-card"><div className="stat-label">Monthly Payroll</div><div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalPayroll)}</div><div className="stat-change" style={{ color: '#64748b' }}>Active staff salaries</div></div>
        <div className="stat-card"><div className="stat-label">Average Salary</div><div className="stat-value" style={{ fontSize: 22 }}>{fmt(averageSalary)}</div><div className="stat-change" style={{ color: '#64748b' }}>Active staff average</div></div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--dark)' }}>Staff Directory</div>
              <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Search team members, update their status, or contact them through WhatsApp.</p>
            </div>
          </div>

          <div className="table-toolbar">
            <input placeholder="Search staff, role, email or phone..." value={query} onChange={e => setQuery(e.target.value)} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All status</option>
              {statuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          <div className="quick-chip-row">
            {commonRoles.map(role => <button key={role} type="button" onClick={() => openAdd(role)}>{role}</button>)}
          </div>

          {loading ? <p style={{ color: '#94a3b8' }}>Loading staff...</p> :
            filtered.length === 0 ?
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>{staff.length ? 'No matching staff member found' : 'No staff added yet'}</h3>
                <p>Add team members so payroll, roles and contact details are easier to manage.</p>
                <button className="btn-primary" onClick={() => openAdd()}>Add Staff Member</button>
              </div> :
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Monthly Salary</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(member => (
                      <tr key={member.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar-badge">{member.name[0].toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{member.name}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8' }}>{member.email || 'No email added'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{member.role || '—'}</td>
                        <td>{member.phone || '—'}</td>
                        <td style={{ fontWeight: 800, color: '#0d7c4f' }}>{member.salary ? fmt(member.salary) : '—'}</td>
                        <td><span className={`badge badge-${member.status}`}>{member.status}</span></td>
                        <td>
                          <div className="action-row">
                            <button className="mini-action green" onClick={() => contactStaff(member)}>WhatsApp</button>
                            <button className="mini-action" onClick={() => openEdit(member)}>Edit</button>
                            <button className="mini-action red" onClick={() => deleteStaff(member.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        <div className="card">
          <div style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }}>Team Structure</div>
          {roleSummary.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Add staff roles to see your team structure.</p> :
            roleSummary.map(([role, count]) => (
              <div key={role} className="setup-check-item">
                <span>{role}</span>
                <strong>{count} {count === 1 ? 'person' : 'people'}</strong>
              </div>
            ))
          }
          <div className="notice success" style={{ marginTop: 16 }}>
            Tip: Use status to separate active staff from former staff or people currently on leave.
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Staff Member' : 'Add Staff Member'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Full Name *</label>
                <input placeholder="Staff full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Role</label>
                  <input placeholder="Sales, Admin, Dispatch..." value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Monthly Salary (₦)</label>
                  <input type="number" placeholder="150000" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="staff@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
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
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Staff Member'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
