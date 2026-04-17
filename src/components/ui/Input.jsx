import React from 'react'
import PropTypes from 'prop-types'

// Form input with support for labels, validation, and optional icons.
export default function Input({
  id,
  name,
  label,
  error,
  helperText,
  prefixIcon = null,
  suffixIcon = null,
  className = '',
  ...props
}) {
  return (
    <label htmlFor={id || name} className="block space-y-2">
      {label ? (
        <span className="text-sm font-semibold text-neutral-700">{label}</span>
      ) : null}
      <span
        className={[
          'flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition-colors',
          error ? 'border-danger' : 'border-neutral-200 focus-within:border-primary',
          className,
        ].join(' ').trim()}
      >
        {prefixIcon ? <span className="text-neutral-400">{prefixIcon}</span> : null}
        <input
          id={id || name}
          name={name}
          className="w-full border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
          {...props}
        />
        {suffixIcon ? <span className="text-neutral-400">{suffixIcon}</span> : null}
      </span>
      {error ? (
        <span className="block text-sm font-medium text-danger">{error}</span>
      ) : helperText ? (
        <span className="block text-sm text-neutral-500">{helperText}</span>
      ) : null}
    </label>
  )
}

Input.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  prefixIcon: PropTypes.node,
  suffixIcon: PropTypes.node,
  className: PropTypes.string,
}
