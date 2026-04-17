import React from 'react'
import PropTypes from 'prop-types'
import { LogOut, Menu, MoonStar, Search, Settings, SunMedium, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Dropdown from '../ui/Dropdown'
import NotificationCenter from '../notifications/NotificationCenter'
import { useAppShell } from '../../context/AppShellContext'

const titleMap = {
  '/app/dashboard': 'Dashboard',
  '/app/invoices': 'Invoices',
  '/app/clients': 'Clients',
  '/app/staff': 'Staff & HR',
  '/app/payroll': 'Payroll',
  '/app/products': 'Products',
  '/app/expenses': 'Expenses',
  '/app/reports': 'Reports',
  '/app/settings': 'Settings',
  '/app/billing': 'Billing',
  '/onboarding': 'Onboarding',
}

function getPageTitle(pathname) {
  const match = Object.keys(titleMap).find((route) => pathname.startsWith(route))
  return match ? titleMap[match] : 'BizFlow NG'
}

export default function Topbar({ onOpenMobileMenu, onLogout, user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { openSearch, theme, toggleTheme, openShortcuts } = useAppShell()

  return (
    <header className="sticky top-0 z-20 border-b border-emerald-400/10 bg-white/72 backdrop-blur-xl transition-colors duration-300 dark:border-emerald-400/10 dark:bg-darkbg/80">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="inline-flex rounded-xl border border-emerald-400/15 bg-white/80 p-2 text-neutral-600 hover:bg-white dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500 dark:text-emerald-300">BizFlow NG</p>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">{getPageTitle(location.pathname)}</h1>
          </div>
        </div>

        <div className="hidden max-w-md flex-1 lg:block">
          <button
            type="button"
            onClick={openSearch}
            className="flex w-full items-center gap-3 rounded-2xl border border-emerald-400/15 bg-white/80 px-4 py-3 text-sm text-neutral-500 transition hover:border-primary hover:bg-white focus-visible:ring-4 focus-visible:ring-primary/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-primary dark:hover:bg-white/10"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search invoices, clients, staff...</span>
            <kbd className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-bold text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-emerald-400/15 bg-white/80 p-3 text-neutral-600 transition hover:bg-white dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={openSearch}
            className="rounded-2xl border border-emerald-400/15 bg-white/80 p-3 text-neutral-600 transition hover:bg-white dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10 lg:hidden"
            aria-label="Open global search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={openShortcuts}
            className="hidden rounded-2xl border border-emerald-400/15 bg-white/80 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-white dark:bg-white/5 dark:text-neutral-100 dark:hover:bg-white/10 xl:inline-flex"
          >
            Shortcuts
          </button>

          <NotificationCenter />

          <Dropdown
            trigger={
              <span className="inline-flex items-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800">
                {user?.user_metadata?.full_name || user?.email || 'Account'}
              </span>
            }
            items={[
              {
                label: 'Profile',
                icon: <User className="h-4 w-4" />,
                onClick: () => navigate('/app/settings'),
              },
              {
                label: 'Settings',
                icon: <Settings className="h-4 w-4" />,
                onClick: () => navigate('/app/settings'),
              },
              {
                label: 'Logout',
                icon: <LogOut className="h-4 w-4" />,
                onClick: onLogout,
              },
            ]}
          />
        </div>
      </div>
    </header>
  )
}

Topbar.propTypes = {
  onOpenMobileMenu: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.object,
}
