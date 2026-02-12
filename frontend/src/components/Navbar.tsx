import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

interface NavbarProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onCartClick?: () => void
}

export default function Navbar({ searchQuery = '', onSearchChange, onCartClick }: NavbarProps) {
  const { totalItems } = useCart()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchExpanded) searchInputRef.current?.focus()
  }, [isSearchExpanded])

  return (
    <nav className="sticky top-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-light text-gray-900 tracking-[0.3em] uppercase">
              MOSAIK
            </span>
          </Link>

          {/* Search bar - expands on click */}
          <div className="flex-1 max-w-xl mx-8 flex justify-center">
            <div className="relative flex items-center">
              {isSearchExpanded ? (
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onBlur={() => searchQuery === '' && setIsSearchExpanded(false)}
                  className="w-full max-w-xs py-1.5 bg-transparent border-b border-gray-900 outline-none text-gray-900 placeholder:text-gray-400 text-sm transition-all"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchExpanded(true)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm">SEARCH</span>
                </button>
              )}
            </div>
          </div>

          {/* Cart icon - thin line style */}
          <button
            type="button"
            onClick={onCartClick}
            className="relative p-2 text-gray-900 hover:opacity-70 transition-opacity"
            aria-label="Shopping cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-medium text-white bg-gray-900 rounded-full">
              {totalItems}
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}
