import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface CustomerProfile {
  email: string
  name: string
}

interface AuthContextValue {
  email: string | null
  profile: CustomerProfile | null
  fetchProfile: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, confirmPassword: string, name?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  authFetch: (path: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const API = 'http://localhost:8080/api/auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('customer_token'))

  const fetchProfile = useCallback(async () => {
    if (!token) return
    const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return
    const data = await res.json()
    setEmail(data.email)
    setProfile({ email: data.email, name: data.name ?? '' })
  }, [token])

  useEffect(() => {
    if (!token) {
      setProfile(null)
      setEmail(null)
      return
    }
    fetchProfile().catch(() => {
      setToken(null)
      setEmail(null)
      setProfile(null)
      localStorage.removeItem('customer_token')
    })
  }, [token, fetchProfile])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const text = await res.text()
    let data: { token?: string; email?: string; message?: string } = {}
    try {
      data = JSON.parse(text)
    } catch {
      if (!res.ok) throw new Error(text || 'Login failed')
    }
    if (!res.ok) {
      throw new Error(data.message || text || 'Login failed')
    }
    setToken(data.token!)
    setEmail(data.email!)
    localStorage.setItem('customer_token', data.token!)
  }, [])

  const register = useCallback(async (email: string, password: string, confirmPassword: string, name?: string) => {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword, name }),
    })
    const text = await res.text()
    let data: { token?: string; email?: string; message?: string } = {}
    try {
      data = JSON.parse(text)
    } catch {
      if (!res.ok) throw new Error(text || 'Registration failed')
    }
    if (!res.ok) {
      throw new Error(data.message || text || 'Registration failed')
    }
    setToken(data.token!)
    setEmail(data.email!)
    localStorage.setItem('customer_token', data.token!)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setEmail(null)
    setProfile(null)
    localStorage.removeItem('customer_token')
  }, [])

  const authFetch = useCallback((path: string, options: RequestInit = {}) => {
    if (!token) return Promise.reject(new Error('Not authenticated'))
    return fetch(`${API}${path.startsWith('/') ? path : '/' + path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        email,
        profile,
        fetchProfile,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
