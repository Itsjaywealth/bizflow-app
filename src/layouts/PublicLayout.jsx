import React from 'react'
import PropTypes from 'prop-types'

export default function PublicLayout({ children }) {
  return <div className="brand-app-shell min-h-screen bg-background text-neutral-900 dark:bg-darkbg dark:text-neutral-100">{children}</div>
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
}
