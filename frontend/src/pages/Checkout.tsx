import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const API_URL = 'http://localhost:8080/api/orders'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const { profile, isAuthenticated } = useAuth()
  const [guestEmail, setGuestEmail] = useState('')

  useEffect(() => {
    if (isAuthenticated && profile?.email) {
      setGuestEmail(profile.email)
    }
  }, [isAuthenticated, profile?.email])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestEmail: guestEmail || undefined,
          items: items.map(({ product, quantity, size, sku }) => ({
            productId: product.id,
            quantity,
            size: size || undefined,
            sku,
          })),
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        const message = errData.message || errData.error || (response.status === 400 ? 'Invalid form data' : `Request failed: ${response.status}`)
        throw new Error(message)
      }

      setSuccess(true)
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-mosaik-dark-card rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Thank you for your order. We'll send a confirmation to your email.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 font-medium text-white bg-gray-900 dark:bg-mosaik-black rounded-none hover:bg-gray-800 dark:hover:bg-mosaik-black/90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-mosaik-dark-card rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some items before checking out.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 font-medium text-white bg-gray-900 dark:bg-mosaik-black rounded-none hover:bg-gray-800 dark:hover:bg-mosaik-black/90 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="bg-white dark:bg-mosaik-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-mosaik-dark-border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            {isAuthenticated && (
              <p className="text-sm text-mosaik-gray dark:text-gray-400 mb-2">Signed in — orders will appear in your account</p>
            )}
            <div>
              <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email {isAuthenticated ? '' : '(optional)'}
              </label>
              <input
                id="guestEmail"
                name="guestEmail"
                type="email"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value)
                  setError(null)
                }}
                className="w-full px-4 py-2.5 rounded-none border border-gray-200 dark:border-mosaik-dark-border bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                placeholder="you@example.com"
              />
              {!isAuthenticated && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Leave blank to use guest@example.com</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-mosaik-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-mosaik-dark-border p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-6">
              {items.map(({ product, quantity, size, sku }) => (
                <li key={sku} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {product.name}
                    {(product.color || size) && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {' '}
                        {product.color && `Colour: ${product.color}`}
                        {product.color && size && ' | '}
                        {size && `Size: ${size}`}
                      </span>
                    )}{' '}
                    × {quantity}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(product.price * quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-mosaik-dark-border pt-4 mb-6">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 font-medium text-white bg-gray-900 dark:bg-mosaik-black rounded-none hover:bg-gray-800 dark:hover:bg-mosaik-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
