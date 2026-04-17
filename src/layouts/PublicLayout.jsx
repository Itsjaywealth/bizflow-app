import React from 'react'
import PropTypes from 'prop-types'

export default function PublicLayout({ children }) {
  return <div className="min-h-screen bg-background text-neutral-900">{children}</div>
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
}
