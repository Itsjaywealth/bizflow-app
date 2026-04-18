function readBooleanFlag(value, fallback = false) {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return fallback
}

export const ENABLE_GOOGLE_AUTH = readBooleanFlag(
  process.env.REACT_APP_ENABLE_GOOGLE_AUTH,
  process.env.NODE_ENV !== 'production'
)
