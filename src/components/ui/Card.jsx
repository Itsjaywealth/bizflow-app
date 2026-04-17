import React from 'react'
import PropTypes from 'prop-types'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={[
        'rounded-2xl border border-neutral-200 bg-white p-6 shadow-card transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900',
        hover ? 'hover:-translate-y-0.5 hover:shadow-modal' : '',
        className,
      ].join(' ').trim()}
      {...props}
    >
      {children}
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
}
