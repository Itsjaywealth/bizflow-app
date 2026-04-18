export const SUPPORT_EMAIL = 'hello@bizflowng.com'

export function getSupportMailto(subject = '') {
  if (!subject) return `mailto:${SUPPORT_EMAIL}`
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
}
