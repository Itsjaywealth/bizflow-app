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
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [message, setMessage] = useState('')
  const setupItems = [
    { label: 'Business name', done: Boolean(form.name.trim()) },
    { label: 'Contact details', done: Boolean(form.email.trim() || form.phone.trim()) },
    { label: 'Business address', done: Boolean(form.address.trim()) },
    { label: 'Logo or brand image', done: Boolean(form.logo_url.trim()) },
    { label: 'Bank details', done: Boolean(form.bank_name.trim() && form.account_name.trim() && form.account_number.trim()) },
    { label: 'Online payment link', done: Boolean(form.payment_link.trim()) },
  ]
  const setupDone = setupItems.filter(item => item.done).length
  const setupPercent = Math.round((setupDone / setupItems.length) * 100)

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

  async function uploadLogo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.')
      return
    }
    setUploadingLogo(true)
    setMessage('')
    const ext = file.name.split('.').pop()
    const path = `${business.id}/logo-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('business-logos').upload(path, file, { upsert: true })
    if (error) {
      setMessage('Logo upload needs a Supabase Storage bucket named business-logos.')
      setUploadingLogo(false)
      return
    }
    const { data } = supabase.storage.from('business-logos').getPublicUrl(path)
    update('logo_url', data.publicUrl)
    setMessage('Logo uploaded. Click Save Business Profile to keep it.')
    setUploadingLogo(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Business Profile</div>
          <div className="page-sub">Manage your business details, invoice branding and customer payment information</div>
        </div>
      </div>

      <div className="settings-overview-grid">
        <div className="settings-highlight-card">
          <span>Profile readiness</span>
          <strong>{setupPercent}% ready</strong>
          <p>{setupDone === setupItems.length ? 'Your customer-facing profile looks ready for daily use.' : `${setupItems.length - setupDone} item${setupItems.length - setupDone === 1 ? '' : 's'} still need attention before a cleaner launch.`}</p>
          <div className="settings-progress"><div style={{ width: `${setupPercent}%` }} /></div>
        </div>
        <div className="settings-highlight-card">
          <span>Customer payment setup</span>
          <strong>{form.bank_name || form.payment_link ? 'Available' : 'Needs setup'}</strong>
          <p>Add either bank details, a payment link, or both so your invoices clearly show customers how to pay you.</p>
        </div>
      </div>

      <form className="card" onSubmit={save}>
        <div className="settings-section-head">
          <div>
            <strong>Brand details</strong>
            <p>This information shows up across the workspace and on your public invoice pages.</p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Business Name *</label>
            <input value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Business Logo</label>
            <input type="file" accept="image/*" onChange={uploadLogo} />
            <small className="field-help">Upload your logo so it can appear on invoices. If upload is not available yet, paste a direct image link below, not a general website address.</small>
            <input style={{ marginTop: 8 }} placeholder="https://..." value={form.logo_url} onChange={e => update('logo_url', e.target.value)} />
            {uploadingLogo && <small className="field-help">Uploading logo...</small>}
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

        <div className="settings-section-head">
          <div>
            <strong>How customers can pay you</strong>
            <p>These details appear on invoices so customers know the fastest way to complete payment.</p>
          </div>
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
            <label>Online Payment Link (optional)</label>
            <input placeholder="Paste your customer payment link" value={form.payment_link} onChange={e => update('payment_link', e.target.value)} />
            <small className="field-help">Add a tested checkout or payment page that customers can open from the invoice. Only use a real payment page you already control.</small>
          </div>
        </div>

        <div className="settings-preview-card">
          <div className="settings-preview-head">
            <strong>Invoice preview summary</strong>
            <span>What customers can see</span>
          </div>
          <div className="settings-preview-grid">
            <div>
              <label>Business</label>
              <p>{form.name || 'Your business name'}</p>
            </div>
            <div>
              <label>Contact</label>
              <p>{form.email || form.phone || 'Add an email or phone number'}</p>
            </div>
            <div>
              <label>Bank details</label>
              <p>{form.bank_name && form.account_number ? `${form.bank_name} · ${form.account_number}` : 'Add bank details for transfers'}</p>
            </div>
            <div>
              <label>Online payment</label>
              <p>{form.payment_link || 'Optional payment page link'}</p>
            </div>
          </div>
          {form.logo_url && (
            <div className="settings-logo-preview">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Logo preview</div>
              <img src={form.logo_url} alt="Business logo preview" style={{ maxHeight: 70, maxWidth: 180, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 12, padding: 10, background: 'white' }} />
            </div>
          )}
        </div>

        <div className="settings-checklist">
          {setupItems.map(item => (
            <div key={item.label} className={`settings-check-item ${item.done ? 'done' : ''}`}>
              <span>{item.done ? '✓' : '○'}</span>
              <strong>{item.label}</strong>
            </div>
          ))}
        </div>

        {message && <div style={{ marginBottom: 16, color: message.includes('saved') ? '#0d7c4f' : '#b91c1c', fontSize: 13, fontWeight: 700 }}>{message}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Business Profile'}</button>
      </form>
    </div>
  )
}
