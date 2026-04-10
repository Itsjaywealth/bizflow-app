import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyForm = { title: '', category: '', amount: '', expense_date: new Date().toISOString().slice(0, 10), notes: '' }
const commonCategories = ['Rent', 'Transport', 'Salary', 'Supplies', 'Internet', 'Marketing', 'Fuel', 'Utilities']

export default function Expenses({ business }) {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => { loadExpenses() }, [])

  async function loadExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('business_id', business.id)
      .order('expense_date', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }

  function openAdd(category = '') {
    setEditing(null)
    setForm({ ...emptyForm, category })
    setShowModal(true)
  }

  function openEdit(expense) {
    setEditing(expense.id)
    setForm({
      title: expense.title,
      category: expense.category || '',
      amount: expense.amount || '',
      expense_date: expense.expense_date || new Date().toISOString().slice(0, 10),
      notes: expense.notes || ''
    })
    setShowModal(true)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, amount: Number(form.amount) || 0, category: form.category || 'General' }
    if (editing) await supabase.from('expenses').update(payload).eq('id', editing)
    else await supabase.from('expenses').insert({ ...payload, business_id: business.id })
    await loadExpenses()
    setShowModal(false)
    setSaving(false)
  }

  async function remove(id) {
    if (window.confirm('Delete this expense?')) {
      await supabase.from('expenses').delete().eq('id', id)
      loadExpenses()
    }
  }

  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyTotal = expenses
    .filter(e => (e.expense_date || '').startsWith(thisMonth))
    .reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const categories = Array.from(new Set(expenses.map(e => e.category || 'General'))).sort()
  const filtered = expenses.filter(expense => {
    const haystack = `${expense.title} ${expense.category || ''} ${expense.notes || ''}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || (expense.category || 'General') === categoryFilter
    return matchesQuery && matchesCategory
  })
  const categoryTotals = categories.map(category => ({
    category,
    total: expenses.filter(e => (e.category || 'General') === category).reduce((sum, e) => sum + (e.amount || 0), 0)
  })).sort((a, b) => b.total - a.total).slice(0, 5)
  const largestExpense = expenses.reduce((max, expense) => (expense.amount || 0) > (max?.amount || 0) ? expense : max, null)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-sub">Record costs like rent, salaries, logistics, supplies, internet and marketing</div>
        </div>
        <button className="btn-primary" onClick={() => openAdd()}>+ Add Expense</button>
      </div>

      <div className="section-grid">
        <div className="stat-card"><div className="stat-label">Total Expenses</div><div className="stat-value" style={{ color: '#b91c1c' }}>{fmt(total)}</div><div className="stat-change dn">All recorded costs</div></div>
        <div className="stat-card"><div className="stat-label">This Month</div><div className="stat-value">{fmt(monthlyTotal)}</div><div className="stat-change" style={{ color: '#64748b' }}>Current month spend</div></div>
        <div className="stat-card"><div className="stat-label">Largest Expense</div><div className="stat-value" style={{ fontSize: 20 }}>{largestExpense ? fmt(largestExpense.amount) : '₦0'}</div><div className="stat-change" style={{ color: '#64748b' }}>{largestExpense?.title || 'No record yet'}</div></div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--dark)' }}>Expense Records</div>
              <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Know where your money is going before month end.</p>
            </div>
          </div>

          <div className="table-toolbar">
            <input placeholder="Search expense, category or note..." value={query} onChange={e => setQuery(e.target.value)} />
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map(category => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          <div className="quick-chip-row">
            {commonCategories.map(category => <button key={category} type="button" onClick={() => openAdd(category)}>{category}</button>)}
          </div>

          {loading ? <p style={{ color: '#94a3b8' }}>Loading expenses...</p> :
            filtered.length === 0 ?
              <div className="empty-state">
                <div className="empty-icon">💸</div>
                <h3>{expenses.length ? 'No matching expense found' : 'No expenses yet'}</h3>
                <p>Start with rent, transport, supplies, salaries, fuel, or other business costs.</p>
                <button className="btn-primary" onClick={() => openAdd()}>Add Expense</button>
              </div> :
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(expense => (
                      <tr key={expense.id}>
                        <td style={{ fontWeight: 700 }}>{expense.title}</td>
                        <td>{expense.category || 'General'}</td>
                        <td style={{ fontWeight: 800, color: '#b91c1c' }}>{fmt(expense.amount)}</td>
                        <td>{expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : '—'}</td>
                        <td>
                          <div className="action-row">
                            <button className="mini-action" onClick={() => openEdit(expense)}>Edit</button>
                            <button className="mini-action red" onClick={() => remove(expense.id)}>Delete</button>
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
          <div style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }}>Top Spending Areas</div>
          {categoryTotals.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Add expenses to see which areas cost the most.</p> :
            <div className="chart-list">
              {categoryTotals.map(row => (
                <div key={row.category} className="chart-row">
                  <span>{row.category}</span>
                  <div className="chart-track">
                    <div className="chart-fill expense" style={{ width: `${Math.max(5, (row.total / Math.max(total, 1)) * 100)}%` }} />
                  </div>
                  <strong>{fmt(row.total)}</strong>
                </div>
              ))}
            </div>
          }
          <div className="notice success" style={{ marginTop: 16 }}>
            Tip: Recording expenses gives your dashboard a better profit estimate, not just sales totals.
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Expense' : 'Add Expense'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Title *</label>
                <input placeholder="Office rent, dispatch rider, data subscription..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input placeholder="Rent, Transport, Salary..." value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea rows={2} placeholder="Optional note for your records" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
