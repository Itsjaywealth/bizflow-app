import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Seo from '../../components/Seo'
import useToast from '../../hooks/useToast'
import useAuth from '../../hooks/useAuth'

export default function AuthCallback() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { session, loading, getSafeNextPath, oauthNextStorageKey } = useAuth()
  const [resolving, setResolving] = useState(true)

  useEffect(() => {
    let active = true

    async function resolveOAuthCallback() {
      if (loading) return

      const params = new URLSearchParams(location.search)
      const nextParam = params.get('next')
      const storedNext = sessionStorage.getItem(oauthNextStorageKey)
      const nextPath = getSafeNextPath(nextParam || storedNext || '/app/dashboard')
      const code = params.get('code')
      const providerError = params.get('error_description') || params.get('error')

      if (providerError) {
        console.error('Google OAuth provider returned an error:', providerError)
        if (active) {
          sessionStorage.removeItem(oauthNextStorageKey)
          toast.error('Google login did not complete. Please try again.')
          navigate('/login', { replace: true, state: { from: { pathname: nextPath } } })
          setResolving(false)
        }
        return
      }

      try {
        if (!session && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            throw error
          }
        }

        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        if (active && (data?.session || session)) {
          sessionStorage.removeItem(oauthNextStorageKey)
          navigate(nextPath, { replace: true })
          setResolving(false)
          return
        }

        throw new Error('Google OAuth callback completed without an active session.')
      } catch (error) {
        console.error('OAuth callback resolution failed:', error)
        if (!active) return
        sessionStorage.removeItem(oauthNextStorageKey)
        toast.error('Google login did not complete. Please try again.')
        navigate('/login', { replace: true, state: { from: { pathname: nextPath } } })
        setResolving(false)
      }
    }

    resolveOAuthCallback()

    return () => {
      active = false
    }
  }, [getSafeNextPath, loading, location.search, navigate, oauthNextStorageKey, session, toast])

  return (
    <>
      <Seo
        title="Signing you in — BizFlow NG"
        description="Completing your Google sign-in for BizFlow NG."
        path="/auth/callback"
        noindex
      />
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-button">
            BF
          </div>
          <h1 className="mt-6 text-2xl font-black text-neutral-950">Signing you in…</h1>
          <p className="mt-3 text-sm leading-7 text-neutral-500">
            {resolving
              ? 'We’re securely finishing your Google login and loading your BizFlow NG workspace.'
              : 'Finalizing your workspace access…'}
          </p>
          <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary" aria-hidden="true" />
        </div>
      </div>
    </>
  )
}
