import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemeToggle from '../components/ThemeToggle'

export default function PublicInvoice() {
  const { token } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const business = invoice?.business_snapshot || {}
  const client = invoice?.client_snapshot || {}
  const items = invoice?.items || []
  const amountPaid = Number(invoice?.amount_paid ?? (invoice?.status === 'paid' ? invoice?.total : 0) ?? 0)
  const balanceDue = Math.max(Number(invoice?.total || 0) - amountPaid, 0)
  const isPaid = balanceDue <= 0 || invoice?.status === 'paid'
  const isOverdue = invoice?.due_date && !isPaid && new Date(invoice.due_date) < new Date(new Date().toDateString())

  async function copyInvoiceLink() {
    await navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function shareWhatsApp() {
    const msg = `Hello, please find invoice ${invoice.invoice_number} from ${business.name || 'our business'}.

Amount: ${fmt(invoice.total)}
Paid: ${fmt(amountPaid)}
Balance: ${fmt(balanceDue)}
Link: ${currentUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) return <div className="empty-state"><h3>Loading invoice...</h3></div>
  if (!invoice) return <div className="empty-state"><h3>Invoice not found</h3><p>Please confirm the invoice link and try again.</p></div>

  return (
    <div className="public-invoice-shell">
      <div className="public-invoice-actions">
        <Link to="/home" className="btn-outline public-home-button">Back to BizFlow NG</Link>
        <ThemeToggle compact />
        <button className="btn-outline" onClick={copyInvoiceLink}>{copied ? 'Copied' : 'Copy Link'}</button>
        <button className="btn-outline" onClick={shareWhatsApp}>Share on WhatsApp</button>
        <button className="btn-primary" onClick={() => window.print()}>Print Invoice</button>
      </div>

      <div className="public-invoice-card">
        <div className="public-invoice-topbar">
          <div>
            <div className="landing-logo-text">BizFlow <span>NG</span></div>
            <p>Secure invoice page</p>
          </div>
          <Link to="/home">Powered by BizFlow NG</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            {business.logo_url && <img src={business.logo_url} alt={`${business.name} logo`} style={{ maxHeight: 70, maxWidth: 180, objectFit: 'contain', marginBottom: 12 }} />}
            <h1 style={{ color: '#0a1628', fontSize: 28, marginBottom: 4 }}>Invoice</h1>
            <p style={{ color: '#64748b' }}>{business.name || 'BizFlow NG business'}</p>
            <p style={{ color: '#64748b', fontSize: 13 }}>{business.email || ''} {business.phone ? `• ${business.phone}` : ''}</p>
            {business.address && <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{business.address}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: '#0a1628' }}>{invoice.invoice_number}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>Date: {new Date(invoice.created_at).toLocaleDateString()}</div>
            {invoice.due_date && <div style={{ color: '#64748b', fontSize: 13 }}>Due: {new Date(invoice.due_date).toLocaleDateString()}</div>}
            <div style={{ marginTop: 10 }}><span className={`badge badge-${isOverdue ? 'overdue' : invoice.status}`}>{isPaid ? 'paid' : isOverdue ? 'overdue' : invoice.status}</span></div>
          </div>
        </div>

        <div className={`notice ${isPaid ? 'success' : isOverdue ? 'error' : 'success'}`} style={{ marginBottom: 22 }}>
          {isPaid
            ? 'Payment has been marked as received by the issuing business.'
            : isOverdue
              ? 'This invoice appears to be past its due date. Please contact the issuing business if payment has already been made.'
              : 'Please review the invoice details below and use the payment information provided by the issuing business.'}
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 18, marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Bill To</div>
          <div style={{ fontWeight: 800 }}>{client.name || 'Client'}</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>{client.email || ''} {client.phone ? `• ${client.phone}` : ''}</div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
            <tbody>{items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.qty}</td>
                <td>{fmt(item.price)}</td>
                <td style={{ fontWeight: 800 }}>{fmt(Number(item.qty) * Number(item.price))}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <div style={{ width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#64748b' }}><span>Subtotal</span><strong>{fmt(invoice.subtotal)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#64748b' }}><span>VAT 7.5%</span><strong>{fmt(invoice.tax)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e2e8f0', fontSize: 20, color: '#0a1628' }}><span>Total</span><strong>{fmt(invoice.total)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#15803d' }}><span>Amount paid</span><strong>{fmt(amountPaid)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: balanceDue > 0 ? '#a16207' : '#15803d', fontWeight: 800 }}><span>Balance due</span><strong>{fmt(balanceDue)}</strong></div>
          </div>
        </div>

        {(business.bank_name || business.payment_link) && (
          <div className="payment-details-box">
            <div>
              <h3>Payment Details</h3>
              <p>Use the details below to make payment, then contact the business to confirm your transaction.</p>
            </div>
            {business.bank_name && (
              <div className="bank-details">
                <span>{business.bank_name}</span>
                <strong>{business.account_number}</strong>
                <span>{business.account_name}</span>
              </div>
            )}
            {business.payment_link && <a className="btn-primary" href={business.payment_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', marginTop: 12 }}>Open Payment Link</a>}
          </div>
        )}

        {invoice.notes && <p style={{ marginTop: 20, color: '#64748b' }}>{invoice.notes}</p>}
        {!business.bank_name && !business.payment_link && !isPaid && (
          <div className="notice" style={{ marginTop: 20 }}>
            Payment details have not been added to this invoice yet. Please contact {business.name || 'the issuing business'} for payment instructions.
          </div>
        )}
        <div className="public-invoice-footer">
          Generated with BizFlow NG. For questions about this invoice, contact {business.name || 'the issuing business'} directly.
        </div>
      </div>
    </div>
  )
}
