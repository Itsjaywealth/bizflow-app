const {
  getServiceSupabase,
  readJson,
  requireAuthenticatedBusiness,
  requireServerConfig,
  sendJson,
} = require('./_billing')

function normalizeMethod(method) {
  const value = String(method || '').trim().toLowerCase()
  if (['transfer', 'cash', 'card', 'cheque', 'pos', 'other'].includes(value)) return value
  return 'other'
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  try {
    requireServerConfig()

    const { invoiceId, amount, method, reference, note } = await readJson(req)

    if (!invoiceId) {
      return sendJson(res, 400, { error: 'Missing invoiceId.' })
    }

    const paidAmount = Number(amount)
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return sendJson(res, 400, { error: 'Amount must be a positive number.' })
    }

    const { business, serviceSupabase } = await requireAuthenticatedBusiness(req)

    const { data: invoice, error: invoiceError } = await serviceSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('business_id', business.id)
      .single()

    if (invoiceError || !invoice) {
      return sendJson(res, 404, { error: 'Invoice not found for this business.' })
    }

    if (invoice.status === 'paid') {
      return sendJson(res, 400, { error: 'Invoice is already fully paid.' })
    }

    const history = Array.isArray(invoice.payment_history) ? invoice.payment_history : []
    const previouslyPaid = Number(invoice.amount_paid || 0)
    const total = Number(invoice.total || 0)
    const now = new Date().toISOString()

    const paymentRecord = {
      amount: paidAmount,
      method: normalizeMethod(method),
      reference: String(reference || '').trim(),
      note: String(note || '').trim(),
      recorded_at: now,
      recorded_by: business.id,
    }

    const amountPaid = previouslyPaid + paidAmount
    const balance = Math.max(total - amountPaid, 0)
    const nextStatus = balance <= 0 ? 'paid' : 'partial'

    const { error: updateError } = await serviceSupabase
      .from('invoices')
      .update({
        amount_paid: amountPaid,
        payment_history: [...history, paymentRecord],
        status: nextStatus,
        updated_at: now,
      })
      .eq('id', invoiceId)
      .eq('business_id', business.id)

    if (updateError) {
      return sendJson(res, 500, { error: 'Unable to record the payment.' })
    }

    return sendJson(res, 200, {
      ok: true,
      status: nextStatus,
      amount_paid: amountPaid,
      balance,
    })
  } catch (error) {
    console.error('reconciliation failed:', error)
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Reconciliation failed.' })
  }
}