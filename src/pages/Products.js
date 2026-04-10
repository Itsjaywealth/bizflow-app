import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const emptyForm = { name: '', description: '', price: '' }

export default function Products({ business }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEdit(product) {
    setEditing(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price || ''
    })
    setShowModal(true)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: Number(form.price) || 0 }
    if (editing) await supabase.from('products').update(payload).eq('id', editing)
    else await supabase.from('products').insert({ ...payload, business_id: business.id })
    await loadProducts()
    setShowModal(false)
    setSaving(false)
  }

  async function remove(id) {
    if (window.confirm('Delete this product or service?')) {
      await supabase.from('products').delete().eq('id', id)
      loadProducts()
    }
  }

  const fmt = (n) => '₦' + Number(n || 0).toLocaleString()
  const filtered = products.filter(product => `${product.name} ${product.description || ''}`.toLowerCase().includes(query.toLowerCase()))
  const totalValue = products.reduce((sum, product) => sum + (product.price || 0), 0)
  const averagePrice = products.length ? totalValue / products.length : 0
  const topProducts = [...products].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 3)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Products & Services</div>
          <div className="page-sub">Save the things your business sells often, then add them to invoices in one click</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Product or Service</button>
      </div>

      <div className="section-grid">
        <div className="stat-card">
          <div className="stat-label">Saved Items</div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-change up">Ready for invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Price</div>
          <div className="stat-value" style={{ color: '#0d7c4f' }}>{fmt(averagePrice)}</div>
          <div className="stat-change" style={{ color: '#64748b' }}>Across saved items</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invoice Shortcut</div>
          <div className="stat-value" style={{ fontSize: 18 }}>One-click reuse</div>
          <div className="stat-change up">Less typing, fewer mistakes</div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--dark)' }}>Your Price List</div>
              <p style={{ color: 'var(--text2)', fontSize: 13, margin: '4px 0 0' }}>Useful for consultants, vendors, agencies, restaurants, salons, logistics and retail businesses.</p>
            </div>
            <Link className="mini-action green" to="/invoices">Use in invoice</Link>
          </div>

          <div className="table-toolbar">
            <input placeholder="Search products or services..." value={query} onChange={e => setQuery(e.target.value)} />
            <span />
          </div>

          {loading ? <p style={{ color: '#94a3b8' }}>Loading products...</p> :
            filtered.length === 0 ?
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>{products.length ? 'No matching item found' : 'No products or services yet'}</h3>
                <p>Add your common products, services, retainers, delivery fees, or consultation packages.</p>
                <button className="btn-primary" onClick={openAdd}>Add Product or Service</button>
              </div> :
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(product => (
                      <tr key={product.id}>
                        <td style={{ fontWeight: 700 }}>{product.name}</td>
                        <td>{product.description || 'No description added'}</td>
                        <td style={{ fontWeight: 800, color: '#0d7c4f' }}>{fmt(product.price)}</td>
                        <td>
                          <div className="action-row">
                            <button className="mini-action" onClick={() => openEdit(product)}>Edit</button>
                            <button className="mini-action red" onClick={() => remove(product.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        <div className="card">
          <div style={{ fontWeight: 800, color: 'var(--dark)', marginBottom: 12 }}>Best-priced items</div>
          {topProducts.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 14 }}>Add items to see your top-priced products and services.</p> :
            topProducts.map(product => (
              <div key={product.id} className="setup-check-item">
                <span>{product.name}</span>
                <strong>{fmt(product.price)}</strong>
              </div>
            ))
          }
          <div className="notice success" style={{ marginTop: 16 }}>
            Tip: Save your repeat services here first. When creating an invoice, choose the item and BizFlow fills the price automatically.
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Product or Service' : 'Add Product or Service'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Name *</label>
                <input placeholder="Website design, Delivery fee, Monthly retainer..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} placeholder="Short note customers can understand" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Price (₦)</label>
                <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <button className="btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Save Product or Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
