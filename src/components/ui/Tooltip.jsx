import React, { useState } from 'react'
import PropTypes from 'prop-types'

export default function Tooltip({ content, children }) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span className="absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white shadow-modal">
          {content}
        </span>
      ) : null}
    </span>
  )
}

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
}
