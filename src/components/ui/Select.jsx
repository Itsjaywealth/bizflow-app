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
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const ref = useRef(null)
  const searchInputRef = useRef(null)
  const listboxId = useRef(`select-listbox-${Math.random().toString(36).slice(2, 9)}`)

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

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    const selectedIndex = filteredOptions.findIndex((option) => option.value === value)
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)

    if (searchable) {
      window.requestAnimationFrame(() => {
        searchInputRef.current?.focus()
      })
    }
  }, [filteredOptions, open, searchable, value])

  function selectOption(optionValue) {
    onChange(optionValue)
    setOpen(false)
    setQuery('')
  }

  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  function handleListKeyDown(event) {
    if (!filteredOptions.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((current) => Math.min(current + 1, filteredOptions.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((current) => Math.max(current - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const option = filteredOptions[highlightedIndex]
      if (option) {
        selectOption(option.value)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div className="space-y-2" ref={ref}>
      {label ? <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-100">{label}</label> : null}
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId.current}
        aria-invalid={Boolean(error)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white/90 px-4 py-3 text-left shadow-sm backdrop-blur transition-all duration-300 dark:bg-white/5 ${
          error ? 'border-danger' : 'border-neutral-200 dark:border-emerald-400/10'
        }`}
      >
        <span className={selected ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-neutral-400 dark:text-neutral-300" />
      </button>
      {error ? <p className="text-sm font-medium text-danger">{error}</p> : null}
      {open ? (
        <div
          id={listboxId.current}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="rounded-2xl border border-emerald-400/15 bg-white/94 p-3 shadow-modal backdrop-blur-xl dark:border-emerald-400/10 dark:bg-white/8"
        >
          {searchable ? (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-400/12 px-3 py-2">
              <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-300" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleListKeyDown}
                placeholder="Search options"
                className="w-full border-0 bg-transparent text-sm outline-none dark:text-white"
              />
            </div>
          ) : null}
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => selectOption(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                  index === highlightedIndex
                    ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                    : 'text-neutral-700 hover:bg-primary/10 hover:text-primary dark:text-neutral-100 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
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
