import { Link } from 'react-router-dom'

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white dark:bg-mosaik-dark-card rounded-xl shadow-lg p-8 text-center border border-mosaik-gray/20 dark:border-mosaik-dark-border">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment cancelled</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Your payment was cancelled. Your cart items are still available.</p>
            <Link
              to="/checkout"
              className="inline-block px-6 py-3 font-medium text-white bg-gray-900 dark:bg-mosaik-black rounded-none hover:bg-gray-800 dark:hover:bg-mosaik-black/90 transition-colors"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
  )
}
