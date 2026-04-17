import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const OAUTH_NEXT_STORAGE_KEY = 'bizflow-auth-next'
const DEFAULT_APP_PATH = '/app/dashboard'

function getSafeNextPath(nextPath) {
  if (!nextPath || typeof nextPath !== 'string') return DEFAULT_APP_PATH
  if (!nextPath.startsWith('/')) return DEFAULT_APP_PATH
  if (nextPath.startsWith('//')) return DEFAULT_APP_PATH
  return nextPath
}

function getAuthSiteUrl() {
  const configured = process.env.REACT_APP_SITE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'https://bizflowng.com'
}

function getOAuthRedirectUrl(nextPath = DEFAULT_APP_PATH) {
  const redirectUrl = new URL('/auth/callback', getAuthSiteUrl())
  redirectUrl.searchParams.set('next', getSafeNextPath(nextPath))
  return redirectUrl.toString()
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function bootstrapSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Failed to read Supabase session on app load:', error)
        }
        if (!mounted) return
        setSession(data?.session || null)
      } catch (error) {
        console.error('Unexpected auth bootstrap failure:', error)
        if (!mounted) return
        setSession(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    bootstrapSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem(OAUTH_NEXT_STORAGE_KEY)
      }
      setSession(nextSession || null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signInWithGoogle(nextPath = '/app/dashboard') {
    const safeNextPath = getSafeNextPath(nextPath)
    sessionStorage.setItem(OAUTH_NEXT_STORAGE_KEY, safeNextPath)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOAuthRedirectUrl(safeNextPath),
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      console.error('Google OAuth sign-in failed:', error)
      throw error
    }

    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Supabase sign-out failed:', error)
      throw error
    }
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithGoogle,
      signOut,
      getSafeNextPath,
      getOAuthRedirectUrl,
      oauthNextStorageKey: OAUTH_NEXT_STORAGE_KEY,
    }),
    [session, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
