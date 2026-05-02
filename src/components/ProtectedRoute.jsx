import React from 'react'
import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'
import { isEmailVerified } from '../lib/authState'

const ONBOARDING_BUSINESS_READY_KEY = 'bizflow-onboarding-business-ready'
const ONBOARDING_BUSINESS_READY_WINDOW_MS = 12000

function hasRecentOnboardingBusinessFlag() {
  if (typeof window === 'undefined') return false

  const raw = window.sessionStorage?.getItem(ONBOARDING_BUSINESS_READY_KEY)
  if (!raw) return false

  try {
    const parsed = JSON.parse(raw)
    const createdAt = Number(parsed?.at || 0)

    if (!createdAt || Date.now() - createdAt > ONBOARDING_BUSINESS_READY_WINDOW_MS) {
      window.sessionStorage?.removeItem(ONBOARDING_BUSINESS_READY_KEY)
      return false
    }

    return true
  } catch {
    window.sessionStorage?.removeItem(ONBOARDING_BUSINESS_READY_KEY)
    return false
  }
}

export default function ProtectedRoute({
  session,
  business,
  children,
  requireBusiness = true,
  loading = false,
}) {
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 text-center shadow-card dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Loading BizFlow NG...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }} replace />
  }

  if (!isEmailVerified(session.user)) {
    return <Navigate to="/verify-email" replace />
  }

  if (requireBusiness && !business) {
    if (hasRecentOnboardingBusinessFlag()) {
      return (
        <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-neutral-200 bg-white px-6 text-center shadow-card dark:border-white/10 dark:bg-white/[0.04]">
          <div className="max-w-md space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Finishing setup</p>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">We&apos;re preparing your workspace.</h2>
            <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-300">
              Your business details just saved. We&apos;re syncing the dashboard now so you don&apos;t get sent back into onboarding.
            </p>
          </div>
        </div>
      )
    }

    return <Navigate to="/onboarding" replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  session: PropTypes.object,
  business: PropTypes.object,
  children: PropTypes.node.isRequired,
  requireBusiness: PropTypes.bool,
  loading: PropTypes.bool,
}
