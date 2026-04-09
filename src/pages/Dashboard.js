import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard({ business }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, staff: 0, clients: 0, invoiceCount: 0 })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (business) loadData() }, [business])

  async function loadData() {
    const [invRes, staffRes, clientRes] = await Promise.all([
      supabase.from('invoices').select('*').eq('business_id', business.id),
      supabase.from('staff').select('id').eq('business_id', business.id),
      supabase.from('clients').select('id').eq('business_id', business.id),
    ])
    const invoices = invRes.data || []
    const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)
    const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || 0), 0)
    setStats({ total: paid + pending, paid, pending, staff: staffRes.data?.length || 0, clients: clientRes.data?.length || 0, invoiceCount: invoices.length })
    setRecentInvoices(invoices.slice(-5).reverse())
    setLoading(false)
  }

  const fmt = (n) => '₦' + Number(n).toLocaleString()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{greeting}! 👋</div>
          <div className="page-sub">Here's how {business.name} is doing today</div>
        </div>
        <Link to="/invoices"><button className="btn-primary">+ New Invoice</button></Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: '#0d7c4f' }}>{fmt(stats.paid)}</div>
          <div className="stat-change up">{stats.invoiceCount} invoices total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Awaiting Payment</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{fmt(stats.pending)}</div>
          <div className="stat-change" style={{ color: '#64748b' }}>Follow up needed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{stats.clients}</div>
          <div className="stat-change up">Active clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Team Members</div>
          <div className="stat-value">{stats.staff}</div>
          <div className="stat-change up">Staff on record</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Create Invoice', desc: 'Send a new invoice', icon: '🧾', to: '/invoices', color: '#0d7c4f' },
          { label: 'Add Client', desc: 'Add a new client', icon: '🤝', to: '/clients', color: '#3b82f6' },
          { label: 'Add Staff', desc: 'Add a team member', icon: '👥', to: '/staff', color: '#8b5cf6' },
        ].map(a => (
          <Link key={a.label} to={a.to} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, transition: 'all .2s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0a1628', marginBottom: 3 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0a1628' }}>Recent Invoices</div>
          <Link to="/invoices" style={{ fontSize: 13, color: '#0d7c4f', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        {loading ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading...</p> :
          recentInvoices.length === 0 ?
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <h3>No invoices yet</h3>
              <p>Create your first invoice to start getting paid</p>
              <Link to="/invoices"><button className="btn-primary">Create Invoice</button></Link>
            </div> :
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Invoice #</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {recentInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                      <td>{inv.client_id || '—'}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td>
                      <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  )
}
