import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Seo from '../components/Seo'
import { getEmailVerificationReturnUrl } from '../lib/appUrls'
import { isEmailVerified } from '../lib/authState'
import useAuth from '../hooks/useAuth'

export default function VerifyEmail() {
  const location = useLocation()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [dots, setDots] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const email = useMemo(
    () => location.state?.email || user?.email || localStorage.getItem('bizflow-pending-email') || '',
    [location.state, user?.email]
  )
  const verified = isEmailVerified(user)

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
        emailRedirectTo: getEmailVerificationReturnUrl()
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
          <p className="verify-kicker">Verify your email to continue</p>

          <p className="verify-lead">
            We&apos;ve sent a verification link to
            <br />
            <strong>{email || 'your email address'}</strong>
            <br />
            <br />
            Please confirm your email to access your workspace. After you verify, log in again to continue to onboarding and dashboard.
          </p>

          <div className="verify-status">
            <span aria-hidden="true">⏳</span>
            {verified ? 'Email verified. You can log in now.' : `Waiting for confirmation${'.'.repeat(dots)}`}
          </div>

          {error && <div className="notice error">{error}</div>}
          {message && <div className="notice success">{message}</div>}
          {location.state?.justSignedUp ? (
            <div className="notice success">Your account has been created. Please check your email to verify your account before continuing.</div>
          ) : null}
          {location.state?.fromLogin ? (
            <div className="notice">Your account exists, but your email is not verified yet. Verify your email first, then log in again.</div>
          ) : null}

          <button type="button" className="verify-primary-button" onClick={handleResend} disabled={loading || verified}>
            {loading ? 'Sending...' : verified ? 'Email verified' : 'Resend email'}
          </button>

          <Link className="verify-secondary-link" to="/login">
            Back to login
          </Link>
        </div>

        <p className="verify-footnote">Didn&apos;t receive it? Check your spam folder, then try resending the email.</p>
      </div>
    </div>
  )
}
