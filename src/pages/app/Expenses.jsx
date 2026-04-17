import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { DollarSign, Plus, ReceiptText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'

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

  useEffect(() => {
    if (!business?.id) return
    loadExpenses()
  }, [business?.id])

  async function loadExpenses() {
    setLoading(true)
    const { data } = await supabase.from('expenses').select('*').eq('business_id', business.id).order('expense_date', { ascending: false })
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
      notes: expense.notes || '',
    })
    setShowModal(true)
  }

  async function save(event) {
    event.preventDefault()
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

  const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`
  const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthlyTotal = expenses.filter((expense) => (expense.expense_date || '').startsWith(thisMonth)).reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const categories = Array.from(new Set(expenses.map((expense) => expense.category || 'General'))).sort()
  const filtered = useMemo(() => expenses.filter((expense) => {
    const haystack = `${expense.title} ${expense.category || ''} ${expense.notes || ''}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || (expense.category || 'General') === categoryFilter
    return matchesQuery && matchesCategory
  }), [categoryFilter, expenses, query])
  const categoryTotals = categories.map((category) => ({
    category,
    total: expenses.filter((expense) => (expense.category || 'General') === category).reduce((sum, expense) => sum + (expense.amount || 0), 0),
  })).sort((a, b) => b.total - a.total).slice(0, 5)
  const largestExpense = expenses.reduce((max, expense) => ((expense.amount || 0) > (max?.amount || 0) ? expense : max), null)

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-sub">Record costs like rent, salaries, logistics, supplies, internet, and marketing in one place.</div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => openAdd()}>Add Expense</Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="card" className="h-32 rounded-3xl" />) : (
          <>
            <MetricCard label="Total expenses" value={fmt(total)} note="All recorded costs" tone="danger" />
            <MetricCard label="This month" value={fmt(monthlyTotal)} note="Current month spend" />
            <MetricCard label="Largest expense" value={largestExpense ? fmt(largestExpense.amount) : '₦0'} note={largestExpense?.title || 'No record yet'} />
          </>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="rounded-[30px]">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Expense records</h2>
              <p className="mt-1 text-sm text-neutral-500">Know where your money is going before month end.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <input placeholder="Search expense..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none" />
              </label>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800">
                <option value="all">All categories</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {commonCategories.map((category) => (
              <button key={category} type="button" onClick={() => openAdd(category)} className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-600 hover:border-primary hover:text-primary">
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} variant="row" className="w-full rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState illustration={<ReceiptText className="h-14 w-14 text-primary" />} title="No expenses yet" description="Start with rent, transport, supplies, salaries, fuel, or other business costs." ctaLabel="Add Expense" onCta={() => openAdd()} />
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((expense) => (
                    <tr key={expense.id}>
                      <td className="font-semibold text-neutral-900">{expense.title}</td>
                      <td>{expense.category || 'General'}</td>
                      <td className="font-bold text-red-600">{fmt(expense.amount)}</td>
                      <td>{expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="action-row">
                          <Button variant="outline" size="sm" onClick={() => openEdit(expense)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => remove(expense.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="rounded-[30px]">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"><DollarSign className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Top spending areas</h2>
              <p className="mt-1 text-sm text-neutral-500">See which categories take the biggest share.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            {categoryTotals.length === 0 ? <p className="text-sm text-neutral-500">Add expenses to see which areas cost the most.</p> : categoryTotals.map((row) => (
              <div key={row.category}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-neutral-600">{row.category}</span>
                  <strong className="text-sm font-bold text-neutral-950">{fmt(row.total)}</strong>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.max(5, (row.total / Math.max(total, 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit expense' : 'Add expense'}>
        <form onSubmit={save} className="space-y-5">
          <Input label="Title *" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
            <Input label="Amount" type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
          </div>
          <Input label="Date" type="date" value={form.expense_date} onChange={(event) => setForm((current) => ({ ...current, expense_date: event.target.value }))} />
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Notes</span>
            <textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900" />
          </label>
          <Button type="submit" fullWidth loading={saving}>{editing ? 'Save Changes' : 'Save Expense'}</Button>
        </form>
      </Modal>
    </div>
  )
}

Expenses.propTypes = { business: PropTypes.object }

function MetricCard({ label, value, note, tone = 'neutral' }) {
  const toneClasses = { neutral: 'text-neutral-950', danger: 'text-red-600' }
  return (
    <Card className="rounded-3xl">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <h3 className={`mt-3 text-3xl font-black tracking-tight ${toneClasses[tone]}`}>{value}</h3>
      <p className="mt-2 text-sm text-neutral-500">{note}</p>
    </Card>
  )
}

MetricCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, note: PropTypes.string.isRequired, tone: PropTypes.oneOf(['neutral', 'danger']) }
