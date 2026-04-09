import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Settings({ business, setBusiness }) {
  const [form, setForm] = useState({
    name: business.name || '',
    email: business.email || '',
    phone: business.phone || '',
    address: business.address || '',
    logo_url: business.logo_url || '',
    bank_name: business.bank_name || '',
    account_name: business.account_name || '',
    account_number: business.account_number || '',
    payment_link: business.payment_link || ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { data, error } = await supabase
      .from('businesses')
      .update(form)
      .eq('id', business.id)
      .select()
      .single()
    if (!error && data) {
      setBusiness(data)
      setMessage('Business settings saved.')
    } else {
      setMessage(error?.message || 'Unable to save settings.')
    }
    setSaving(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Manage business branding, contact details and payment instructions</div>
        </div>
      </div>

      <form className="card" onSubmit={save}>
        <div className="form-row">
          <div className="form-group">
            <label>Business Name *</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Logo URL</label>
            <input placeholder="https://..." value={form.logo_url} onChange={e => update('logo_url', e.target.value)} />
            <small className="field-help">Upload your logo to a public location and paste the image link here. This appears on public invoices.</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Business Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={form.phone} onChange={e => update('phone', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <input value={form.address} onChange={e => update('address', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Bank Name</label>
            <input placeholder="GTBank, Access Bank..." value={form.bank_name} onChange={e => update('bank_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Account Number</label>
            <input value={form.account_number} onChange={e => update('account_number', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Account Name</label>
            <input value={form.account_name} onChange={e => update('account_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Payment Link (optional)</label>
            <input placeholder="Paystack payment page or checkout link" value={form.payment_link} onChange={e => update('payment_link', e.target.value)} />
            <small className="field-help">Use a tested payment page link only. Do not paste Paystack secret keys here.</small>
          </div>
        </div>

        {form.logo_url && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Logo preview</div>
            <img src={form.logo_url} alt="Business logo preview" style={{ maxHeight: 70, maxWidth: 180, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 12, padding: 10, background: 'white' }} />
          </div>
        )}

        {message && <div style={{ marginBottom: 16, color: message.includes('saved') ? '#0d7c4f' : '#b91c1c', fontSize: 13, fontWeight: 700 }}>{message}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  )
}
