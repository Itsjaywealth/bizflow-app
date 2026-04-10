import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import PageUtilityNav from '../components/PageUtilityNav'

export default function Onboarding({ setBusiness }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', bank_name: '', account_name: '', account_number: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('businesses').insert({ ...form, user_id: user.id }).select().single()
    if (error) { setError(error.message); setLoading(false); return }
    setBusiness(data)
  }

  return (
    <div className="auth-shell">
      <div style={{ width: '100%', maxWidth: 520 }}>
        <PageUtilityNav />
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: '#0d7c4f', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0a1628' }}>Set Up Your Business</h1>
          <p style={{ color: '#64748b', fontSize: 15, marginTop: 8 }}>Add the details customers should see on invoices. You can update everything later.</p>
        </div>

        <div className="auth-panel">
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {['Business Info', 'Payment Info', 'Done'].map((step, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 4, borderRadius: 4, background: i < 2 ? '#0d7c4f' : '#e2e8f0', marginBottom: 6 }}></div>
                <span style={{ fontSize: 11, color: i < 2 ? '#0d7c4f' : '#94a3b8', fontWeight: 600 }}>{step}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Business Name *</label>
              <input type="text" placeholder="e.g. Obi Ventures" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Business Email</label>
                <input type="email" placeholder="info@yourbiz.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Business Address</label>
              <input type="text" placeholder="123 Lagos Street, Lagos" value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bank Name</label>
                <input type="text" placeholder="Access Bank, GTBank..." value={form.bank_name} onChange={e => update('bank_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input type="text" placeholder="0123456789" value={form.account_number} onChange={e => update('account_number', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Account Name</label>
              <input type="text" placeholder="Your business account name" value={form.account_name} onChange={e => update('account_name', e.target.value)} />
              <small className="field-help">These payment details can appear on invoices so customers know where to pay.</small>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15 }} disabled={loading}>
              {loading ? 'Setting up...' : 'Take Me to My Dashboard →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
