import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyForm = { title: '', category: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), notes: '' }

export default function Expenses({ business }) {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadExpenses() }, [])

  async function loadExpenses() {
    const { data } = await supabase.from('expenses').select('*').eq('business_id', business.id).order('expense_date', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(expense) { setEditing(expense.id); setForm({ title: expense.title, category: expense.category || '', amount: expense.amount || '', expense_date: expense.expense_date || new Date().toISOString().slice(0, 10), notes: expense.notes || '' }); setShowModal(true) }
  async function save(e) { e.preventDefault(); setSaving(true); const payload = { ...form, amount: Number(form.amount) || 0 }; if (editing) await supabase.from('expenses').update(payload).eq('id', editing); else await supabase.from('expenses').insert({ ...payload, business_id: business.id }); await loadExpenses(); setShowModal(false); setSaving(false) }
  async function remove(id) { if (window.confirm('Delete this expense?')) { await supabase.from('expenses').delete().eq('id', id); loadExpenses() } }

  const fmt = (n) => '₦' + Number(n).toLocaleString()
  const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyTotal = expenses.filter(e => (e.expense_date || '').startsWith(thisMonth)).reduce((sum, expense) => sum + (expense.amount || 0), 0)

  return <div><div className="page-header"><div><div className="page-title">Expenses</div><div className="page-sub">Track spending so your dashboard can show real profit</div></div><button className="btn-primary" onClick={openAdd}>+ Add Expense</button></div><div className="section-grid"><div className="stat-card"><div className="stat-label">Total Expenses</div><div className="stat-value" style={{ color: '#b91c1c' }}>{fmt(total)}</div></div><div className="stat-card"><div className="stat-label">This Month</div><div className="stat-value">{fmt(monthlyTotal)}</div></div><div className="stat-card"><div className="stat-label">Records</div><div className="stat-value">{expenses.length}</div></div></div><div className="card">{loading ? <p style={{ color: '#94a3b8' }}>Loading expenses...</p> : expenses.length === 0 ? <div className="empty-state"><div className="empty-icon">💸</div><h3>No expenses yet</h3><p>Record rent, transport, supplies, salaries, and other costs.</p><button className="btn-primary" onClick={openAdd}>Add Expense</button></div> : <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>{expenses.map(expense => <tr key={expense.id}><td style={{ fontWeight: 700 }}>{expense.title}</td><td>{expense.category || 'General'}</td><td style={{ fontWeight: 800, color: '#b91c1c' }}>{fmt(expense.amount)}</td><td>{expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : '—'}</td><td><div className="action-row"><button className="mini-action" onClick={() => openEdit(expense)}>Edit</button><button className="mini-action red" onClick={() => remove(expense.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}</div>{showModal && <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}><div className="modal"><div className="modal-header"><div className="modal-title">{editing ? 'Edit Expense' : 'Add Expense'}</div><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div><form onSubmit={save}><div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div><div className="form-row"><div className="form-group"><label>Category</label><input placeholder="Rent, Transport, Salary..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div><div className="form-group"><label>Amount (₦)</label><input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div></div><div className="form-group"><label>Date</label><input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} /></div><div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div><button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? 'Saving...' : 'Save Expense'}</button></form></div></div>}</div>
}
