import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

export default function Dropdown({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((value) => !value)}>
        {trigger}
      </button>
      {open ? (
        <div
          className={`absolute top-full z-40 mt-2 min-w-[220px] rounded-2xl border border-emerald-400/15 bg-white/92 p-2 shadow-modal backdrop-blur-xl dark:border-emerald-400/10 dark:bg-white/8 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false)
                item.onClick?.()
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-primary/10 hover:text-primary dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func,
    })
  ).isRequired,
  align: PropTypes.oneOf(['left', 'right']),
}
