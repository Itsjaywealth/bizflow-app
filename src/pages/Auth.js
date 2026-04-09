import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0faf5 0%, #e8f4ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0d7c4f', textDecoration: 'none', fontWeight: 700, fontSize: 13, marginBottom: 18 }}>
            ← Back to homepage
          </Link>
          <div style={{ width: 52, height: 52, background: '#0d7c4f', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0a1628' }}>BizFlow <span style={{ color: '#0d7c4f' }}>NG</span></h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Smart tools for Nigerian businesses</p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 8px 32px rgba(10,22,40,0.1)' }}>
          <div style={{ display: 'flex', background: '#f8fafc', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {['signup', 'login'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all .2s', background: mode === m ? 'white' : 'transparent', color: mode === m ? '#0a1628' : '#94a3b8', boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                {m === 'signup' ? 'Create Account' : 'Log In'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label>Your Full Name</label>
                <input type="text" placeholder="Emeka Obi" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="emeka@yourbusiness.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {message && <div style={{ background: '#f0faf5', color: '#0d7c4f', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{message}</div>}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create My Free Account →' : 'Log In to My Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>
            By signing up you agree to our Terms of Service. Your data is safe and encrypted.
          </p>
        </div>
      </div>
    </div>
  )
}
