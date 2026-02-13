import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate()
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()

  const handleProceedToCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-mosaik-dark-card shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-mosaik-dark-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-none text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-mosaik-dark-border hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add items to get started</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity, size }) => (
                <li key={`${product.id}-${size ?? ''}`} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-mosaik-dark-border last:border-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded-none object-cover bg-gray-100 dark:bg-mosaik-dark-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      ${product.price.toFixed(2)} each
                      {size && <span className="ml-1">· Size {size}</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1, size)}
                        className="w-8 h-8 flex items-center justify-center rounded-none border border-gray-200 dark:border-mosaik-dark-border hover:bg-gray-50 dark:hover:bg-mosaik-dark-border text-gray-600 dark:text-gray-300 font-medium"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1, size)}
                        className="w-8 h-8 flex items-center justify-center rounded-none border border-gray-200 dark:border-mosaik-dark-border hover:bg-gray-50 dark:hover:bg-mosaik-dark-border text-gray-600 dark:text-gray-300 font-medium"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id, size)}
                        className="ml-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${(product.price * quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-mosaik-dark-border bg-gray-50 dark:bg-mosaik-dark-bg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-3 px-4 font-medium text-white bg-gray-900 dark:bg-mosaik-black rounded-none hover:bg-gray-800 dark:hover:bg-mosaik-black/90 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
