import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CheckoutSuccess() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white dark:bg-mosaik-dark-card rounded-xl shadow-lg p-8 text-center border border-mosaik-gray/20 dark:border-mosaik-dark-border">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thanks for your order!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Your payment was successful. We&apos;ll send a confirmation to your email.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="px-6 py-3 font-medium text-white bg-gray-900 dark:bg-mosaik-black rounded-none hover:bg-gray-800 dark:hover:bg-mosaik-black/90 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                to="/account"
                className="px-6 py-3 font-medium border border-gray-300 dark:border-mosaik-dark-border text-gray-900 dark:text-white rounded-none hover:bg-gray-50 dark:hover:bg-mosaik-dark-card transition-colors"
              >
                View Account
              </Link>
            </div>
          </div>
        </div>
      </div>
  )
}
