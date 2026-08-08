const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const SERVER_SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APP_URL = process.env.APP_URL || process.env.REACT_APP_APP_URL || process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  })
  : null

const planCatalog = {
  Starter: {
    priceId: process.env.STRIPE_PRICE_STARTER,
    mode: 'subscription',
  },
  Growth: {
    priceId: process.env.STRIPE_PRICE_GROWTH,
    mode: 'subscription',
  },
  Enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    mode: 'subscription',
  },
  'Setup Support': {
    priceId: process.env.STRIPE_PRICE_SETUP_SUPPORT,
    mode: 'payment',
  },
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function requireServerConfig() {
  const missing = []
  if (!SERVER_SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY')
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY')
  if (!APP_URL) missing.push('APP_URL')

  if (missing.length > 0) {
    const error = new Error(`Missing server environment variables: ${missing.join(', ')}`)
    error.statusCode = 500
    throw error
  }
}

function getServiceSupabase() {
  return createClient(SERVER_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getAuthSupabase() {
  return createClient(SERVER_SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice('Bearer '.length).trim()
}

async function requireAuthenticatedBusiness(req) {
  requireServerConfig()

  const token = getBearerToken(req)
  if (!token) {
    const error = new Error('Missing authorization token.')
    error.statusCode = 401
    throw error
  }

  const authSupabase = getAuthSupabase()
  const { data: userData, error: userError } = await authSupabase.auth.getUser(token)
  if (userError || !userData?.user) {
    const error = new Error('Invalid or expired authorization token.')
    error.statusCode = 401
    throw error
  }

  const serviceSupabase = getServiceSupabase()
  const { data: business, error: businessError } = await serviceSupabase
    .from('businesses')
    .select('*')
    .eq('user_id', userData.user.id)
    .single()

  if (businessError || !business) {
    const error = new Error('No business workspace found for this account.')
    error.statusCode = 404
    throw error
  }

  return { user: userData.user, business, serviceSupabase }
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (req.body && typeof req.body === 'string') return JSON.parse(req.body)
  const raw = await readRawBody(req)
  if (!raw) return {}
  return JSON.parse(raw)
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function getPlanConfig(planName) {
  return planCatalog[planName] || null
}

function getAppUrl(path = '') {
  const base = APP_URL?.startsWith('http') ? APP_URL : `https://${APP_URL}`
  return `${base.replace(/\/$/, '')}${path}`
}

module.exports = {
  getAppUrl,
  getPlanConfig,
  getServiceSupabase,
  readJson,
  readRawBody,
  requireAuthenticatedBusiness,
  requireServerConfig,
  sendJson,
  stripe,
}
