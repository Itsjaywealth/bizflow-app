export function getClientName(client) {
  return client?.name || client?.full_name || 'Unnamed client'
}

export function getClientBusiness(client) {
  return client?.company_name || client?.business_name || client?.organization || 'Independent client'
}

export function getClientStatus(client) {
  return client?.status || 'active'
}

export function getClientAddress(client) {
  const parts = [
    client?.address,
    client?.city,
    client?.state,
    client?.country,
  ].filter(Boolean)
  return parts.join(', ')
}

export function getClientTags(client) {
  return Array.isArray(client?.tags) ? client.tags : []
}

export function clientAvatarTone(value = '') {
  const tones = [
    'bg-primary/10 text-primary',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-violet-100 text-violet-600',
    'bg-pink-100 text-pink-600',
  ]

  const seed = value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return tones[seed % tones.length]
}

export function formatClientCurrency(value, currency = 'NGN') {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  } catch (_error) {
    return `₦${Number(value || 0).toLocaleString()}`
  }
}

export function buildClientStats(client, invoices = []) {
  const records = invoices.filter((invoice) => invoice.client_id === client.id)
  const totalInvoiced = records.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0)
  const totalPaid = records.reduce((sum, invoice) => sum + Number(invoice.amount_paid ?? (invoice.status === 'paid' ? invoice.total : 0) ?? 0), 0)
  const outstanding = records
    .filter((invoice) => invoice.status !== 'cancelled')
    .reduce((sum, invoice) => sum + Math.max(Number(invoice.total || 0) - Number(invoice.amount_paid ?? (invoice.status === 'paid' ? invoice.total : 0) ?? 0), 0), 0)

  return {
    records,
    totalInvoiced,
    totalPaid,
    outstanding,
    lastActivity: records[0]?.updated_at || records[0]?.created_at || client.updated_at || client.created_at || null,
  }
}

export function buildRichClientPayload(values, businessId) {
  return {
    business_id: businessId,
    name: values.name,
    company_name: values.company_name || null,
    client_type: values.client_type || 'Individual',
    status: values.status || 'active',
    email: values.email || null,
    phone: values.phone || null,
    whatsapp_number: values.whatsapp_number || null,
    address: values.address || null,
    city: values.city || null,
    state: values.state || null,
    country: values.country || null,
    postal_code: values.postal_code || null,
    currency_preference: values.currency_preference || 'NGN',
    payment_terms: values.payment_terms || 'Net 7',
    credit_limit: Number(values.credit_limit || 0) || null,
    notes: values.notes || null,
    tags: values.tags || [],
    last_activity_at: new Date().toISOString(),
  }
}

export function buildCoreClientPayload(values, businessId) {
  return {
    business_id: businessId,
    name: values.name,
    email: values.email || null,
    phone: values.phone || null,
    address: [values.address, values.city, values.state, values.country].filter(Boolean).join(', ') || null,
  }
}

