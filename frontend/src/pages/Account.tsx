import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useToast } from '../context/ToastContext'

type Tab = 'login' | 'register'

export default function Account() {
  const { email, login, register, logout, isAuthenticated } = useAuth()
  const adminLogin = useAdminAuth().login
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'login') {
        try {
          await login(form.email, form.password)
          toast.success('Signed in')
        } catch (customerErr) {
          try {
            await adminLogin(form.email, form.password)
            toast.success('Signed in')
            navigate('/admin/dashboard')
          } catch {
            throw customerErr
          }
        }
      } else {
        await register(form.email, form.password, form.name || undefined)
        toast.success('Account created')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-[32ch] px-6">
          <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-4">Account</h1>
          <p className="text-sm font-light text-mosaik-black/90 dark:text-gray-300 mb-2">
            Signed in as <span className="font-normal">{email}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              logout()
              toast.success('Signed out')
            }}
            className="mt-6 text-sm font-normal text-mosaik-black dark:text-white border-b border-mosaik-black dark:border-white pb-1 hover:opacity-60"
          >
            Sign out
          </button>
          <Link
            to="/"
            className="block mt-8 text-sm font-normal text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white border-b border-transparent hover:border-mosaik-black dark:hover:border-white pb-1"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-14 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[360px]">
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => { setTab('login'); setForm({ ...form, name: '' }) }}
            className={`text-sm font-medium uppercase tracking-widest pb-2 border-b-2 transition-colors ${
              tab === 'login' ? 'border-mosaik-black dark:border-white text-mosaik-black dark:text-white' : 'border-transparent text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`text-sm font-medium uppercase tracking-widest pb-2 border-b-2 transition-colors ${
              tab === 'register' ? 'border-mosaik-black dark:border-white text-mosaik-black dark:text-white' : 'border-transparent text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white'
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Optional"
                className="rounded-none w-full py-3 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-sm font-normal text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 outline-none focus:border-mosaik-black dark:focus:border-white transition-colors"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rounded-none w-full py-3 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-sm font-normal text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 outline-none focus:border-mosaik-black dark:focus:border-white transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={tab === 'register' ? 6 : undefined}
                className="rounded-none w-full py-3 px-4 pr-12 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-sm font-normal text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 outline-none focus:border-mosaik-black dark:focus:border-white transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-normal text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {tab === 'register' && (
              <p className="text-xs text-mosaik-gray dark:text-gray-400 mt-1">At least 6 characters</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-none w-full py-3 text-xs font-medium uppercase tracking-widest text-white bg-mosaik-black hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <Link
          to="/"
          className="block mt-8 text-center text-sm font-normal text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
