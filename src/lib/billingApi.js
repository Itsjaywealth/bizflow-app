import { supabase } from './supabase'

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data?.session?.access_token) {
    throw new Error('Please sign in again before managing billing.')
  }
  return data.session.access_token
}

async function postBillingAction(path, payload = {}) {
  const token = await getAccessToken()
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result.error || 'Billing action failed.')
  }

  return result
}

export async function startCheckout(planName) {
  const { url } = await postBillingAction('/api/create-checkout-session', { planName })
  if (!url) throw new Error('Checkout did not return a redirect URL.')
  window.location.assign(url)
}

export async function openBillingPortal() {
  const { url } = await postBillingAction('/api/create-billing-portal-session')
  if (!url) throw new Error('Billing portal did not return a redirect URL.')
  window.location.assign(url)
}
