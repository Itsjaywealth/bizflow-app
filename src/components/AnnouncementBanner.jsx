import React from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppShell } from '../context/AppShellContext'

const bannerStyles = {
  info: {
    wrap: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-100',
    icon: Info,
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100',
    icon: AlertTriangle,
  },
  danger: {
    wrap: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100',
    icon: AlertTriangle,
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100',
    icon: CheckCircle2,
  },
}

export default function AnnouncementBanner() {
  const navigate = useNavigate()
  const { activeAnnouncement, dismissAnnouncement } = useAppShell()

  if (!activeAnnouncement) return null

  const variant = bannerStyles[activeAnnouncement.variant] || bannerStyles.info
  const Icon = variant.icon

  return (
    <div className={`announcement-banner ${variant.wrap}`}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/10">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">{activeAnnouncement.title}</p>
          {activeAnnouncement.description ? (
            <p className="mt-1 text-sm leading-6 opacity-90">{activeAnnouncement.description}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {activeAnnouncement.cta_path ? (
          <button
            type="button"
            onClick={() => navigate(activeAnnouncement.cta_path)}
            className="rounded-full border border-current/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/60 dark:hover:bg-white/10"
          >
            {activeAnnouncement.cta_label || 'See more'}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => dismissAnnouncement(activeAnnouncement.id)}
          className="rounded-full p-2 opacity-75 transition hover:bg-white/60 hover:opacity-100 dark:hover:bg-white/10"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
