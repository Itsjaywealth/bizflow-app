import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicInvoice() {
  const { token } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInvoice() {
      const { data } = await supabase.rpc('get_public_invoice', { token })
      const invoice = Array.isArray(data) ? data[0] : data
      setInvoice(invoice || null)
      setLoading(false)
    }
    loadInvoice()
  }, [token])

  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  if (loading) return <div className="empty-state"><h3>Loading invoice...</h3></div>
  if (!invoice) return <div className="empty-state"><h3>Invoice not found</h3><p>Please confirm the invoice link and try again.</p></div>
  const business = invoice.business_snapshot || {}
  const client = invoice.client_snapshot || {}
  const items = invoice.items || []

  return <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 20 }}><div className="card" style={{ maxWidth: 860, margin: '30px auto' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}><div>{business.logo_url && <img src={business.logo_url} alt={`${business.name} logo`} style={{ maxHeight: 70, maxWidth: 180, objectFit: 'contain', marginBottom: 12 }} />}<h1 style={{ color: '#0a1628', fontSize: 28, marginBottom: 4 }}>Invoice</h1><p style={{ color: '#64748b' }}>{business.name || 'BizFlow NG business'}</p><p style={{ color: '#64748b', fontSize: 13 }}>{business.email || ''} {business.phone ? `• ${business.phone}` : ''}</p></div><div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, color: '#0a1628' }}>{invoice.invoice_number}</div><div style={{ color: '#64748b', fontSize: 13 }}>Date: {new Date(invoice.created_at).toLocaleDateString()}</div><div style={{ marginTop: 10 }}><span className={`badge badge-${invoice.status}`}>{invoice.status}</span></div></div></div><div style={{ background: '#f8fafc', borderRadius: 14, padding: 18, marginBottom: 22 }}><div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Bill To</div><div style={{ fontWeight: 800 }}>{client.name || 'Client'}</div><div style={{ color: '#64748b', fontSize: 13 }}>{client.email || ''} {client.phone ? `• ${client.phone}` : ''}</div></div><div style={{ overflowX: 'auto' }}><table><thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>{items.map((item, index) => <tr key={index}><td>{item.description}</td><td>{item.qty}</td><td>{fmt(item.price)}</td><td style={{ fontWeight: 800 }}>{fmt(Number(item.qty) * Number(item.price))}</td></tr>)}</tbody></table></div><div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}><div style={{ width: '100%', maxWidth: 320 }}><div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#64748b' }}><span>Subtotal</span><strong>{fmt(invoice.subtotal)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#64748b' }}><span>VAT 7.5%</span><strong>{fmt(invoice.tax)}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e2e8f0', fontSize: 20, color: '#0a1628' }}><span>Total</span><strong>{fmt(invoice.total)}</strong></div></div></div>{(business.bank_name || business.payment_link) && <div style={{ marginTop: 24, border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}><h3 style={{ marginBottom: 10 }}>Payment Details</h3>{business.bank_name && <p style={{ color: '#64748b' }}>{business.bank_name} • {business.account_number} • {business.account_name}</p>}{business.payment_link && <a className="btn-primary" href={business.payment_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', marginTop: 12 }}>Pay Online</a>}</div>}{invoice.notes && <p style={{ marginTop: 20, color: '#64748b' }}>{invoice.notes}</p>}</div></div>
}
