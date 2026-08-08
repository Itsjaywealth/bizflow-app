const {
  getServiceSupabase,
  readRawBody,
  requireServerConfig,
  sendJson,
  stripe,
} = require('./_billing')

async function getBusiness(serviceSupabase, businessId) {
  const { data, error } = await serviceSupabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (error) throw error
  return data
}

async function applyCheckoutCompleted(session) {
  const businessId = session.metadata?.business_id
  const planName = session.metadata?.plan_name
  if (!businessId || !planName) return

  const serviceSupabase = getServiceSupabase()
  const business = await getBusiness(serviceSupabase, businessId)
  const billingSettings = business.billing_settings || {}
  let renewalDate = business.renewal_date

  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    renewalDate = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : renewalDate
  }

  const nextBillingSettings = {
    ...billingSettings,
    cancel_requested: false,
    pending_plan: null,
    status: session.mode === 'subscription' ? 'Active' : 'Paid',
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription || billingSettings.stripe_subscription_id || null,
    last_checkout_session_id: session.id,
    last_payment_status: session.payment_status,
    last_paid_at: new Date().toISOString(),
  }

  await serviceSupabase
    .from('businesses')
    .update({
      subscription_plan: planName,
      renewal_date: renewalDate,
      billing_settings: nextBillingSettings,
    })
    .eq('id', businessId)

  await serviceSupabase.from('billing_history').insert({
    business_id: businessId,
    amount: (session.amount_total || 0) / 100,
    plan_name: planName,
    receipt_reference: session.id,
  })
}

async function applySubscriptionDeleted(subscription) {
  const businessId = subscription.metadata?.business_id
  if (!businessId) return

  const serviceSupabase = getServiceSupabase()
  const business = await getBusiness(serviceSupabase, businessId)

  await serviceSupabase
    .from('businesses')
    .update({
      billing_settings: {
        ...(business.billing_settings || {}),
        status: 'Cancelled',
        cancel_requested: false,
        stripe_subscription_id: subscription.id,
        cancelled_at: new Date().toISOString(),
      },
    })
    .eq('id', businessId)
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }

  try {
    requireServerConfig()
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return sendJson(res, 500, { error: 'Missing STRIPE_WEBHOOK_SECRET.' })
    }

    const body = await readRawBody(req)
    const signature = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    if (event.type === 'checkout.session.completed') {
      await applyCheckoutCompleted(event.data.object)
    }

    if (event.type === 'customer.subscription.deleted') {
      await applySubscriptionDeleted(event.data.object)
    }

    return sendJson(res, 200, { received: true })
  } catch (error) {
    console.error('stripe-webhook failed:', error)
    return sendJson(res, error.statusCode || 400, { error: error.message || 'Webhook failed.' })
  }
}

module.exports.config = {
  api: {
    bodyParser: false,
  },
}
