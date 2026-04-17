import React from 'react'
import PropTypes from 'prop-types'

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

// Lightweight loading spinner used across buttons, modals, and page states.
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  )
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
}
