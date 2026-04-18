import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpenText, Bug, HelpCircle, Mail, MessageCircle, PlayCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSupportMailto } from '../../lib/support'

const LINKS = [
  { label: 'Documentation', icon: BookOpenText, action: 'docs' },
  { label: 'Live Chat', icon: MessageCircle, action: 'chat' },
  { label: 'Video Tutorials', icon: PlayCircle, action: 'videos' },
  { label: 'Email Support', icon: Mail, action: 'email' },
  { label: 'Report a Bug', icon: Bug, action: 'bug' },
]

export default function HelpSupportWidget() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleAction(action) {
    if (action === 'docs') {
      navigate('/support')
    } else if (action === 'chat') {
      if (window.$crisp?.push) {
        window.$crisp.push(['do', 'chat:open'])
      } else if (window.Intercom) {
        window.Intercom('show')
      } else {
        window.open(getSupportMailto('BizFlow NG Live Chat Request'), '_self')
      }
    } else if (action === 'videos') {
      window.open('https://www.youtube.com/results?search_query=BizFlow+NG+tutorials', '_blank', 'noopener,noreferrer')
    } else if (action === 'email') {
      window.open(getSupportMailto(), '_self')
    } else if (action === 'bug') {
      window.open(getSupportMailto('BizFlow NG Bug Report'), '_self')
    }

    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="help-widget__menu"
          >
            {LINKS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleAction(item.action)}
                  className="help-widget__item"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="help-widget__trigger"
        aria-label="Open help and support"
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>
    </div>
  )
}
