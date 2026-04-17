import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppShell } from '../../context/AppShellContext'
import useDebounce from '../../hooks/useDebounce'

const RECENT_SEARCHES_KEY = 'bizflow-recent-searches'

function readRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
  } catch (_error) {
    return []
  }
}

export default function GlobalSearch() {
  const navigate = useNavigate()
  const { searchOpen, closeSearch, filteredSearchGroups, searchLoading } = useAppShell()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches())
  const debouncedQuery = useDebounce(query, 300)

  const groups = useMemo(() => filteredSearchGroups(debouncedQuery), [debouncedQuery, filteredSearchGroups])
  const flatItems = useMemo(
    () => groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.key }))),
    [groups]
  )

  useEffect(() => {
    if (!searchOpen) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [searchOpen])

  useEffect(() => {
    setActiveIndex(0)
  }, [debouncedQuery])

  function saveRecentSearch(entry) {
    if (!entry) return
    const next = [entry, ...recentSearches.filter((item) => item !== entry)].slice(0, 6)
    setRecentSearches(next)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  }

  function handleOpen(item) {
    if (!item) return
    saveRecentSearch(item.title || query)
    closeSearch()
    navigate(item.path)
  }

  function handleKeyDown(event) {
    if (!flatItems.length) {
      if (event.key === 'Escape') closeSearch()
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % flatItems.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current - 1 + flatItems.length) % flatItems.length)
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      handleOpen(flatItems[activeIndex])
    }

    if (event.key === 'Escape') {
      closeSearch()
    }
  }

  return (
    <AnimatePresence>
      {searchOpen ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[60] bg-neutral-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="global-search"
          >
            <div className="global-search__input-wrap">
              <Search className="h-5 w-5 text-neutral-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search invoices, clients, staff, settings, or quick actions"
                className="global-search__input"
              />
            </div>

            <div className="global-search__body">
              {!debouncedQuery && recentSearches.length ? (
                <div className="mb-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="rounded-full border border-emerald-400/15 bg-white/85 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary hover:text-primary dark:border-emerald-400/10 dark:bg-white/8 dark:text-neutral-200"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {searchLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-20 animate-pulse rounded-3xl bg-neutral-100 dark:bg-neutral-800" />
                  ))}
                </div>
              ) : groups.length ? (
                <div className="space-y-8">
                  {groups.map((group) => (
                    <div key={group.key}>
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-400">
                        <span>{group.icon}</span>
                        <span>{group.key}</span>
                      </p>
                      <div className="space-y-2">
                        {group.items.map((item) => {
                          const index = flatItems.findIndex((entry) => entry.id === item.id)
                          const active = activeIndex === index
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleOpen(item)}
                              className={`global-search__result ${active ? 'global-search__result--active' : ''}`}
                            >
                              <span className="min-w-0 flex-1 text-left">
                                <strong className="block truncate text-sm font-bold text-neutral-900 dark:text-white">{item.title}</strong>
                                <span className="mt-1 block text-sm text-neutral-500 dark:text-neutral-400">{item.description}</span>
                              </span>
                              <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <Search className="mb-4 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No results found</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Try searching for an invoice number, client name, staff member, or quick action.
                  </p>
                </div>
              )}
            </div>

            <div className="global-search__footer">
              <span className="flex items-center gap-2">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-2">
                <kbd><CornerDownLeft className="h-3.5 w-3.5" /></kbd>
                Open result
              </span>
              <span className="flex items-center gap-2">
                <kbd>Esc</kbd>
                Close
              </span>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
