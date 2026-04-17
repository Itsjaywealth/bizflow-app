import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppShell } from '../../context/AppShellContext'
import GlobalSearch from '../search/GlobalSearch'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import HelpSupportWidget from './HelpSupportWidget'
import OnboardingChecklistWidget from './OnboardingChecklistWidget'

export default function AppShellOverlays() {
  const navigate = useNavigate()
  const { openSearch, openShortcuts, searchOpen, shortcutsOpen } = useAppShell()
  const sequenceRef = useRef([])

  useEffect(() => {
    function handleKeyDown(event) {
      const tagName = event.target?.tagName?.toLowerCase()
      const editable = event.target?.isContentEditable || ['input', 'textarea', 'select'].includes(tagName)

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openSearch()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        navigate('/app/invoices/new')
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        navigate('/app/clients?create=1')
        return
      }

      if (!editable && event.key === '?') {
        event.preventDefault()
        openShortcuts()
        return
      }

      if (editable || searchOpen || shortcutsOpen) return

      const key = event.key.toLowerCase()
      const next = [...sequenceRef.current, key].slice(-2)
      sequenceRef.current = next

      if (next[0] === 'g' && next[1] === 'd') {
        navigate('/app/dashboard')
        sequenceRef.current = []
      }

      if (next[0] === 'g' && next[1] === 'i') {
        navigate('/app/invoices')
        sequenceRef.current = []
      }

      if (next[0] === 'g' && next[1] === 'c') {
        navigate('/app/clients')
        sequenceRef.current = []
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, openSearch, openShortcuts, searchOpen, shortcutsOpen])

  return (
    <>
      <GlobalSearch />
      <KeyboardShortcutsModal />
      <OnboardingChecklistWidget />
      <HelpSupportWidget />
    </>
  )
}
