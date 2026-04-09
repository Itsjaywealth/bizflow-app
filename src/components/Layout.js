import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemeToggle from './ThemeToggle'

const nav = [
  { path: '/home', icon: '🏠', label: 'Public Page' },
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/invoices', icon: '🧾', label: 'Invoices' },
  { path: '/clients', icon: '🤝', label: 'Clients' },
  { path: '/products', icon: '📦', label: 'Products' },
  { path: '/expenses', icon: '💸', label: 'Expenses' },
  { path: '/staff', icon: '👥', label: 'My Team' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
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
      <aside className={`app-sidebar ${menuOpen ? 'open' : ''}`}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#0d7c4f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>BizFlow <span style={{ color: '#34d399' }}>NG</span></div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{business?.name || 'My Business'}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {nav.map(item => {
            const active = pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, marginBottom: 4, textDecoration: 'none', background: active ? 'rgba(13,124,79,0.25)' : 'transparent', color: active ? '#34d399' : 'rgba(255,255,255,0.6)', fontWeight: active ? 700 : 500, fontSize: 14, transition: 'all .2s', borderLeft: active ? '3px solid #0d7c4f' : '3px solid transparent' }} onClick={() => setMenuOpen(false)}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '0 12px 12px' }}>
            <ThemeToggle />
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '0 12px', marginBottom: 8 }}>
            {session?.user?.email}
          </div>
          <button onClick={signOut} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '10px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <div className="mobile-header">
          <button onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
          <Link to="/home" className="mobile-home-link">Public Page</Link>
        </div>

        {children}
      </main>
    </div>
  )
}
