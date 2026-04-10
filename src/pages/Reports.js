import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Reports({ business }) {
  const [invoices, setInvoices] = useState([])
  const [expenses, setExpenses] = useState([])
  const [clients, setClients] = useState([])
  const [staff, setStaff] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()

    const channel = supabase
      .channel(`reports-realtime-${business.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff', filter: `business_id=eq.${business.id}` }, loadReports)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `business_id=eq.${business.id}` }, loadReports)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [business.id])

  async function loadReports() {
    const [invoiceRes, expenseRes, clientRes, staffRes, productRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name)').eq('business_id', business.id).order('created_at', { ascending: true }),
      supabase.from('expenses').select('*').eq('business_id', business.id).order('expense_date', { ascending: true }),
      supabase.from('clients').select('*').eq('business_id', business.id),
      supabase.from('staff').select('*').eq('business_id', business.id),
      supabase.from('products').select('*').eq('business_id', business.id)
    ])

    setInvoices(invoiceRes.data || [])
    setExpenses(expenseRes.data || [])
    setClients(clientRes.data || [])
    setStaff(staffRes.data || [])
    setProducts(productRes.data || [])
    setLoading(false)
  }

  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  const paidRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
  const pendingRevenue = invoices.filter(i => ['sent', 'pending', 'overdue'].includes(i.status)).reduce((sum, inv) => sum + (inv.total || 0), 0)
  const draftRevenue = invoices.filter(i => i.status === 'draft').reduce((sum, inv) => sum + (inv.total || 0), 0)
  const expenseTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const estimatedProfit = paidRevenue - expenseTotal
  const collectionRate = invoices.length ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100) : 0
  const activeStaff = staff.filter(member => member.status !== 'inactive').length

  const statusRows = ['paid', 'sent', 'pending', 'overdue', 'draft'].map(status => {
    const list = invoices.filter(inv => inv.status === status)
    return {
      status,
      count: list.length,
      total: list.reduce((sum, inv) => sum + (inv.total || 0), 0)
    }
  })

  const monthMap = {}
  invoices.forEach(inv => {
    const key = (inv.created_at || '').slice(0, 7)
    if (!key) return
    monthMap[key] = monthMap[key] || { month: key, revenue: 0, pending: 0, expenses: 0 }
    if (inv.status === 'paid') monthMap[key].revenue += inv.total || 0
    if (['sent', 'pending', 'overdue'].includes(inv.status)) monthMap[key].pending += inv.total || 0
  })
  expenses.forEach(expense => {
    const key = (expense.expense_date || expense.created_at || '').slice(0, 7)
    if (!key) return
    monthMap[key] = monthMap[key] || { month: key, revenue: 0, pending: 0, expenses: 0 }
    monthMap[key].expenses += expense.amount || 0
  })
  const monthlyRows = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  const maxMonthlyValue = Math.max(...monthlyRows.map(row => Math.max(row.revenue, row.pending, row.expenses)), 1)

  const clientTotals = invoices.reduce((acc, inv) => {
    const name = inv.clients?.name || inv.client_snapshot?.name || 'Unassigned'
    acc[name] = acc[name] || { name, total: 0, count: 0, paid: 0 }
    acc[name].total += inv.total || 0
    acc[name].count += 1
    if (inv.status === 'paid') acc[name].paid += inv.total || 0
    return acc
  }, {})
  const topClients = Object.values(clientTotals).sort((a, b) => b.total - a.total).slice(0, 5)

  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'General'
    acc[category] = (acc[category] || 0) + (expense.amount || 0)
    return acc
  }, {})
  const topCategories = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const insights = [
    pendingRevenue > 0
      ? `You have ${fmt(pendingRevenue)} awaiting payment. Follow up from the invoice page.`
      : 'No pending invoice value yet. Keep marking invoices as paid when money enters.',
    expenseTotal > paidRevenue && expenseTotal > 0
      ? 'Expenses are currently higher than paid revenue. Review top spending areas.'
      : 'Your paid revenue is ahead of recorded expenses based on current records.',
    clients.length === 0
      ? 'Add clients or create an invoice with a new customer to start building customer history.'
      : `${clients.length} client record${clients.length === 1 ? '' : 's'} saved in this workspace.`
  ]

  return (
    <div>
      <section className="dashboard-command reports-hero">
        <div>
          <div className="landing-eyebrow">Business reports</div>
          <h1>Understand sales, spending, and business activity.</h1>
          <p>Use reports to see what has been paid, what is still pending, where money is going, and which customers matter most.</p>
          <div className="dashboard-command-actions">
            <Link to="/invoices" className="btn-primary">Review Invoices</Link>
            <Link to="/expenses" className="btn-outline">Add Expense</Link>
          </div>
        </div>
        <div className="dashboard-focus-panel">
          <div className="dashboard-focus-head">
            <strong>Report summary</strong>
            <span>Realtime-ready</span>
          </div>
          {insights.map((insight, index) => (
            <div className="dashboard-focus-item" key={insight}>
              <div>
                <span>Insight {index + 1}</span>
                <p>{insight}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-grid">
        <div className="stat-card premium-stat"><div className="stat-label">Paid Revenue</div><div className="stat-value" style={{ color: '#0d7c4f' }}>{fmt(paidRevenue)}</div><div className="stat-change up">{collectionRate}% invoice count paid</div></div>
        <div className="stat-card premium-stat amber-stat"><div className="stat-label">Awaiting Payment</div><div className="stat-value" style={{ color: '#f59e0b' }}>{fmt(pendingRevenue)}</div><div className="stat-change" style={{ color: '#64748b' }}>Sent, pending, or overdue</div></div>
        <div className="stat-card premium-stat red-stat"><div className="stat-label">Expenses</div><div className="stat-value" style={{ color: '#b91c1c' }}>{fmt(expenseTotal)}</div><div className="stat-change dn">Recorded business costs</div></div>
        <div className="stat-card premium-stat"><div className="stat-label">Estimated Profit</div><div className="stat-value" style={{ color: estimatedProfit >= 0 ? '#0d7c4f' : '#b91c1c' }}>{fmt(estimatedProfit)}</div><div className="stat-change up">Paid revenue minus expenses</div></div>
      </div>

      <div className="reports-kpi-strip">
        <div><span>Total invoices</span><strong>{invoices.length}</strong></div>
        <div><span>Draft value</span><strong>{fmt(draftRevenue)}</strong></div>
        <div><span>Clients</span><strong>{clients.length}</strong></div>
        <div><span>Products/services</span><strong>{products.length}</strong></div>
        <div><span>Active staff</span><strong>{activeStaff}</strong></div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card">
          <div className="report-card-head">
            <div>
              <h2>Monthly Performance</h2>
              <p>Paid revenue, pending invoice value, and expenses for recent months.</p>
            </div>
          </div>
          {loading ? <p style={{ color: '#94a3b8' }}>Loading reports...</p> :
            monthlyRows.length === 0 ? <EmptyReport title="No monthly activity yet" body="Create invoices and record expenses to build your report history." /> :
            <div className="report-bars">
              {monthlyRows.map(row => (
                <div className="report-month-row" key={row.month}>
                  <div className="report-month-label">{row.month}</div>
                  <div className="report-bar-group">
                    <ReportBar label="Paid" value={row.revenue} max={maxMonthlyValue} tone="green" />
                    <ReportBar label="Pending" value={row.pending} max={maxMonthlyValue} tone="amber" />
                    <ReportBar label="Expenses" value={row.expenses} max={maxMonthlyValue} tone="red" />
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        <div className="card">
          <div className="report-card-head">
            <div>
              <h2>Invoice Status</h2>
              <p>How invoices are distributed by current status.</p>
            </div>
          </div>
          {invoices.length === 0 ? <EmptyReport title="No invoice status yet" body="Create invoices to see status reports." /> :
            <div className="status-report-list">
              {statusRows.map(row => (
                <div key={row.status} className="status-report-item">
                  <span className={`badge badge-${row.status}`}>{row.status}</span>
                  <strong>{row.count}</strong>
                  <p>{fmt(row.total)}</p>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      <div className="dashboard-bottom-grid" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="report-card-head">
            <div>
              <h2>Top Clients</h2>
              <p>Customers ranked by total invoice value.</p>
            </div>
            <Link to="/clients" className="mini-action green">Manage clients</Link>
          </div>
          {topClients.length === 0 ? <EmptyReport title="No client activity yet" body="Client reports appear when invoices are created." /> :
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Client</th><th>Invoices</th><th>Paid</th><th>Total Value</th></tr></thead>
                <tbody>
                  {topClients.map(client => (
                    <tr key={client.name}>
                      <td style={{ fontWeight: 800 }}>{client.name}</td>
                      <td>{client.count}</td>
                      <td style={{ color: '#0d7c4f', fontWeight: 800 }}>{fmt(client.paid)}</td>
                      <td style={{ fontWeight: 800 }}>{fmt(client.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>

        <div className="card">
          <div className="report-card-head">
            <div>
              <h2>Top Spending Areas</h2>
              <p>Expense categories ranked by amount.</p>
            </div>
            <Link to="/expenses" className="mini-action green">Manage expenses</Link>
          </div>
          {topCategories.length === 0 ? <EmptyReport title="No expense report yet" body="Record expenses to understand spending areas." /> :
            <div className="chart-list">
              {topCategories.map(row => (
                <div key={row.category} className="chart-row">
                  <span>{row.category}</span>
                  <div className="chart-track">
                    <div className="chart-fill expense" style={{ width: `${Math.max(5, (row.total / Math.max(expenseTotal, 1)) * 100)}%` }} />
                  </div>
                  <strong>{fmt(row.total)}</strong>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  )
}

function ReportBar({ label, value, max, tone }) {
  const width = value ? Math.max(5, (value / max) * 100) : 0
  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()

  return (
    <div className="report-bar-line">
      <span>{label}</span>
      <div className="report-bar-track">
        <div className={`report-bar-fill ${tone}`} style={{ width: `${width}%` }} />
      </div>
      <strong>{fmt(value)}</strong>
    </div>
  )
}

function EmptyReport({ title, body }) {
  return (
    <div className="empty-state compact-empty">
      <div className="empty-icon">📈</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}
