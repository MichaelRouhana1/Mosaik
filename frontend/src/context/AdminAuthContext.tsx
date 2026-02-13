import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface AdminAuthContext {
  token: string | null
  email: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContext | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'))
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    fetch('http://localhost:8080/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setEmail(data.email))
      .catch(() => {
        setToken(null)
        localStorage.removeItem('admin_token')
      })
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('http://localhost:8080/api/admin/login', {
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
    localStorage.setItem('admin_token', data.token!)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setEmail(null)
    localStorage.removeItem('admin_token')
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        email,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
