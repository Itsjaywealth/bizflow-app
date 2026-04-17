export function formatCurrency(value, currency = 'NGN') {
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

export function getPaidAmount(invoice) {
  return Number(invoice?.amount_paid ?? (invoice?.status === 'paid' ? invoice?.total : 0) ?? 0)
}

export function getBalance(invoice) {
  return Math.max(Number(invoice?.total || 0) - getPaidAmount(invoice), 0)
}

export function getClientName(invoice) {
  return invoice?.clients?.name || invoice?.client_snapshot?.name || 'Unassigned client'
}

export function generateInvoiceNumber(existingInvoices = []) {
  const year = new Date().getFullYear()
  return `INV-${year}-${String(existingInvoices.length + 1).padStart(4, '0')}`
}

export function buildBusinessSnapshot(business) {
  return {
    name: business?.name || '',
    email: business?.email || '',
    phone: business?.phone || '',
    address: business?.address || '',
    logo_url: business?.logo_url || '',
    bank_name: business?.bank_name || '',
    account_name: business?.account_name || '',
    account_number: business?.account_number || '',
    payment_link: business?.payment_link || '',
  }
}

export function buildClientSnapshot(client) {
  return {
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
  }
}

export function buildPublicInvoiceUrl(invoice) {
  if (!invoice?.public_token) return ''
  return `${window.location.origin}/invoice/${invoice.public_token}`
}

export function buildPaymentLink(invoice, business) {
  const fallback = buildPublicInvoiceUrl(invoice)
  if (!business?.payment_link) return fallback

  try {
    const url = new URL(business.payment_link)
    url.searchParams.set('amount', String(Math.round(Number(invoice?.total || 0) * 100)))
    url.searchParams.set('reference', invoice?.invoice_number || `bizflow-${Date.now()}`)
    url.searchParams.set('email', invoice?.client_snapshot?.email || invoice?.clients?.email || business?.email || '')
    return url.toString()
  } catch (_error) {
    return business?.payment_link || fallback
  }
}

export function statusVariant(status) {
  if (status === 'paid') return 'success'
  if (status === 'overdue') return 'danger'
  if (status === 'pending' || status === 'partial' || status === 'sent') return 'warning'
  if (status === 'draft') return 'neutral'
  return 'info'
}

export function makeQrMatrix(source = '') {
  const size = 21
  let seed = 0
  for (let index = 0; index < source.length; index += 1) {
    seed = (seed * 31 + source.charCodeAt(index)) % 2147483647
  }

  return Array.from({ length: size * size }).map((_, index) => {
    const row = Math.floor(index / size)
    const col = index % size
    const finder =
      ((row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7)) &&
      !((row > 1 && row < 5 && col > 1 && col < 5))
    const coreFinder =
      ((row > 1 && row < 5 && col > 1 && col < 5) ||
        (row > 1 && row < 5 && col > size - 6 && col < size - 2) ||
        (row > size - 6 && row < size - 2 && col > 1 && col < 5))

    if (finder) return true
    if (coreFinder) return true

    const value = (seed + row * 17 + col * 29 + row * col) % 7
    return value < 3
  })
}

export async function exportInvoicePdf(previewElement, fileName = 'invoice.pdf') {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(previewElement, {
    scale: 2,
    backgroundColor: '#ffffff',
  })

  const imageData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = (canvas.height * pageWidth) / canvas.width
  pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight)
  pdf.save(fileName)
}
