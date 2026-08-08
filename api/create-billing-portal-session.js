const {
  getAppUrl,
  requireAuthenticatedBusiness,
  sendJson,
  stripe,
} = require('./_billing')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  try {
    const { business } = await requireAuthenticatedBusiness(req)
    const customerId = business.billing_settings?.stripe_customer_id

    if (!customerId) {
      return sendJson(res, 409, { error: 'No Stripe customer exists for this workspace yet.' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getAppUrl('/app/billing'),
    })

    return sendJson(res, 200, { url: session.url })
  } catch (error) {
    console.error('create-billing-portal-session failed:', error)
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Unable to open billing portal.' })
  }
}
