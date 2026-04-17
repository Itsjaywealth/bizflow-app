import React from 'react'
import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({
  session,
  business,
  children,
  requireBusiness = true,
}) {
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" state={{ from: { pathname: location.pathname, search: location.search, hash: location.hash } }} replace />
  }

  if (requireBusiness && !business) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  session: PropTypes.object,
  business: PropTypes.object,
  children: PropTypes.node.isRequired,
  requireBusiness: PropTypes.bool,
}
