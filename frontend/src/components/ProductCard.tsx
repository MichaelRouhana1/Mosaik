import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import type { Product } from '../types/product'

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23e5e5e5' width='400' height='600'/%3E%3Ctext fill='%23999999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

interface ProductCardProps {
  product: Product
  compact?: boolean
}

export default function ProductCard({ product, compact }: ProductCardProps) {
  const { addToCart } = useCart()
  const toast = useToast()
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const imageUrls = product.additionalImageUrls
    ? [product.imageUrl, ...product.additionalImageUrls.split(',').map((s) => s.trim())]
    : [product.imageUrl]
  const hasMultipleImages = imageUrls.length > 1

  const currentSrc =
    imageUrls[currentImageIndex] && !imageErrors[currentImageIndex]
      ? imageUrls[currentImageIndex]
      : PLACEHOLDER_IMAGE

  const sizes = product.sizes
    ? product.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_SIZES

  const variantMap = new Map((product.variants ?? []).map((v) => [v.size, v]))
  const totalStock = (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0)
  const isOutOfStock = totalStock === 0
  const isSizeInStock = (size: string) => (variantMap.get(size)?.stock ?? 0) > 0

  const handleImageError = () => {
    setImageErrors((prev) => ({ ...prev, [currentImageIndex]: true }))
  }

  const goToPrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length)
  }

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((i) => (i + 1) % imageUrls.length)
  }

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isSizeInStock(size)) return
    addToCart(product, size)
    toast.success(`Added ${product.name} (${size}) to bag`)
  }

  const colorLabel = product.color ?? '—'

  return (
    <article className={`group overflow-hidden ${compact ? 'text-[0.85em]' : ''}`}>
      <Link to={`/shop/${product.id}`} className="block">
        <div className={`relative aspect-[2/3] overflow-hidden ${compact ? 'rounded-none' : ''}`}>
          <img
            src={currentSrc}
            alt={product.name}
            className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-70' : ''}`}
            onError={handleImageError}
          />

          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white bg-mosaik-black/90 backdrop-blur-sm">
                Out of stock
              </span>
            </div>
          )}

          {/* Image navigation arrows - visible on hover when multiple images */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={goToPrevImage}
                className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/80 dark:bg-black/60 text-mosaik-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
                aria-label="Previous image"
              >
                <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goToNextImage}
                className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white/80 dark:bg-black/60 text-mosaik-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80 ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
                aria-label="Next image"
              >
                <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Size selection overlay - visible on hover (hidden when out of stock) */}
          {!isOutOfStock && (
            <div className={`absolute inset-x-0 bottom-0 bg-white/95 dark:bg-mosaik-dark-bg/95 dark:border-t dark:border-mosaik-dark-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${compact ? 'p-2' : 'p-4'}`}>
              <p className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">
                Select size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const inStock = isSizeInStock(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => handleSizeClick(e, size)}
                      disabled={!inStock}
                      className={`px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors ${
                        inStock
                          ? 'border border-mosaik-black dark:border-white text-mosaik-black dark:text-white hover:bg-mosaik-black dark:hover:bg-white hover:text-white dark:hover:text-mosaik-black'
                          : 'border border-mosaik-gray/40 dark:border-mosaik-dark-border text-mosaik-gray/60 dark:text-gray-500 opacity-60 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className={compact ? 'mt-2' : 'mt-3'}>
          <h3 className={`font-light text-mosaik-black dark:text-white truncate ${compact ? 'text-xs' : 'text-sm'}`}>
            {product.name}
          </h3>
          <p className="text-xs font-light text-mosaik-gray dark:text-gray-400 mt-0.5">
            {colorLabel}
          </p>
          <p className="text-sm font-light text-mosaik-black dark:text-white mt-0.5">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </Link>
    </article>
  )
}
