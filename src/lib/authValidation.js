import { z } from 'zod'

export const passwordRuleLabels = {
  minLength: '8+ characters',
  uppercase: 'Uppercase letter',
  number: 'Number',
  symbol: 'Symbol',
}

export function getPasswordRules(value = '') {
  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  }
}

export function getPasswordStrengthMeta(rules) {
  const passedCount = Object.values(rules).filter(Boolean).length
  if (passedCount <= 1) return { label: 'Weak', tone: 'bg-red-500', text: 'text-red-500', width: 'w-1/3' }
  if (passedCount <= 3) return { label: 'Fair', tone: 'bg-amber-400', text: 'text-amber-500', width: 'w-2/3' }
  return { label: 'Strong', tone: 'bg-emerald-500', text: 'text-emerald-600', width: 'w-full' }
}

export const securePasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((value) => /[A-Z]/.test(value), 'Password must include at least one uppercase letter')
  .refine((value) => /\d/.test(value), 'Password must include at least one number')
  .refine((value) => /[^A-Za-z0-9]/.test(value), 'Password must include at least one symbol')
