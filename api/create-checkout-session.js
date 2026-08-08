const {
  getAppUrl,
  getPlanConfig,
  readJson,
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
    const { planName } = await readJson(req)
    const plan = getPlanConfig(planName)

    if (!plan?.priceId) {
      return sendJson(res, 400, { error: `No Stripe price configured for ${planName || 'this plan'}.` })
    }

    const { user, business, serviceSupabase } = await requireAuthenticatedBusiness(req)
    const billingSettings = business.billing_settings || {}
    let customerId = billingSettings.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: business.name || user.user_metadata?.full_name || user.email,
        metadata: {
          business_id: business.id,
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      customer: customerId,
      client_reference_id: business.id,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: getAppUrl('/app/billing?checkout=success'),
      cancel_url: getAppUrl('/app/billing?checkout=cancelled'),
      allow_promotion_codes: true,
      metadata: {
        business_id: business.id,
        user_id: user.id,
        plan_name: planName,
      },
      subscription_data: plan.mode === 'subscription'
        ? {
          metadata: {
            business_id: business.id,
            user_id: user.id,
            plan_name: planName,
          },
        }
        : undefined,
    })

    await serviceSupabase
      .from('businesses')
      .update({
        billing_settings: {
          ...billingSettings,
          stripe_customer_id: customerId,
          pending_plan: planName,
          status: 'Checkout started',
        },
      })
      .eq('id', business.id)

    return sendJson(res, 200, { url: session.url })
  } catch (error) {
    console.error('create-checkout-session failed:', error)
    return sendJson(res, error.statusCode || 500, { error: error.message || 'Unable to start checkout.' })
  }
}
