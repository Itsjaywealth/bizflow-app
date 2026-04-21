import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Sidebar from '../components/navigation/Sidebar'
import Topbar from '../components/navigation/Topbar'
import AnnouncementBanner from '../components/AnnouncementBanner'
import AppShellOverlays from '../components/global/AppShellOverlays'
import PlanLimitWarnings from '../components/global/PlanLimitWarnings'
import AppRouteSeo from '../components/AppRouteSeo'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import useAuth from '../hooks/useAuth'

export default function AppLayout({ children, session, business }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { signOut } = useAuth()

  async function handleLogout() {
    await signOut()
  }

  return (
    <div className="brand-app-shell min-h-screen bg-background text-neutral-900 transition-colors duration-300 dark:bg-darkbg dark:text-neutral-100">
      <ErrorBoundary boundaryName="AppRouteSeo">
        <AppRouteSeo />
      </ErrorBoundary>
      <ErrorBoundary boundaryName="AppSidebar">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
          user={session?.user}
          business={business}
          onLogout={handleLogout}
        />
      </ErrorBoundary>
      <div className={`${collapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
        <ErrorBoundary boundaryName="AppTopbar">
          <Topbar
            onOpenMobileMenu={() => setMobileOpen(true)}
            onLogout={handleLogout}
            user={session?.user}
          />
        </ErrorBoundary>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
            <ErrorBoundary boundaryName="AnnouncementBanner">
              <AnnouncementBanner />
            </ErrorBoundary>
            <ErrorBoundary boundaryName="PlanLimitWarnings">
              <PlanLimitWarnings />
            </ErrorBoundary>
            {children}
          </div>
        </main>
      </div>
      <ErrorBoundary boundaryName="AppShellOverlays">
        <AppShellOverlays />
      </ErrorBoundary>
    </div>
  )
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  session: PropTypes.object,
  business: PropTypes.object,
}
