import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { getAuthCallbackUrl, getSafeNextPath } from '../lib/appUrls'
import { isEmailVerified } from '../lib/authState'

const AuthContext = createContext(null)
const OAUTH_NEXT_STORAGE_KEY = 'bizflow-auth-next'

function writeOAuthNextPath(nextPath) {
  if (typeof window === 'undefined') return
  window.sessionStorage?.setItem(OAUTH_NEXT_STORAGE_KEY, nextPath)
  window.localStorage?.setItem(OAUTH_NEXT_STORAGE_KEY, nextPath)
}

function readOAuthNextPath() {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage?.getItem(OAUTH_NEXT_STORAGE_KEY)
    || window.localStorage?.getItem(OAUTH_NEXT_STORAGE_KEY)
    || ''
}

function clearOAuthNextPath() {
  if (typeof window === 'undefined') return
  window.sessionStorage?.removeItem(OAUTH_NEXT_STORAGE_KEY)
  window.localStorage?.removeItem(OAUTH_NEXT_STORAGE_KEY)
}

async function getSupabaseClient() {
  const { supabase } = await import('../lib/supabase')
  return supabase
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let subscription = null
    let authTimer = null

    async function bootstrapSession() {
      try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Failed to read Supabase session on app load:', error)
        }
        if (!mounted) return
        setSession(data?.session || null)

        const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
          if (!mounted) return
          if (event === 'SIGNED_OUT') {
            clearOAuthNextPath()
          }
          setSession(nextSession || null)
          setLoading(false)
        })
        subscription = authListener.subscription
      } catch (error) {
        console.error('Unexpected auth bootstrap failure:', error)
        if (!mounted) return
        setSession(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const shouldDeferPublicBootstrap =
      typeof window !== 'undefined' && window.location.pathname === '/'
    authTimer = window.setTimeout(bootstrapSession, shouldDeferPublicBootstrap ? 1200 : 0)

    return () => {
      mounted = false
      if (authTimer) window.clearTimeout(authTimer)
      subscription?.unsubscribe()
    }
  }, [])

  async function signInWithGoogle(nextPath = '/app/dashboard') {
    const supabase = await getSupabaseClient()
    const safeNextPath = getSafeNextPath(nextPath)
    writeOAuthNextPath(safeNextPath)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthCallbackUrl(safeNextPath),
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

  async function signOut(options = {}) {
    const supabase = await getSupabaseClient()
    clearOAuthNextPath()
    const { error } = await supabase.auth.signOut(options)
    if (error) {
      console.error('Supabase sign-out failed:', error)
      throw error
    }
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isVerified: isEmailVerified(session?.user),
      loading,
      signInWithGoogle,
      signOut,
      getSafeNextPath,
      getOAuthRedirectUrl: getAuthCallbackUrl,
      oauthNextStorageKey: OAUTH_NEXT_STORAGE_KEY,
      readOAuthNextPath,
      clearOAuthNextPath,
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
