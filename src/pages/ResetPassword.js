import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PageUtilityNav from '../components/PageUtilityNav'
import Seo from '../components/Seo'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hasSession, setHasSession] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setHasSession(Boolean(session))
    })
    return () => subscription.unsubscribe()
  }, [])

  async function sendResetEmail(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) setError(error.message)
    else setMessage('Password reset email sent. Check your inbox and follow the secure link.')
    setLoading(false)
  }

  async function updatePassword(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setMessage('Password updated successfully. You can now log in with your new password.')
    setLoading(false)
  }

  return (
    <div className="auth-shell">
      <Seo
        title="Reset password — BizFlow NG"
        description="Reset your BizFlow NG password securely and regain access to your account."
        path="/reset-password"
        noindex
      />
      <div style={{ width: '100%', maxWidth: 480 }}>
        <PageUtilityNav />
        <div className="auth-card">
          <Link to="/auth" className="auth-back">← Back to login</Link>
          <div className="auth-brand">
            <div className="landing-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
            </div>
            <div>
              <h1>Reset your password</h1>
              <p>{hasSession ? 'Choose a new password for your BizFlow NG account.' : 'Enter your account email and we will send a secure reset link.'}</p>
            </div>
          </div>

          <form onSubmit={hasSession ? updatePassword : sendResetEmail}>
            {hasSession ? (
              <div className="form-group">
                <label>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter a new password"
                    required
                    minLength={8}
                    style={{ paddingRight: 74 }}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" required />
              </div>
            )}

            {error && <div className="notice error">{error}</div>}
            {message && <div className="notice success">{message}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={loading}>
              {loading ? 'Please wait...' : hasSession ? 'Save New Password' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
