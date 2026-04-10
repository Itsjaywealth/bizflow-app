import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Clients from './pages/Clients'
import Staff from './pages/Staff'
import Products from './pages/Products'
import Expenses from './pages/Expenses'
import Settings from './pages/Settings'
import PublicInvoice from './pages/PublicInvoice'
import LandingPage from './pages/LandingPage'
import ResetPassword from './pages/ResetPassword'
import LegalPage from './pages/LegalPage'
import SupportPage from './pages/SupportPage'
import InfoPage from './pages/InfoPage'
import Billing from './pages/Billing'
import Layout from './components/Layout'
import './App.css'
import './sidebar-theme.css'
import './product-upgrades.css'
import './worldclass.css'
import './mobile.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('bizflow-theme')
    const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    document.documentElement.dataset.theme = savedTheme || preferredTheme

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadBusiness(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadBusiness(session.user.id)
      else { setBusiness(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadBusiness(userId) {
    const { data } = await supabase.from('businesses').select('*').eq('user_id', userId).single()
    setBusiness(data || null)
    setLoading(false)
  }

  function getAppHome() {
    return business ? '/dashboard' : '/onboarding'
  }

  function ProtectedRoute({ children }) {
    if (!session) return <Navigate to="/auth" replace />
    if (!business) return <Navigate to="/onboarding" replace />
    return <Layout session={session} business={business}>{children}</Layout>
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f8fafc'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,background:'#0d7c4f',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
        </div>
        <p style={{color:'#64748b',fontFamily:'sans-serif'}}>Loading BizFlow NG...</p>
      </div>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to={getAppHome()} replace /> : <LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/invoice/:token" element={<PublicInvoice />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/refund-policy" element={<LegalPage type="refund" />} />
        <Route path="/features" element={<InfoPage type="features" />} />
        <Route path="/how-it-works" element={<InfoPage type="how" />} />
        <Route path="/pricing" element={<InfoPage type="pricing" />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to={getAppHome()} replace />} />
        <Route path="/onboarding" element={
          !session ? <Navigate to="/auth" replace /> :
          business ? <Navigate to="/dashboard" replace /> :
          <Onboarding setBusiness={setBusiness} />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard business={business} />
          </ProtectedRoute>
        } />
        <Route path="/invoices" element={<ProtectedRoute><Invoices business={business} /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients business={business} /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Staff business={business} /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products business={business} /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses business={business} /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings business={business} setBusiness={setBusiness} /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={session ? getAppHome() : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
