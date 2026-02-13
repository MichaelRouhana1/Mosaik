import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useTheme } from '../context/ThemeContext'

export default function AdminLayout() {
  const { email, logout } = useAdminAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/account')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-white dark:bg-mosaik-dark-bg flex transition-colors">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-56 bg-white dark:bg-mosaik-dark-card border-r border-mosaik-gray/20 dark:border-mosaik-dark-border flex flex-col transform transition-transform duration-200 ease-out md:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-mosaik-gray/20 dark:border-mosaik-dark-border">
          <Link to="/admin/dashboard" onClick={closeSidebar} className="text-sm font-medium text-mosaik-black dark:text-white">
            MOSAIK Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            onClick={closeSidebar}
            className="block px-4 py-3 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-bg"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/products"
            onClick={closeSidebar}
            className="block px-4 py-3 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-bg"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            onClick={closeSidebar}
            className="block px-4 py-3 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-bg"
          >
            Orders
          </Link>
        </nav>
        <div className="p-4 border-t border-mosaik-gray/20 dark:border-mosaik-dark-border space-y-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full px-4 py-3 text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white text-left flex items-center gap-2"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            type="button"
            onClick={() => {
              handleLogout()
              closeSidebar()
            }}
            className="w-full px-4 py-3 text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-mosaik-gray/20 dark:border-mosaik-dark-border flex items-center justify-between px-4 md:px-6 gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card transition-colors"
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
            <span className="text-xs font-light text-mosaik-gray dark:text-gray-400 truncate max-w-[140px] md:max-w-[200px]">
              {email}
            </span>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
