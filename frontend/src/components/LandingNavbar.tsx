import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-mosaik-gray/30">
      <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Nav links */}
        <ul className="flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                to={href}
                className="text-sm font-normal text-mosaik-black hover:opacity-60 transition-opacity duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Center: Logo */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 text-lg font-normal tracking-[0.2em] text-mosaik-black"
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
              className="w-40 py-1 bg-transparent border-b border-mosaik-black outline-none text-sm text-mosaik-black placeholder:text-mosaik-gray"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="text-sm font-normal text-mosaik-black hover:opacity-60 transition-opacity duration-200"
            >
              Search
            </button>
          )}
          <Link
            to="/account"
            className="text-sm font-normal text-mosaik-black hover:opacity-60 transition-opacity duration-200"
          >
            Account
          </Link>
          <button
            type="button"
            onClick={onCartClick}
            className="relative text-sm font-normal text-mosaik-black hover:opacity-60 transition-opacity duration-200"
            aria-label="Cart"
          >
            Cart
            {totalItems > 0 && (
              <span className="ml-1 text-mosaik-gray">({totalItems})</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
