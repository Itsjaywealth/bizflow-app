import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Dashboard from './pages/app/Dashboard'
import Clients from './pages/app/Clients'
import Staff from './pages/app/Staff'
import Products from './pages/app/Products'
import Expenses from './pages/app/Expenses'
import Reports from './pages/app/Reports'
import Settings from './pages/app/Settings'
import PublicInvoice from './pages/PublicInvoice'
import Landing from './pages/Landing'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import LegalPage from './pages/LegalPage'
import SupportPage from './pages/SupportPage'
import InfoPage from './pages/InfoPage'
import Billing from './pages/app/Billing'
import ClientDetail from './pages/app/ClientDetail'
import StaffDetail from './pages/app/StaffDetail'
import BizFlowAI from './components/BizFlowAI'
import AppLayout from './layouts/AppLayout'
import PublicLayout from './layouts/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { AppToaster } from './components/ui/Toast'
import { AppShellProvider } from './context/AppShellContext'
import Payroll from './pages/app/Payroll'
import LoginPage from './pages/auth/Login'
import SignupPage from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import OnboardingWizard from './pages/auth/Onboarding'
import AppInvoices from './pages/app/Invoices'
import InvoiceForm from './pages/app/InvoiceForm'
import InvoiceDetail from './pages/app/InvoiceDetail'
import './App.css'
import './sidebar-theme.css'
import './product-upgrades.css'
import './worldclass.css'
import './mobile.css'

function AppFrame({ children, session, business, setBusiness }) {
  return (
    <ProtectedRoute session={session} business={business}>
      <AppShellProvider session={session} business={business} setBusiness={setBusiness}>
        <AppLayout session={session} business={business}>{children}</AppLayout>
      </AppShellProvider>
    </ProtectedRoute>
  )
}

AppFrame.propTypes = {
  children: PropTypes.node.isRequired,
  session: PropTypes.object,
  business: PropTypes.object,
  setBusiness: PropTypes.func,
}

export default function App() {
  const [session, setSession] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('bizflow-theme')
    const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || preferredTheme
    document.documentElement.dataset.theme = initialTheme
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    document.body.classList.toggle('dark', initialTheme === 'dark')

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      if (currentSession) loadBusiness(currentSession.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      if (currentSession) loadBusiness(currentSession.user.id)
      else {
        setBusiness(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadBusiness(userId) {
    const { data } = await supabase.from('businesses').select('*').eq('user_id', userId).single()
    setBusiness(data || null)
    setLoading(false)
  }

  function getAppHome() {
    return business ? '/app/dashboard' : '/onboarding'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-black text-white shadow-button">
            BF
          </div>
          <p className="text-sm font-medium text-neutral-500">Loading BizFlow NG...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppToaster />
        <Routes>
          <Route path="/" element={session ? <Navigate to={getAppHome()} replace /> : <PublicLayout><Landing /></PublicLayout>} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/login" element={!session ? <LoginPage /> : <Navigate to={getAppHome()} replace />} />
          <Route path="/signup" element={!session ? <SignupPage /> : <Navigate to={getAppHome()} replace />} />
          <Route path="/auth" element={<Navigate to="/signup" replace />} />
          <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to={getAppHome()} replace />} />
          <Route path="/invoice/:token" element={<PublicInvoice />} />
          <Route path="/verify-email" element={!session ? <VerifyEmail /> : <Navigate to={getAppHome()} replace />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<PublicLayout><LegalPage type="terms" /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><LegalPage type="privacy" /></PublicLayout>} />
          <Route path="/refund-policy" element={<PublicLayout><LegalPage type="refund" /></PublicLayout>} />
          <Route path="/features" element={<PublicLayout><InfoPage type="features" /></PublicLayout>} />
          <Route path="/how-it-works" element={<PublicLayout><InfoPage type="how" /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><InfoPage type="pricing" /></PublicLayout>} />
          <Route path="/support" element={<PublicLayout><SupportPage /></PublicLayout>} />
          <Route
            path="/onboarding"
            element={
              !session ? (
                <Navigate to="/login" replace />
              ) : business ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <OnboardingWizard setBusiness={setBusiness} />
              )
            }
          />
          <Route path="/app/dashboard" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Dashboard business={business} /></AppFrame>} />
          <Route path="/app/invoices" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><AppInvoices business={business} /></AppFrame>} />
          <Route path="/app/invoices/new" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><InvoiceForm business={business} /></AppFrame>} />
          <Route path="/app/invoices/:id" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><InvoiceDetail business={business} /></AppFrame>} />
          <Route path="/app/invoices/:id/edit" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><InvoiceForm business={business} /></AppFrame>} />
          <Route path="/app/clients" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Clients business={business} /></AppFrame>} />
          <Route path="/app/clients/:id" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><ClientDetail business={business} /></AppFrame>} />
          <Route path="/app/staff" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Staff business={business} /></AppFrame>} />
          <Route path="/app/staff/:id" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><StaffDetail business={business} /></AppFrame>} />
          <Route path="/app/payroll" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Payroll business={business} /></AppFrame>} />
          <Route path="/app/products" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Products business={business} /></AppFrame>} />
          <Route path="/app/expenses" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Expenses business={business} /></AppFrame>} />
          <Route path="/app/reports" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Reports business={business} /></AppFrame>} />
          <Route path="/app/settings" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Settings business={business} setBusiness={setBusiness} /></AppFrame>} />
          <Route path="/app/billing" element={<AppFrame session={session} business={business} setBusiness={setBusiness}><Billing /></AppFrame>} />
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/invoices" element={<Navigate to="/app/invoices" replace />} />
          <Route path="/clients" element={<Navigate to="/app/clients" replace />} />
          <Route path="/staff" element={<Navigate to="/app/staff" replace />} />
          <Route path="/products" element={<Navigate to="/app/products" replace />} />
          <Route path="/expenses" element={<Navigate to="/app/expenses" replace />} />
          <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
          <Route path="/billing" element={<Navigate to="/app/billing" replace />} />
          <Route path="*" element={<Navigate to={session ? getAppHome() : '/'} replace />} />
        </Routes>
        <BizFlowAI session={session} business={business} />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
