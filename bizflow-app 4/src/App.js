import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Clients from './pages/Clients'
import Staff from './pages/Staff'
import Layout from './components/Layout'
import './App.css'

export default function App() {
  const [session, setSession] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={session ? <Onboarding setBusiness={setBusiness} /> : <Navigate to="/auth" />} />
        <Route path="/" element={
          !session ? <Navigate to="/auth" /> :
          !business ? <Navigate to="/onboarding" /> :
          <Layout session={session} business={business}><Dashboard business={business} /></Layout>
        } />
        <Route path="/invoices" element={
          !session ? <Navigate to="/auth" /> :
          <Layout session={session} business={business}><Invoices business={business} /></Layout>
        } />
        <Route path="/clients" element={
          !session ? <Navigate to="/auth" /> :
          <Layout session={session} business={business}><Clients business={business} /></Layout>
        } />
        <Route path="/staff" element={
          !session ? <Navigate to="/auth" /> :
          <Layout session={session} business={business}><Staff business={business} /></Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}
