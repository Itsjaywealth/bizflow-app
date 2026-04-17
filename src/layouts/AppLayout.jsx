import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/navigation/Sidebar'
import Topbar from '../components/navigation/Topbar'
import AnnouncementBanner from '../components/AnnouncementBanner'
import AppShellOverlays from '../components/global/AppShellOverlays'
import PlanLimitWarnings from '../components/global/PlanLimitWarnings'
import AppRouteSeo from '../components/AppRouteSeo'

export default function AppLayout({ children, session, business }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-background text-neutral-900 transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
      <AppRouteSeo />
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        user={session?.user}
        business={business}
        onLogout={handleLogout}
      />
      <div className={`${collapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
        <Topbar
          onOpenMobileMenu={() => setMobileOpen(true)}
          onLogout={handleLogout}
          user={session?.user}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
            <AnnouncementBanner />
            <PlanLimitWarnings />
            {children}
          </div>
        </main>
      </div>
      <AppShellOverlays />
    </div>
  )
}

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  session: PropTypes.object,
  business: PropTypes.object,
}
