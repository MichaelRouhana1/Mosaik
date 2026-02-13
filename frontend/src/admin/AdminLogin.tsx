import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useTheme } from '../context/ThemeContext'

export default function AdminLogin() {
  const { login } = useAdminAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-mosaik-dark-bg flex items-center justify-center px-6 transition-colors">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 text-mosaik-black dark:text-white hover:opacity-60 transition-opacity"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
      <div className="w-full max-w-[360px]">
        <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-8 text-center">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-none w-full py-3 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-sm font-normal text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 outline-none focus:border-mosaik-black dark:focus:border-white transition-colors"
              placeholder="admin@mosaik.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-none w-full py-3 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-sm font-normal text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 outline-none focus:border-mosaik-black dark:focus:border-white transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-none w-full py-3 text-xs font-medium uppercase tracking-widest text-white bg-mosaik-black hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
