import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface AuthContextValue {
  email: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('customer_token'))

  useEffect(() => {
    if (!token) return
    fetch('http://localhost:8080/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setEmail(data.email))
      .catch(() => {
        setToken(null)
        setEmail(null)
        localStorage.removeItem('customer_token')
      })
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('http://localhost:8080/api/auth/login', {
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

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
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
    localStorage.removeItem('customer_token')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        email,
        login,
        register,
        logout,
        isAuthenticated: !!token,
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
