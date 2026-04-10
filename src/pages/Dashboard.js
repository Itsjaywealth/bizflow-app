import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard({ business }) {
  const [stats, setStats] = useState({ paid: 0, pending: 0, expenses: 0, profit: 0, staff: 0, clients: 0, products: 0, invoiceCount: 0 })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [topClients, setTopClients] = useState([])
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return undefined
    loadData()

    const channel = supabase
      .channel(`dashboard-realtime-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `business_id=eq.${business.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${business.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff', filter: `business_id=eq.${business.id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `business_id=eq.${business.id}` }, loadData)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [business])

  async function loadData() {
    const [invRes, staffRes, clientRes, expenseRes, productRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name)').eq('business_id', business.id).order('created_at', { ascending: true }),
      supabase.from('staff').select('id').eq('business_id', business.id),
      supabase.from('clients').select('id,name').eq('business_id', business.id),
      supabase.from('expenses').select('*').eq('business_id', business.id),
      supabase.from('products').select('id').eq('business_id', business.id)
    ])
    const invoices = invRes.data || []
    const expenses = expenseRes.data || []
    const paid = invoices.reduce((s, i) => s + Number(i.amount_paid ?? (i.status === 'paid' ? i.total : 0) ?? 0), 0)
    const pending = invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((s, i) => s + Math.max(Number(i.total || 0) - Number(i.amount_paid ?? (i.status === 'paid' ? i.total : 0) ?? 0), 0), 0)
    const expenseTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0)
    const clientTotals = invoices.reduce((acc, inv) => {
      const name = inv.clients?.name || inv.client_snapshot?.name || 'Unassigned'
      acc[name] = (acc[name] || 0) + (inv.total || 0)
      return acc
    }, {})
    const monthMap = {}
    invoices.forEach(inv => {
      const key = (inv.created_at || '').slice(0, 7)
      if (!key) return
      monthMap[key] = monthMap[key] || { month: key, revenue: 0, expenses: 0 }
      monthMap[key].revenue += Number(inv.amount_paid ?? (inv.status === 'paid' ? inv.total : 0) ?? 0)
    })
    expenses.forEach(exp => {
      const key = (exp.expense_date || exp.created_at || '').slice(0, 7)
      if (!key) return
      monthMap[key] = monthMap[key] || { month: key, revenue: 0, expenses: 0 }
      monthMap[key].expenses += exp.amount || 0
    })
    setStats({ paid, pending, expenses: expenseTotal, profit: paid - expenseTotal, staff: staffRes.data?.length || 0, clients: clientRes.data?.length || 0, products: productRes.data?.length || 0, invoiceCount: invoices.length })
    setRecentInvoices(invoices.slice(-5).reverse())
    setTopClients(Object.entries(clientTotals).sort((a, b) => b[1] - a[1]).slice(0, 4))
    setMonthly(Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6))
    setLoading(false)
  }

  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const checklist = [
    { label: 'Add business phone or email', done: Boolean(business.phone || business.email), to: '/settings' },
    { label: 'Add logo or brand details', done: Boolean(business.logo_url), to: '/settings' },
    { label: 'Add bank/payment details', done: Boolean(business.bank_name || business.payment_link), to: '/settings' },
    { label: 'Create first invoice', done: stats.invoiceCount > 0, to: '/invoices' },
    { label: 'Add a product or service', done: stats.products > 0, to: '/products' }
  ]
  const completedSetup = checklist.filter(item => item.done).length
  const setupPercent = Math.round((completedSetup / checklist.length) * 100)
  const unpaidCount = recentInvoices.filter(inv => inv.status !== 'cancelled' && Math.max(Number(inv.total || 0) - Number(inv.amount_paid ?? (inv.status === 'paid' ? inv.total : 0) ?? 0), 0) > 0).length
  const focusItems = [
    {
      label: 'Setup progress',
      value: `${setupPercent}%`,
      body: completedSetup === checklist.length ? 'Your workspace is ready for daily use.' : `${checklist.length - completedSetup} setup step${checklist.length - completedSetup === 1 ? '' : 's'} left.`
    },
    {
      label: 'Payment follow-up',
      value: unpaidCount,
      body: unpaidCount ? 'Review recent invoices and send reminders where needed.' : 'No recent invoice needs follow-up right now.'
    },
    {
      label: 'Saved records',
      value: stats.clients + stats.products + stats.staff,
      body: 'Clients, products, and team records available in this workspace.'
    }
  ]
  const maxChart = Math.max(...monthly.map(row => Math.max(row.revenue, row.expenses)), 1)

  return (
    <div>
      <section className="dashboard-command">
        <div>
          <div className="landing-eyebrow">Business overview</div>
          <h1>{greeting}, {business.name}.</h1>
          <p>Track cash movement, create invoices, organize customers, and keep your business records moving from one workspace.</p>
          <div className="dashboard-command-actions">
            <Link to="/invoices" className="btn-primary">+ New Invoice</Link>
            <Link to="/expenses" className="btn-outline">Record Expense</Link>
          </div>
        </div>
        <div className="dashboard-focus-panel">
          <div className="dashboard-focus-head">
            <strong>Today’s focus</strong>
            <span>Realtime-ready</span>
          </div>
          {focusItems.map(item => (
            <div className="dashboard-focus-item" key={item.label}>
              <div>
                <span>{item.label}</span>
                <p>{item.body}</p>
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="section-grid">
        <div className="stat-card premium-stat"><div className="stat-label">Revenue Paid</div><div className="stat-value" style={{ color: '#0d7c4f' }}>{fmt(stats.paid)}</div><div className="stat-change up">{stats.invoiceCount} invoices total</div></div>
        <div className="stat-card premium-stat amber-stat"><div className="stat-label">Awaiting Payment</div><div className="stat-value" style={{ color: '#f59e0b' }}>{fmt(stats.pending)}</div><div className="stat-change" style={{ color: '#64748b' }}>Follow up needed</div></div>
        <div className="stat-card premium-stat red-stat"><div className="stat-label">Expenses</div><div className="stat-value" style={{ color: '#b91c1c' }}>{fmt(stats.expenses)}</div><div className="stat-change dn">Costs recorded</div></div>
        <div className="stat-card premium-stat"><div className="stat-label">Estimated Profit</div><div className="stat-value" style={{ color: stats.profit >= 0 ? '#0d7c4f' : '#b91c1c' }}>{fmt(stats.profit)}</div><div className="stat-change up">Paid revenue minus expenses</div></div>
      </div>

      <div className="quick-action-grid">
        {[
          { label: 'Create Invoice', desc: 'Send a branded invoice', icon: '🧾', to: '/invoices' },
          { label: 'Add Client', desc: 'Save customer details', icon: '🤝', to: '/clients' },
          { label: 'Add Product', desc: 'Save common services', icon: '📦', to: '/products' },
          { label: 'Record Expense', desc: 'Track business costs', icon: '💸', to: '/expenses' },
          { label: 'View Plan', desc: 'Review billing options', icon: '💳', to: '/billing' }
        ].map(a => <Link key={a.label} to={a.to} style={{ textDecoration: 'none' }}><div className="quick-action-card premium-action"><div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div><div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)', marginBottom: 3 }}>{a.label}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.desc}</div></div></Link>)}
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--dark)', marginBottom: 16 }}>Setup Checklist</div>
          <div className="setup-checklist">
            {checklist.map(item => <Link key={item.label} to={item.to} className={`setup-check-item ${item.done ? 'done' : ''}`} style={{ textDecoration: 'none' }}><span>{item.done ? '✓' : '○'} {item.label}</span><strong>{item.done ? 'Done' : 'Open'}</strong></Link>)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--dark)', marginBottom: 16 }}>Revenue vs Expenses</div>
          {monthly.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Create invoices and expenses to see monthly trends.</p> : <div className="chart-list">{monthly.map(row => <div key={row.month}><div className="chart-row"><span>{row.month}</span><div className="chart-track"><div className="chart-fill" style={{ width: `${Math.max(4, (row.revenue / maxChart) * 100)}%` }} /></div><strong>{fmt(row.revenue)}</strong></div><div className="chart-row"><span>Expenses</span><div className="chart-track"><div className="chart-fill expense" style={{ width: `${Math.max(4, (row.expenses / maxChart) * 100)}%` }} /></div><strong>{fmt(row.expenses)}</strong></div></div>)}</div>}
        </div>
      </div>

      <div className="dashboard-bottom-grid" style={{ marginTop: 18 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><div style={{ fontWeight: 800, fontSize: 16, color: 'var(--dark)' }}>Recent Invoices</div><Link to="/invoices" style={{ fontSize: 13, color: '#0d7c4f', fontWeight: 600, textDecoration: 'none' }}>View all →</Link></div>
          {loading ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading...</p> : recentInvoices.length === 0 ? <div className="empty-state"><div className="empty-icon">🧾</div><h3>No invoices yet</h3><p>Create your first invoice to start getting paid</p><Link to="/invoices"><button className="btn-primary">Create Invoice</button></Link></div> : <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead><tbody>{recentInvoices.map(inv => <tr key={inv.id}><td style={{ fontWeight: 600 }}>{inv.invoice_number}</td><td>{inv.clients?.name || inv.client_snapshot?.name || '—'}</td><td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td><td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td></tr>)}</tbody></table></div>}
        </div>
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--dark)', marginBottom: 16 }}>Top Clients</div>
          {topClients.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 14 }}>No client activity yet.</p> : topClients.map(([name, value]) => <div key={name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--text2)' }}>{name}</span><strong>{fmt(value)}</strong></div>)}
        </div>
      </div>
    </div>
  )
}
