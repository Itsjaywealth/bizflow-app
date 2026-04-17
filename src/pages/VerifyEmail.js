import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'

export default function VerifyEmail() {
  const [visible, setVisible] = useState(false)
  const [dots, setDots] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const email = useMemo(() => localStorage.getItem('bizflow-pending-email') || '', [])

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 80)
    const dotsTimer = setInterval(() => setDots((value) => (value + 1) % 4), 650)
    return () => {
      clearTimeout(enterTimer)
      clearInterval(dotsTimer)
    }
  }, [])

  async function handleResend() {
    if (!email) {
      setError('We could not find the signup email. Please go back and create your account again.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (error) setError(error.message)
    else setMessage('A fresh confirmation email has been sent. Please check your inbox and spam folder.')

    setLoading(false)
  }

  return (
    <div className="verify-shell">
      <Seo
        title="Verify your email — BizFlow NG"
        description="Confirm your email address to activate your BizFlow NG account and continue setup."
        path="/verify-email"
        noindex
      />
      <div className={`verify-content ${visible ? 'is-visible' : ''}`}>
        <div className="verify-logo-stack">
          <div className="verify-logo-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="verify-logo-text">
            <span>BizFlow </span>
            <strong>NG</strong>
          </div>
        </div>

        <div className="verify-card">
          <div className="verify-icon-wrap" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <h1>Check your inbox</h1>

          <p className="verify-lead">
            We sent a confirmation link to
            <br />
            <strong>{email || 'your email address'}</strong>
            <br />
            <br />
            Click the link in that email to activate your BizFlow NG account and continue.
          </p>

          <div className="verify-status">
            <span aria-hidden="true">⏳</span>
            Waiting for confirmation{'.'.repeat(dots)}
          </div>

          {error && <div className="notice error">{error}</div>}
          {message && <div className="notice success">{message}</div>}

          <button type="button" className="verify-primary-button" onClick={handleResend} disabled={loading}>
            {loading ? 'Sending...' : 'Resend Email →'}
          </button>

          <Link className="verify-secondary-link" to="/login">
            ← Back to Log In
          </Link>
        </div>

        <p className="verify-footnote">Didn&apos;t receive it? Check your spam folder.</p>
      </div>
    </div>
  )
}
