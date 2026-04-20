const DANGEROUS_CSV_PREFIX = /^[=+\-@]/u

export function sanitizeCsvCell(value) {
  const normalized = String(value ?? '')
  if (!normalized) return normalized

  const trimmedLeadingWhitespace = normalized.replace(/^[\t\r ]+/u, '')
  if (DANGEROUS_CSV_PREFIX.test(trimmedLeadingWhitespace)) {
    return `'${normalized}`
  }

  return normalized
}

export function csvEscape(value) {
  return `"${sanitizeCsvCell(value).replace(/"/g, '""')}"`
}
