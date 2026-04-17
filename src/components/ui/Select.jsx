import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Check, ChevronDown, Search } from 'lucide-react'

export default function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  searchable = true,
  error,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  const selected = options.find((option) => option.value === value)

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    )
  }, [options, query])

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
    <div className="space-y-2" ref={ref}>
      {label ? <label className="text-sm font-semibold text-neutral-700">{label}</label> : null}
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left shadow-sm ${
          error ? 'border-danger' : 'border-neutral-200'
        }`}
      >
        <span className={selected ? 'text-neutral-900' : 'text-neutral-400'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-neutral-400" />
      </button>
      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
      {open ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-modal">
          {searchable ? (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search options"
                className="w-full border-0 bg-transparent text-sm outline-none"
              />
            </div>
          ) : null}
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                  setQuery('')
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                <span>{option.label}</span>
                {option.value === value ? <Check className="h-4 w-4 text-primary" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

Select.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  searchable: PropTypes.bool,
  error: PropTypes.string,
}
