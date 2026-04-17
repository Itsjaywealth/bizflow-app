import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Package2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'

const emptyForm = { name: '', description: '', price: '' }
const starterCatalog = [
  { name: 'Logo Design', description: 'Brand identity design package for small businesses', price: 85000 },
  { name: 'Social Media Management', description: 'Monthly content planning and posting support', price: 120000 },
  { name: 'Delivery Fee', description: 'Local delivery or dispatch charge', price: 5000 },
  { name: 'Consultation Session', description: 'Strategy or advisory session billed per session', price: 25000 },
]

export default function Products({ business }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [priceBand, setPriceBand] = useState('all')

  useEffect(() => {
    if (!business?.id) return
    loadProducts()
  }, [business?.id])

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openTemplate(template) {
    setEditing(null)
    setForm({ name: template.name, description: template.description, price: template.price })
    setShowModal(true)
  }

  function openEdit(product) {
    setEditing(product.id)
    setForm({ name: product.name, description: product.description || '', price: product.price || '' })
    setShowModal(true)
  }

  async function save(event) {
    event.preventDefault()
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

  const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`
  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.description || ''}`.toLowerCase().includes(query.toLowerCase())
    if (!matchesQuery) return false
    if (priceBand === 'all') return true
    if (priceBand === 'low') return Number(product.price || 0) <= 25000
    if (priceBand === 'mid') return Number(product.price || 0) > 25000 && Number(product.price || 0) <= 100000
    return Number(product.price || 0) > 100000
  }), [priceBand, products, query])
  const totalValue = products.reduce((sum, product) => sum + (product.price || 0), 0)
  const averagePrice = products.length ? totalValue / products.length : 0
  const topProducts = [...products].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 3)
  const under25k = products.filter((product) => Number(product.price || 0) <= 25000).length

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <div className="page-title">Products & Services</div>
          <div className="page-sub">Save the things your business sells often, then add them to invoices in one click.</div>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add Product or Service</Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} variant="card" className="h-32 rounded-3xl" />) : (
          <>
            <MetricCard label="Saved items" value={products.length} note="Ready for invoices" />
            <MetricCard label="Average price" value={fmt(averagePrice)} note="Across saved items" tone="success" />
            <MetricCard label="Starter-priced items" value={under25k} note="Up to ₦25,000" />
            <MetricCard label="Catalog value" value={fmt(totalValue)} note="Combined value of all items" />
          </>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="rounded-[30px]">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Your price list</h2>
              <p className="mt-1 text-sm text-neutral-500">Perfect for consultants, vendors, agencies, salons, logistics, and retail businesses.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-3 dark:bg-white/5">
                <input placeholder="Search products..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none" />
              </label>
              <select value={priceBand} onChange={(event) => setPriceBand(event.target.value)} className="rounded-2xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-800 dark:bg-white/5">
                <option value="all">All price bands</option>
                <option value="low">Up to ₦25,000</option>
                <option value="mid">₦25,001 to ₦100,000</option>
                <option value="high">Above ₦100,000</option>
              </select>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {starterCatalog.map((template) => (
              <button key={template.name} type="button" onClick={() => openTemplate(template)} className="rounded-full border border-emerald-400/12 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-emerald-400/50 hover:bg-emerald-500/8 hover:text-primary dark:bg-white/5">
                {template.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} variant="row" className="w-full rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState illustration={<Package2 className="h-14 w-14 text-primary" />} title="Add what you sell" description="Save your products and services once — reuse them on every invoice." ctaLabel="Add Product or Service" onCta={openAdd} />
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id}>
                      <td className="font-semibold text-neutral-900">{product.name}</td>
                      <td>{product.description || 'No description added'}</td>
                      <td className="font-bold text-emerald-600">{fmt(product.price)}</td>
                      <td>
                        <div className="action-row">
                          <Link to="/app/invoices/new" className="mini-action green">Use in invoice</Link>
                          <Button variant="outline" size="sm" onClick={() => openEdit(product)}>Edit</Button>
                          <Button variant="danger" size="sm" onClick={() => remove(product.id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="rounded-[30px]">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow"><Package2 className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Catalog insights</h2>
              <p className="mt-1 text-sm text-neutral-500">Your strongest and highest-priced items.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {topProducts.length === 0 ? <p className="text-sm text-neutral-500">Add items to see your top-priced products and services.</p> : topProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
                <span className="text-sm font-medium text-neutral-600">{product.name}</span>
                <strong className="text-sm font-bold text-neutral-950">{fmt(product.price)}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit product or service' : 'Add product or service'}>
        <form onSubmit={save} className="space-y-5">
          <Input label="Name *" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Description</span>
            <textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
          </label>
          <Input label="Price (₦)" type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
          <Button type="submit" fullWidth loading={saving}>{editing ? 'Save Changes' : 'Save Product or Service'}</Button>
        </form>
      </Modal>
    </div>
  )
}

Products.propTypes = { business: PropTypes.object }

function MetricCard({ label, value, note, tone = 'neutral' }) {
  const toneClasses = { neutral: 'text-neutral-950', success: 'text-primary' }
  return (
    <Card className="rounded-3xl">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <h3 className={`mt-3 text-3xl font-black tracking-tight ${toneClasses[tone]}`}>{value}</h3>
      <p className="mt-2 text-sm text-neutral-500">{note}</p>
    </Card>
  )
}

MetricCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, note: PropTypes.string.isRequired, tone: PropTypes.oneOf(['neutral', 'success']) }
