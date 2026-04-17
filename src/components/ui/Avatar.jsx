import React from 'react'
import PropTypes from 'prop-types'

function getInitials(name) {
  if (!name) return 'BF'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Avatar({ name, src, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-14 w-14 text-base',
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    )
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${sizeClasses[size]} ${className}`}
      aria-label={name || 'Avatar'}
    >
      {getInitials(name)}
    </span>
  )
}

Avatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
}
