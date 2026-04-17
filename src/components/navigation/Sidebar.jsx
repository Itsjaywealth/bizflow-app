import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  X,
} from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/invoices', label: 'Invoices', icon: FileText },
  { to: '/app/clients', label: 'Clients', icon: Users },
  { to: '/app/staff', label: 'Staff & HR', icon: BriefcaseBusiness },
  { to: '/app/payroll', label: 'Payroll', icon: CreditCard },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapsed,
  user,
  business,
  onLogout,
}) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-neutral-950/40 lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-neutral-200 bg-white transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-950',
          collapsed ? 'lg:w-24' : '',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ').trim()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-5 dark:border-neutral-800">
          <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-black text-white shadow-button">
              BF
            </span>
            <div className={collapsed ? 'lg:hidden' : ''}>
              <p className="text-base font-extrabold text-neutral-900 dark:text-white">BizFlow NG</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Business operations hub</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className={`mb-6 flex ${collapsed ? 'lg:justify-center' : 'items-center justify-between'} gap-3`}>
            {collapsed ? null : (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Workspace</p>
                <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-white">{business?.name || 'BizFlow Workspace'}</p>
              </div>
            )}
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-primary hover:text-primary dark:border-neutral-800 dark:text-neutral-300 lg:inline-flex"
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-white shadow-button'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white',
                    collapsed ? 'lg:justify-center lg:px-3' : '',
                  ].join(' ').trim()
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className={`rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900 ${collapsed ? 'lg:px-2 lg:py-4' : ''}`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'lg:flex-col' : ''}`}>
              <Avatar name={user?.user_metadata?.full_name || user?.email || 'BizFlow User'} />
              <div className={`min-w-0 ${collapsed ? 'lg:text-center' : ''}`}>
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                  {user?.user_metadata?.full_name || 'BizFlow User'}
                </p>
                <p className={`truncate text-xs text-neutral-500 dark:text-neutral-400 ${collapsed ? 'lg:hidden' : ''}`}>
                  {user?.email}
                </p>
                <div className="mt-2">
                  <Badge variant="info">{business?.subscription_plan || 'Starter'}</Badge>
                </div>
              </div>
            </div>

            <div className={`mt-4 ${collapsed ? 'lg:mt-3' : ''}`}>
              <Button
                variant="ghost"
                fullWidth
                leftIcon={<LogOut className="h-4 w-4" />}
                className={collapsed ? 'lg:justify-center lg:px-0' : ''}
                onClick={onLogout}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>Log out</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  mobileOpen: PropTypes.bool.isRequired,
  onCloseMobile: PropTypes.func.isRequired,
  onToggleCollapsed: PropTypes.func.isRequired,
  user: PropTypes.object,
  business: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
}
