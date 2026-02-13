import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, type CustomerProfile } from '../context/AuthContext'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useToast } from '../context/ToastContext'

type Tab = 'login' | 'register'
type AccountTab = 'orders' | 'details'

interface Order {
  id: number
  guestEmail: string
  totalPrice: number
  createdAt: string
  items: { productName: string; quantity: number; unitPrice: number }[]
}

function AccountDashboard({
  profile,
  fetchProfile,
  authFetch,
  logout,
  toast,
}: {
  profile: CustomerProfile | null
  fetchProfile: () => Promise<void>
  authFetch: (path: string, options?: RequestInit) => Promise<Response>
  logout: () => void
  toast: { success: (m: string) => void; error: (m: string) => void }
}) {
  const navigate = useNavigate()
  const [accountTab, setAccountTab] = useState<AccountTab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [detailsForm, setDetailsForm] = useState({ name: '', email: '' })
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteSaving, setDeleteSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setDetailsForm({ name: profile.name || '', email: profile.email || '' })
    }
  }, [profile])

  useEffect(() => {
    if (accountTab === 'orders') {
      setOrdersLoading(true)
      authFetch('/orders')
        .then((res) => (res.ok ? res.json() : []))
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    }
  }, [accountTab, authFetch])

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    setDetailsSaving(true)
    try {
      const res = await authFetch('/me', {
        method: 'PUT',
        body: JSON.stringify({ name: detailsForm.name || null, email: detailsForm.email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Update failed')
      }
      await fetchProfile()
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setDetailsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    setPasswordSaving(true)
    try {
      const res = await authFetch('/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Password change failed')
      }
      setPasswordForm({ current: '', new: '', confirm: '' })
      toast.success('Password changed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Password change failed')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deleteConfirm) return
    setDeleteSaving(true)
    try {
      const res = await authFetch('/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Delete failed')
      }
      logout()
      toast.success('Account deleted')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleteSaving(false)
    }
  }

  return (
    <div className="pt-14 min-h-screen bg-white dark:bg-mosaik-dark-bg">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-normal text-mosaik-black dark:text-white">Account</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-normal text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white"
            >
              Back to home
            </Link>
            <button
              type="button"
              onClick={() => { logout(); toast.success('Signed out') }}
              className="text-sm font-normal text-mosaik-black dark:text-white border-b border-mosaik-black dark:border-white pb-1 hover:opacity-60"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="flex gap-6 mb-8 border-b border-mosaik-gray/20 dark:border-mosaik-dark-border">
          <button
            type="button"
            onClick={() => setAccountTab('orders')}
            className={`pb-3 text-xs font-medium uppercase tracking-widest border-b-2 transition-colors ${
              accountTab === 'orders'
                ? 'border-mosaik-black dark:border-white text-mosaik-black dark:text-white'
                : 'border-transparent text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white'
            }`}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setAccountTab('details')}
            className={`pb-3 text-xs font-medium uppercase tracking-widest border-b-2 transition-colors ${
              accountTab === 'details'
                ? 'border-mosaik-black dark:border-white text-mosaik-black dark:text-white'
                : 'border-transparent text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white'
            }`}
          >
            Personal details
          </button>
        </div>

        {accountTab === 'orders' && (
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">
              Previous purchases
            </h2>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-mosaik-gray/30 dark:border-mosaik-dark-border border-t-mosaik-black dark:border-t-white animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-mosaik-gray dark:text-gray-400 py-8">
                No orders yet. Orders placed with your email will appear here.
              </p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-mosaik-gray/20 dark:border-mosaik-dark-border p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400">
                        Order #{order.id}
                      </span>
                      <span className="text-sm text-mosaik-black dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {order.items?.map((item, i) => (
                        <li key={i} className="text-sm text-mosaik-black dark:text-white flex justify-between">
                          <span>{item.productName} × {item.quantity}</span>
                          <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-medium text-mosaik-black dark:text-white border-t border-mosaik-gray/20 dark:border-mosaik-dark-border pt-4">
                      Total: ${order.totalPrice.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {accountTab === 'details' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">
                Profile
              </h2>
              <form onSubmit={handleUpdateDetails} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={detailsForm.name}
                    onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                    className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-mosaik-black dark:text-white text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={detailsForm.email}
                    onChange={(e) => setDetailsForm({ ...detailsForm, email: e.target.value })}
                    required
                    className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-mosaik-black dark:text-white text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={detailsSaving}
                  className="rounded-none px-4 py-2 text-xs font-medium uppercase tracking-widest text-white bg-mosaik-black hover:opacity-90 disabled:opacity-50"
                >
                  {detailsSaving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </section>

            <section>
              <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">
                Change password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    required
                    className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-mosaik-black dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    required
                    minLength={6}
                    className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-mosaik-black dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    required
                    minLength={6}
                    className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-mosaik-black dark:text-white text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="rounded-none px-4 py-2 text-xs font-medium uppercase tracking-widest text-white bg-mosaik-black hover:opacity-90 disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </section>

            <section className="border-t border-mosaik-gray/20 dark:border-mosaik-dark-border pt-8">
              <h2 className="text-sm font-medium uppercase tracking-widest text-red-600 dark:text-red-400 mb-4">
                Delete account
              </h2>
              <p className="text-sm text-mosaik-gray dark:text-gray-400 mb-4">
                This will permanently delete your account and cannot be undone.
              </p>
              <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-mosaik-black dark:text-white text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-mosaik-black dark:text-white">
                  <input
                    type="checkbox"
                    checked={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.checked)}
                  />
                  I understand this action cannot be undone
                </label>
                <button
                  type="submit"
                  disabled={!deleteConfirm || deleteSaving}
                  className="rounded-none px-4 py-2 text-xs font-medium uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteSaving ? 'Deleting…' : 'Delete account'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Account() {
  const { email, profile, fetchProfile, login, register, logout, isAuthenticated, authFetch } = useAuth()
  const adminLogin = useAdminAuth().login
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('login')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
          if (tab === 'register' && form.password !== form.confirmPassword) {
            toast.error('Passwords do not match')
            setLoading(false)
            return
          }
          if (tab === 'login') {
        try {
          await login(form.email, form.password)
          toast.success('Signed in')
          navigate('/')
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
        await register(form.email, form.password, form.confirmPassword, form.name || undefined)
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
      <AccountDashboard
        profile={profile}
        fetchProfile={fetchProfile}
        authFetch={authFetch}
        logout={logout}
        toast={toast}
      />
    )
  }

  return (
    <div className="pt-14 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-[360px]">
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => { setTab('login'); setForm({ ...form, name: '', confirmPassword: '' }) }}
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
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="rounded-none w-full py-3 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent text-sm font-normal text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 outline-none focus:border-mosaik-black dark:focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          )}
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
