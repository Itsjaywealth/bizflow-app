import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const emptyForm = { name: '', description: '', price: '' }

export default function Products({ business }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadProducts() }, [])
  async function loadProducts() { const { data } = await supabase.from('products').select('*').eq('business_id', business.id).order('created_at', { ascending: false }); setProducts(data || []); setLoading(false) }
  function openAdd() { setEditing(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(product) { setEditing(product.id); setForm({ name: product.name, description: product.description || '', price: product.price || '' }); setShowModal(true) }
  async function save(e) { e.preventDefault(); setSaving(true); const payload = { ...form, price: Number(form.price) || 0 }; if (editing) await supabase.from('products').update(payload).eq('id', editing); else await supabase.from('products').insert({ ...payload, business_id: business.id }); await loadProducts(); setShowModal(false); setSaving(false) }
  async function remove(id) { if (window.confirm('Delete this product or service?')) { await supabase.from('products').delete().eq('id', id); loadProducts() } }
  const fmt = (n) => '₦' + Number(n).toLocaleString()

  return <div><div className="page-header"><div><div className="page-title">Products & Services</div><div className="page-sub">Save common services so invoice creation is faster</div></div><button className="btn-primary" onClick={openAdd}>+ Add Product</button></div><div className="card">{loading ? <p style={{ color: '#94a3b8' }}>Loading products...</p> : products.length === 0 ? <div className="empty-state"><div className="empty-icon">📦</div><h3>No products or services yet</h3><p>Add your common services once, then reuse them inside invoices.</p><button className="btn-primary" onClick={openAdd}>Add Product</button></div> : <div style={{ overflowX: 'auto' }}><table><thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Actions</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td style={{ fontWeight: 700 }}>{product.name}</td><td>{product.description || '—'}</td><td style={{ fontWeight: 800, color: '#0d7c4f' }}>{fmt(product.price)}</td><td><div className="action-row"><button className="mini-action" onClick={() => openEdit(product)}>Edit</button><button className="mini-action red" onClick={() => remove(product.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}</div>{showModal && <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}><div className="modal"><div className="modal-header"><div className="modal-title">{editing ? 'Edit Product' : 'Add Product or Service'}</div><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div><form onSubmit={save}><div className="form-group"><label>Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div><div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div><div className="form-group"><label>Price (₦)</label><input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div><button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? 'Saving...' : 'Save Product'}</button></form></div></div>}</div>
}
