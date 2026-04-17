import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import Spinner from './Spinner'

const variantClasses = {
  primary: 'bg-brand-gradient text-white shadow-glow hover:brightness-110 focus-visible:ring-primary dark:text-white',
  secondary: 'bg-darkbg-card text-white shadow-card hover:bg-darkbg-hover focus-visible:ring-brand-glow dark:bg-darkbg-hover',
  outline: 'border border-primary/30 bg-white text-neutral-900 hover:bg-primary/10 hover:text-primary focus-visible:ring-primary dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
  ghost: 'bg-transparent text-neutral-700 hover:bg-primary/10 hover:text-primary focus-visible:ring-primary dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white',
  danger: 'bg-danger text-white shadow-card hover:bg-red-600 focus-visible:ring-danger',
}

const sizeClasses = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

// Shared button component for primary and utility actions.
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      whileHover={isDisabled ? undefined : { y: -1 }}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'ring-offset-background disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ').trim()}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </motion.button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
}
