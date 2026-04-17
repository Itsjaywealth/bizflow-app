import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  FileText,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppShell } from '../../context/AppShellContext'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'hr', label: 'HR' },
]

const notificationMeta = {
  invoice_paid: { icon: CheckCircle2, accent: 'bg-emerald-100 text-emerald-600' },
  invoice_overdue: { icon: AlertCircle, accent: 'bg-red-100 text-red-600' },
  new_client: { icon: Users, accent: 'bg-blue-100 text-blue-600' },
  payroll_processed: { icon: CreditCard, accent: 'bg-violet-100 text-violet-600' },
  leave_approved: { icon: CheckCircle2, accent: 'bg-emerald-100 text-emerald-600' },
  leave_rejected: { icon: XCircle, accent: 'bg-red-100 text-red-600' },
  new_team_member: { icon: UserPlus, accent: 'bg-sky-100 text-sky-600' },
  system_alert: { icon: BriefcaseBusiness, accent: 'bg-neutral-200 text-neutral-700' },
}

function timeAgo(dateString) {
  const value = new Date(dateString)
  const diffMs = Date.now() - value.getTime()
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)))
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function NotificationRow({ item, onOpen, onDismiss }) {
  const [touchStart, setTouchStart] = useState(null)
  const meta = notificationMeta[item.type] || { icon: Bell, accent: 'bg-neutral-200 text-neutral-700' }
  const Icon = meta.icon

  function handleTouchEnd(event) {
    if (touchStart === null) return
    const delta = event.changedTouches[0].clientX - touchStart
    if (delta < -72) onDismiss(item.id)
    setTouchStart(null)
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      onTouchStart={(event) => setTouchStart(event.changedTouches[0].clientX)}
      onTouchEnd={handleTouchEnd}
      className={`notification-center__item ${item.is_read ? 'notification-center__item--read' : ''}`}
    >
      <span className={`notification-center__icon ${meta.accent}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center justify-between gap-3">
          <strong className="truncate text-sm font-bold text-neutral-900 dark:text-white">{item.title}</strong>
          <span className="shrink-0 text-xs font-medium text-neutral-400">{timeAgo(item.created_at)}</span>
        </span>
        <span className="mt-1 block text-sm leading-6 text-neutral-500 dark:text-neutral-300">{item.description}</span>
      </span>
    </button>
  )
}

NotificationRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    created_at: PropTypes.string,
    is_read: PropTypes.bool,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
}

export default function NotificationCenter() {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    notificationsLoading,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
  } = useAppShell()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications
    if (filter === 'unread') return notifications.filter((item) => !item.is_read)
    return notifications.filter((item) => item.category === filter)
  }, [filter, notifications])

  async function handleOpenNotification(item) {
    if (!item.is_read) await markNotificationRead(item.id)
    setOpen(false)
    if (item.link_path) navigate(item.link_path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative rounded-2xl border border-neutral-200 bg-white p-3 text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="notification-center__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-neutral-950/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
              className="notification-center"
            >
              <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-5 dark:border-neutral-800">
                <div>
                  <h2 className="text-lg font-black text-neutral-950 dark:text-white">Notifications</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Stay on top of invoices, payroll, HR, and system updates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  Mark all as read
                </button>
              </div>

              <div className="notification-center__tabs">
                {FILTERS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    className={`notification-center__tab ${filter === item.key ? 'notification-center__tab--active' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                {notificationsLoading ? (
                  <div className="space-y-3 py-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-24 animate-pulse rounded-3xl bg-neutral-100 dark:bg-neutral-800" />
                    ))}
                  </div>
                ) : filtered.length ? (
                  <div className="space-y-3 py-4">
                    {filtered.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onOpen={handleOpenNotification}
                        onDismiss={dismissNotification}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
                    <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-7 w-7" />
                    </span>
                    <h3 className="text-lg font-bold text-neutral-950 dark:text-white">No notifications here yet</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                      We’ll show invoice, payroll, HR, and system updates here as soon as they happen.
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
