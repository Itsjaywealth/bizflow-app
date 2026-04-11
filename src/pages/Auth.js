import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ThemeToggle from '../components/ThemeToggle'

export default function Auth() {
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(''); setMessage('')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) setError(error.message)
      else setMessage('Account created! Check your email to confirm, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Incorrect email or password. Please try again.')
    }
    setLoading(false)
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true)
    setError('')
    setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-wrap">
        <div className="auth-topbar">
          <Link to="/" className="auth-home-link">Homepage</Link>
          <ThemeToggle compact />
        </div>
        <div className="auth-brand-block">
          <div className="auth-brand-mark">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
          </div>
          <h1>{mode === 'signup' ? 'Join BizFlow NG' : 'Welcome back to BizFlow NG'}</h1>
          <p>{mode === 'signup' ? 'Simple business tools for Nigerian SMEs.' : 'Log in to manage invoices, clients, staff, and reports.'}</p>
        </div>

        <div className="auth-panel">
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group auth-form-group">
                <label>Full Name</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>
            )}
            <div className="form-group auth-form-group">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                </span>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group auth-form-group">
              <label>Password</label>
              <div className="auth-input-wrap auth-password-wrap">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/></svg>
                </span>
                <input type={showPassword ? 'text' : 'password'} placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Your password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.92-2.6 2.63-4.8 4.83-6.32"/><path d="M10.58 10.58a2 2 0 1 0 2.83 2.83"/><path d="M9.88 4.24A11.07 11.07 0 0 1 12 4c5 0 9.27 3.11 11 8a11.17 11.17 0 0 1-1.64 2.86"/><path d="M1 1l22 22"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {mode === 'signup' && <small className="auth-hint">Minimum 8 characters</small>}
            </div>

            {error && <div className="notice error">{error}</div>}
            {message && <div className="notice success">{message}</div>}

            <button type="submit" className="auth-submit-button" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <div className="auth-divider auth-divider-simple" aria-hidden="true">
            <span>Or</span>
          </div>

          <button
            type="button"
            className="auth-oauth-button auth-oauth-button-standard"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            style={{ justifyContent: 'center', textAlign: 'center', fontWeight: 800, width: '100%', minHeight: 56 }}
          >
            <span className="auth-oauth-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 11.8v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 4.9 14.8 4 12 4a8 8 0 1 0 0 16c4.6 0 7.6-3.2 7.6-7.7 0-.5-.1-.9-.1-1.3z"/>
                <path fill="#34A853" d="M4 7.3l3.2 2.4C8 8.1 9.8 6.8 12 6.8c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 4.9 14.8 4 12 4 8.9 4 6.2 5.8 4.9 8.5z"/>
                <path fill="#FBBC05" d="M4.9 15.5A8 8 0 0 1 4 12c0-1.2.3-2.4.9-3.5l3.2 2.4c-.2.5-.3 1-.3 1.6s.1 1.1.3 1.6z"/>
                <path fill="#4285F4" d="M12 20c2.8 0 5.1-.9 6.8-2.5l-3.1-2.5c-.9.6-2 1-3.7 1-2.2 0-4.1-1.4-4.8-3.4L4 15.5C5.3 18.2 8.3 20 12 20z"/>
              </svg>
            </span>
            <span style={{ display: 'inline-block', textAlign: 'center', width: '100%' }}>
              {googleLoading ? 'Connecting to Google...' : `${mode === 'signup' ? 'Sign up with Google' : 'Log in with Google'}`}
            </span>
          </button>

          {mode === 'login' && (
            <div className="auth-secondary-link">
              <Link to="/reset-password">
                Forgot your password?
              </Link>
            </div>
          )}

          <div className="auth-switch">
            <span>{mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage('') }}>
              {mode === 'signup' ? 'Log in' : 'Create account'}
            </button>
          </div>

          <p className="auth-legal-note">
            By continuing you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
