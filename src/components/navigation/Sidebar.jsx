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
import BrandLogo from '../BrandLogo'
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
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-emerald-400/10 bg-brand-dark text-white transition-transform duration-300',
          collapsed ? 'lg:w-24' : '',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ').trim()}
      >
        <div className="flex items-center justify-between border-b border-emerald-400/10 px-5 py-5">
          <div className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}>
            <BrandLogo compact={collapsed} textClassName={collapsed ? 'lg:hidden' : ''} />
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl p-2 text-neutral-300 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className={`mb-6 flex ${collapsed ? 'lg:justify-center' : 'items-center justify-between'} gap-3`}>
            {collapsed ? null : (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Workspace</p>
                <p className="mt-1 text-sm font-semibold text-white">{business?.name || 'BizFlow Workspace'}</p>
              </div>
            )}
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden rounded-xl border border-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-100 hover:border-emerald-300 hover:bg-white/10 hover:text-white lg:inline-flex"
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
                      ? 'bg-brand-gradient text-white shadow-glow'
                      : 'text-emerald-50/80 hover:bg-white/8 hover:text-white',
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

        <div className="border-t border-emerald-400/10 p-4">
          <div className={`rounded-2xl bg-white/5 p-4 backdrop-blur ${collapsed ? 'lg:px-2 lg:py-4' : ''}`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'lg:flex-col' : ''}`}>
              <Avatar name={user?.user_metadata?.full_name || user?.email || 'BizFlow User'} />
              <div className={`min-w-0 ${collapsed ? 'lg:text-center' : ''}`}>
                <p className="truncate text-sm font-semibold text-white">
                  {user?.user_metadata?.full_name || 'BizFlow User'}
                </p>
                <p className={`truncate text-xs text-emerald-100/70 ${collapsed ? 'lg:hidden' : ''}`}>
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
                className={`${collapsed ? 'lg:justify-center lg:px-0' : ''} text-emerald-50 hover:bg-white/10 hover:text-white`}
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
