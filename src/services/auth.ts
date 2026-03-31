const AUTH_KEY = 'con-core-auth'

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

export function setAuthenticated(value: boolean) {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, '1')
  } else {
    sessionStorage.removeItem(AUTH_KEY)
  }
}

export function login() {
  window.location.href = '/api/auth/login'
}

export function logout() {
  setAuthenticated(false)
  window.location.href = '/'
}

export async function checkAuthStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/health')
    if (!res.ok) return false
    const json = await res.json()
    const authenticated = json.data?.authenticated === true
    setAuthenticated(authenticated)
    return authenticated
  } catch {
    return false
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' })
    return res.ok
  } catch {
    return false
  }
}
