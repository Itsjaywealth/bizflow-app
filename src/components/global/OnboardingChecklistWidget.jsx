import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Circle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppShell } from '../../context/AppShellContext'

export default function OnboardingChecklistWidget() {
  const navigate = useNavigate()
  const { checklist } = useAppShell()

  if (!checklist?.isNewUser || checklist.dismissed || checklist.completedCount === checklist.items.length) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="checklist-widget"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-neutral-950 dark:text-white">Get started with BizFlow NG</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {checklist.completedCount}/{checklist.items.length} completed
            </p>
          </div>
          <button
            type="button"
            onClick={checklist.dismissChecklist}
            className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Dismiss onboarding checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(checklist.completedCount / checklist.items.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {checklist.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className="checklist-widget__item"
            >
              <span className="mt-0.5 shrink-0">
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-neutral-400" />
                )}
              </span>
              <span className={`text-sm ${item.completed ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-200'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
