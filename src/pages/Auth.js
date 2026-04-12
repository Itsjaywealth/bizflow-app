import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      })
      if (error) setError(error.message)
      else {
        localStorage.setItem('bizflow-pending-email', email)
        setName('')
        setEmail('')
        setPassword('')
        navigate('/verify-email')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Incorrect email or password. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="auth-shell">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: '#0d7c4f',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
              <path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>
            BizFlow <span style={{ color: 'var(--green)' }}>NG</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            Smart tools for Nigerian businesses
          </p>
        </div>

        <div className="auth-panel">
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-soft)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: 4,
              marginBottom: 28
            }}
          >
            {['signup', 'login'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m)
                  setError('')
                  setMessage('')
                }}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all .2s',
                  background: mode === m ? 'var(--surface)' : 'transparent',
                  color: mode === m ? 'var(--dark)' : 'var(--text3)',
                  boxShadow: mode === m ? 'var(--shadow)' : 'none'
                }}
              >
                {m === 'signup' ? 'Create Account' : 'Log In'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label>Your Full Name</label>
                <input
                  type="text"
                  placeholder="Emeka Obi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="emeka@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  style={{ paddingRight: 74 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 7,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-soft)',
                    color: 'var(--green)',
                    borderRadius: 7,
                    padding: '5px 9px',
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 16
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  background: '#f0faf5',
                  color: '#0d7c4f',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 16
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create My Free Account →' : 'Log In to My Account →'}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link
                to="/reset-password"
                style={{ color: 'var(--green)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
