import React, { useEffect, useState } from 'react'

function getInitialTheme() {
  const saved = localStorage.getItem('bizflow-theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const nextTheme = getInitialTheme()
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('bizflow-theme', nextTheme)
    document.documentElement.dataset.theme = nextTheme
  }

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
      {!compact && <strong>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</strong>}
    </button>
  )
}
