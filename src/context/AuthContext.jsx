import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const OAUTH_NEXT_STORAGE_KEY = 'bizflow-auth-next'

function getSafeNextPath(nextPath) {
  if (!nextPath || typeof nextPath !== 'string') return '/app/dashboard'
  if (!nextPath.startsWith('/')) return '/app/dashboard'
  if (nextPath.startsWith('//')) return '/app/dashboard'
  return nextPath
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

    const redirectUrl = new URL('/auth/callback', window.location.origin)
    redirectUrl.searchParams.set('next', safeNextPath)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
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
