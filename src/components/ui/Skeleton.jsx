import React from 'react'
import PropTypes from 'prop-types'

const variantClasses = {
  line: 'h-4 rounded-md',
  card: 'h-32 rounded-2xl',
  row: 'h-12 rounded-xl',
}

export default function Skeleton({ variant = 'line', className = '' }) {
  return (
    <div className={`animate-pulse bg-neutral-200 ${variantClasses[variant]} ${className}`} aria-hidden="true" />
  )
}

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['line', 'card', 'row']),
  className: PropTypes.string,
}
