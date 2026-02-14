import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const FREE_DELIVERY_THRESHOLD = 100

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()

  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - totalPrice)
  const qualifiesForFreeDelivery = totalPrice >= FREE_DELIVERY_THRESHOLD

  const handleProcessOrder = () => {
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-24">
        <h1 className="text-xl font-normal text-mosaik-black dark:text-white uppercase tracking-widest mb-8">
          Your Cart
        </h1>
        <div className="flex flex-col items-center justify-center py-16 border border-mosaik-gray/20 dark:border-mosaik-dark-border">
          <p className="text-mosaik-gray dark:text-gray-400 mb-4">Your cart is empty</p>
          <Link
            to="/shop"
            className="text-sm font-normal text-mosaik-black dark:text-white border-b border-mosaik-black dark:border-white pb-1 hover:opacity-60"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-12">
      <h1 className="text-xl font-normal text-mosaik-black dark:text-white uppercase tracking-widest mb-12">
        Basket ({items.length})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(340px,400px)] gap-8 lg:gap-12">
        {/* Product grid - 4 per row */}
        <div className="min-w-0 grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map(({ product, quantity, size, sku }) => (
            <div
              key={sku}
              className="flex flex-col bg-mosaik-gray-soft/50 dark:bg-mosaik-dark-card/50 border border-mosaik-gray/20 dark:border-mosaik-dark-border p-4"
            >
              <Link
                to={`/shop/${product.id}`}
                className="aspect-[3/4] overflow-hidden bg-mosaik-gray-soft dark:bg-mosaik-dark-card"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <Link
                to={`/shop/${product.id}`}
                className="text-sm font-medium text-mosaik-black dark:text-white hover:opacity-60 mt-3 line-clamp-2"
              >
                {product.name}
              </Link>
              <p className="text-sm font-semibold text-mosaik-black dark:text-white mt-1">
                ${product.price.toFixed(2)}
              </p>
              {(product.color || size) && (
                <p className="text-xs text-mosaik-gray dark:text-gray-400 mt-0.5">
                  {size && <span>{size}</span>}
                  {product.color && size && ' · '}
                  {product.color && <span>{product.color}</span>}
                </p>
              )}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => updateQuantity(sku, quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white font-medium hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium text-mosaik-black dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(sku, quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white font-medium hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeFromCart(sku)}
                  className="ml-auto text-xs text-mosaik-gray dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order summary */}
        <div>
          <div className="sticky top-24 border border-mosaik-gray/20 dark:border-mosaik-dark-border p-6 bg-mosaik-gray-soft/50 dark:bg-mosaik-dark-card/50">
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">
              Order Summary
            </h2>

            {!qualifiesForFreeDelivery && amountToFreeDelivery > 0 && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Add ${amountToFreeDelivery.toFixed(2)} more to get free standard delivery
                </p>
              </div>
            )}

            {qualifiesForFreeDelivery && (
              <p className="text-xs text-green-700 dark:text-green-400 mb-4">
                You qualify for free standard delivery
              </p>
            )}

            <div className="flex items-center justify-between py-4 border-t border-b border-mosaik-gray/20 dark:border-mosaik-dark-border">
              <span className="text-sm text-mosaik-gray dark:text-gray-400">Total (VAT included)</span>
              <span className="text-lg font-semibold text-mosaik-black dark:text-white">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleProcessOrder}
              className="w-full mt-6 py-4 text-xs font-medium uppercase tracking-widest text-white bg-mosaik-black dark:bg-white dark:text-mosaik-black hover:opacity-90 transition-opacity"
            >
              Process Order
            </button>

            <label className="flex items-center gap-2 mt-6 cursor-pointer">
              <input type="checkbox" className="rounded border-mosaik-gray/50 dark:border-mosaik-dark-border" />
              <span className="text-xs text-mosaik-gray dark:text-gray-400">Promotional code</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
