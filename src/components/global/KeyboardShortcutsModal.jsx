import React from 'react'
import { Keyboard } from 'lucide-react'
import Modal from '../ui/Modal'
import { useAppShell } from '../../context/AppShellContext'

const shortcuts = [
  ['Cmd/Ctrl + K', 'Open global search'],
  ['Cmd/Ctrl + N', 'Create a new invoice'],
  ['Cmd/Ctrl + Shift + C', 'Add a client'],
  ['G then D', 'Go to Dashboard'],
  ['G then I', 'Go to Invoices'],
  ['G then C', 'Go to Clients'],
  ['?', 'Show keyboard shortcuts'],
]

export default function KeyboardShortcutsModal() {
  const { shortcutsOpen, closeShortcuts } = useAppShell()

  return (
    <Modal open={shortcutsOpen} onClose={closeShortcuts} title="Keyboard shortcuts">
      <div className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map(([keys, description]) => (
          <div
            key={keys}
            className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/70"
          >
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Keyboard className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Shortcut</span>
            </div>
            <p className="text-sm font-black text-neutral-950 dark:text-white">{keys}</p>
            <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{description}</p>
          </div>
        ))}
      </div>
    </Modal>
  )
}
