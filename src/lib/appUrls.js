export const DEFAULT_SITE_URL = 'https://bizflowng.com'
export const DEFAULT_APP_PATH = '/app/dashboard'

export function getSafeNextPath(nextPath) {
  if (!nextPath || typeof nextPath !== 'string') return DEFAULT_APP_PATH
  if (!nextPath.startsWith('/')) return DEFAULT_APP_PATH
  if (nextPath.startsWith('//')) return DEFAULT_APP_PATH
  return nextPath
}

export function getSiteUrl() {
  const configured =
    process.env.REACT_APP_SITE_URL?.trim()
    || process.env.REACT_APP_PUBLIC_APP_URL?.trim()

  if (configured) return configured.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return DEFAULT_SITE_URL
}

export function buildAbsoluteUrl(path = '/') {
  if (!path) return getSiteUrl()
  if (path.startsWith('http')) return path
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

export function getAuthCallbackUrl(nextPath = DEFAULT_APP_PATH) {
  const redirectUrl = new URL('/auth/callback', getSiteUrl())
  redirectUrl.searchParams.set('next', getSafeNextPath(nextPath))
  return redirectUrl.toString()
}

export function getPasswordResetUrl() {
  return buildAbsoluteUrl('/reset-password')
}

export function getEmailVerificationReturnUrl() {
  return buildAbsoluteUrl('/login?verified=1')
}
