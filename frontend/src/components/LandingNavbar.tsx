import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

interface LandingNavbarProps {
  onCartClick?: () => void
}

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'New', href: '/shop?new=1' },
  { label: 'Collections', href: '/shop' },
  { label: 'Editorial', href: '/editorial' },
  { label: 'About', href: '/about' },
]

export default function LandingNavbar({ onCartClick }: LandingNavbarProps) {
  const { totalItems } = useCart()
  const { theme, toggleTheme } = useTheme()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-mosaik-dark-bg border-b border-mosaik-gray/30 dark:border-mosaik-dark-border transition-colors">
      <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Nav links */}
        <ul className="flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                to={href}
                className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60 transition-opacity duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Center: Logo */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 text-lg font-normal tracking-[0.2em] text-mosaik-black dark:text-white"
        >
          MOSAIK
        </Link>

        {/* Right: Search, Account, Cart */}
        <div className="flex items-center gap-6">
          {isSearchOpen ? (
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search..."
              onBlur={() => setIsSearchOpen(false)}
              className="w-40 py-1 bg-transparent border-b border-mosaik-black dark:border-white outline-none text-sm text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-400"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60 transition-opacity duration-200"
            >
              Search
            </button>
          )}
          <Link
            to="/account"
            className="text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60 transition-opacity duration-200"
          >
            Account
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-mosaik-black dark:text-white hover:opacity-60 transition-opacity"
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
          </button>
          <button
            type="button"
            onClick={onCartClick}
            className="relative text-sm font-normal text-mosaik-black dark:text-white hover:opacity-60 transition-opacity duration-200"
            aria-label="Cart"
          >
            Cart
            {totalItems > 0 && (
              <span className="ml-1 text-mosaik-gray dark:text-gray-400">({totalItems})</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
