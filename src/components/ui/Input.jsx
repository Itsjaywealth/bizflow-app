import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

// Form input with support for labels, validation, and optional icons.
const Input = forwardRef(function Input({
  id,
  name,
  label,
  error,
  helperText,
  prefixIcon = null,
  suffixIcon = null,
  className = '',
  ...props
}, ref) {
  return (
    <label htmlFor={id || name} className="block space-y-2">
      {label ? (
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">{label}</span>
      ) : null}
      <span
        className={[
          'flex items-center gap-3 rounded-xl border bg-white/90 px-4 py-3 shadow-sm backdrop-blur transition-all duration-300 dark:bg-white/5',
          error
            ? 'border-danger'
            : 'border-neutral-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 dark:border-brand-glow/10',
          className,
        ].join(' ').trim()}
      >
        {prefixIcon ? <span className="text-neutral-400 dark:text-neutral-300">{prefixIcon}</span> : null}
        <input
          id={id || name}
          name={name}
          ref={ref}
          aria-invalid={Boolean(error)}
          className="w-full border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-neutral-400"
          {...props}
        />
        {suffixIcon ? <span className="text-neutral-400 dark:text-neutral-300">{suffixIcon}</span> : null}
      </span>
      {error ? (
        <span className="block text-sm font-medium text-danger">{error}</span>
      ) : helperText ? (
        <span className="block text-sm text-neutral-500 dark:text-neutral-300">{helperText}</span>
      ) : null}
    </label>
  )
})

export default Input

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
