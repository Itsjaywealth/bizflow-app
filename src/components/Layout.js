import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemeToggle from './ThemeToggle'

const nav = [
  { path: '/home', icon: '🏠', label: 'Homepage' },
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/reports', icon: '📈', label: 'Reports' },
  { path: '/invoices', icon: '🧾', label: 'Invoices' },
  { path: '/clients', icon: '🤝', label: 'Clients' },
  { path: '/products', icon: '📦', label: 'Products' },
  { path: '/expenses', icon: '💸', label: 'Expenses' },
  { path: '/staff', icon: '👥', label: 'My Team' },
  { path: '/settings', icon: '⚙️', label: 'Business Profile' },
  { path: '/billing', icon: '💳', label: 'Plan & Billing' },
  { path: '/support', icon: '💬', label: 'Support' },
]

export default function Layout({ children, session, business }) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <div className="app-layout">
      {menuOpen && <button className="sidebar-scrim" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <div className="sidebar-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
            </div>
            <div>
              <div className="sidebar-title">BizFlow <span>NG</span></div>
              <div className="sidebar-business-name">{business?.name || 'My Business'}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => {
            const active = pathname === item.path
            return (
              <Link key={item.path} to={item.path} className={`sidebar-link ${active ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
          <button onClick={signOut} className="sidebar-link sidebar-link-button">
            <span style={{ fontSize: 18 }}>🚪</span>
            Sign Out
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-theme">
            <ThemeToggle />
          </div>
          <div className="sidebar-email">
            {session?.user?.email}
          </div>
          <button onClick={signOut} className="sidebar-signout">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="mobile-header">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>{menuOpen ? 'Close' : 'Menu'}</button>
          <div className="mobile-header-brand">
            <strong>BizFlow NG</strong>
            <span>{business?.name || 'My Business'}</span>
          </div>
          <div className="mobile-header-actions">
            <ThemeToggle compact />
            <Link to="/home" className="mobile-home-link">Homepage</Link>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
