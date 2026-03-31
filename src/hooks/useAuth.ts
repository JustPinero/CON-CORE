import { useState, useEffect } from 'react'
import {
  isAuthenticated as checkLocal,
  login as authLogin,
  logout as authLogout,
  checkAuthStatus,
} from '../services/auth'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean>(checkLocal())
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false

    async function check() {
      // If URL has auth callback indicator, mark as authenticated
      const params = new URLSearchParams(window.location.search)
      if (params.has('auth') && params.get('auth') === 'success') {
        setAuthenticated(true)
        setLoading(false)
        return
      }

      const result = await checkAuthStatus()
      if (!cancelled) {
        setAuthenticated(result)
        setLoading(false)
      }
    }

    // If already locally flagged, skip network check
    if (checkLocal()) {
      setLoading(false)
    } else {
      check()
    }

    return () => {
      cancelled = true
    }
  }, [])

  return {
    isAuthenticated: authenticated,
    loading,
    login: authLogin,
    logout: authLogout,
  }
}
