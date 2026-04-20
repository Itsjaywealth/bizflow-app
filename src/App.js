import React, { Suspense, lazy, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AppLayout from './layouts/AppLayout'
import PublicLayout from './layouts/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import BrandLogo from './components/BrandLogo'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { AppToaster } from './components/ui/Toast'
import { AppShellProvider } from './context/AppShellContext'
import useAuth from './hooks/useAuth'
import { isEmailVerified } from './lib/authState'
import './App.css'
import './sidebar-theme.css'
import './product-upgrades.css'
import './worldclass.css'
import './mobile.css'

const Dashboard = lazy(() => import('./pages/app/Dashboard'))
const Clients = lazy(() => import('./pages/app/Clients'))
const Staff = lazy(() => import('./pages/app/Staff'))
const Products = lazy(() => import('./pages/app/Products'))
const Expenses = lazy(() => import('./pages/app/Expenses'))
const Reports = lazy(() => import('./pages/app/Reports'))
const Settings = lazy(() => import('./pages/app/Settings'))
const PublicInvoice = lazy(() => import('./pages/PublicInvoice'))
const Landing = lazy(() => import('./pages/Landing'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const SupportPage = lazy(() => import('./pages/SupportPage'))
const PublicContentPage = lazy(() => import('./pages/PublicContentPage'))
const Billing = lazy(() => import('./pages/app/Billing'))
const ClientDetail = lazy(() => import('./pages/app/ClientDetail'))
const StaffDetail = lazy(() => import('./pages/app/StaffDetail'))
const BizFlowAI = lazy(() => import('./components/BizFlowAI'))
const Payroll = lazy(() => import('./pages/app/Payroll'))
const LoginPage = lazy(() => import('./pages/auth/Login'))
const SignupPage = lazy(() => import('./pages/auth/Signup'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const OnboardingWizard = lazy(() => import('./pages/auth/Onboarding'))
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'))
const AppInvoices = lazy(() => import('./pages/app/Invoices'))
const InvoiceForm = lazy(() => import('./pages/app/InvoiceForm'))
const InvoiceDetail = lazy(() => import('./pages/app/InvoiceDetail'))

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

function RouteFallback() {
  return (
    <div className="brand-app-shell flex min-h-screen items-center justify-center bg-background px-6 dark:bg-darkbg">
      <div className="brand-shell-panel w-full max-w-xl rounded-[28px] p-8 text-center shadow-card">
        <BrandLogo className="mx-auto justify-center" showTagline={false} />
        <p className="text-lg font-bold text-neutral-900">Loading BizFlow NG</p>
        <p className="mt-2 text-sm text-neutral-500">Preparing your workspace and route assets…</p>
      </div>
    </div>
  )
}

export default function App() {
  const { session, loading: authLoading } = useAuth()
  const [business, setBusiness] = useState(null)
  const [businessLoading, setBusinessLoading] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('bizflow-theme')
    const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || preferredTheme
    document.documentElement.dataset.theme = initialTheme
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    document.body.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!session) {
      setBusiness(null)
      setBusinessLoading(false)
      return
    }

    if (!isEmailVerified(session.user)) {
      setBusiness(null)
      setBusinessLoading(false)
      return
    }

    loadBusiness(session.user.id)
  }, [authLoading, session])

  async function loadBusiness(userId) {
    setBusinessLoading(true)
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
    if (error) {
      console.error('Failed to load business profile after auth:', error)
      setBusiness(null)
      setBusinessLoading(false)
      return
    }
    setBusiness(data?.[0] || null)
    setBusinessLoading(false)
  }

  function getAppHome() {
    if (session && !isEmailVerified(session.user)) return '/verify-email'
    return business ? '/app/dashboard' : '/onboarding'
  }

  if (authLoading || businessLoading) {
    return (
      <div className="brand-app-shell flex min-h-screen items-center justify-center bg-background dark:bg-darkbg">
        <div className="text-center">
          <BrandLogo className="mx-auto justify-center" showTagline={false} />
          <p className="text-sm font-medium text-neutral-500">Loading BizFlow NG...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppToaster />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={session ? <Navigate to={getAppHome()} replace /> : <PublicLayout><Landing /></PublicLayout>} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/login" element={!session ? <LoginPage /> : <Navigate to={getAppHome()} replace />} />
            <Route path="/signup" element={!session ? <SignupPage /> : <Navigate to={getAppHome()} replace />} />
            <Route path="/auth" element={<Navigate to="/signup" replace />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to={getAppHome()} replace />} />
            <Route path="/invoice/:token" element={<PublicInvoice />} />
            <Route path="/verify-email" element={!session || !isEmailVerified(session.user) ? <VerifyEmail /> : <Navigate to={getAppHome()} replace />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<PublicLayout><PublicContentPage type="terms" /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PublicContentPage type="privacy" /></PublicLayout>} />
            <Route path="/privacy-cookies" element={<PublicLayout><PublicContentPage type="privacyCookies" /></PublicLayout>} />
            <Route path="/refund-policy" element={<PublicLayout><PublicContentPage type="refund" /></PublicLayout>} />
            <Route path="/features" element={<PublicLayout><PublicContentPage type="features" /></PublicLayout>} />
            <Route path="/how-it-works" element={<PublicLayout><PublicContentPage type="how" /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><PublicContentPage type="pricing" /></PublicLayout>} />
            <Route path="/changelog" element={<PublicLayout><PublicContentPage type="changelog" /></PublicLayout>} />
            <Route path="/roadmap" element={<PublicLayout><PublicContentPage type="roadmap" /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><PublicContentPage type="about" /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><PublicContentPage type="blog" /></PublicLayout>} />
            <Route path="/careers" element={<PublicLayout><PublicContentPage type="careers" /></PublicLayout>} />
            <Route path="/support" element={<PublicLayout><SupportPage /></PublicLayout>} />
            <Route
              path="/onboarding"
              element={
                !session ? (
                  <Navigate to="/login" replace />
                ) : !isEmailVerified(session.user) ? (
                  <Navigate to="/verify-email" replace />
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
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
