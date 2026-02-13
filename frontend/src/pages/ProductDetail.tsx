import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import type { Product } from '../types/product'

const API_URL = 'http://localhost:8080/api/products'
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23e5e5e5' width='400' height='600'/%3E%3Ctext fill='%23999999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const toast = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const imageUrls = product
    ? product.additionalImageUrls
      ? [product.imageUrl, ...product.additionalImageUrls.split(',').map((s) => s.trim())].filter(Boolean)
      : [product.imageUrl].filter(Boolean)
    : []
  const hasMultipleImages = imageUrls.length >= 2

  useEffect(() => {
    if (!id) return
    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found')
        return res.json()
      })
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const variantMap = new Map((product?.variants ?? []).map((v) => [v.size, v]))
  const sizes = product?.sizes
    ? product.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_SIZES

  const getStockForSize = (size: string) => variantMap.get(size)?.stock ?? 0
  const isSizeInStock = (size: string) => getStockForSize(size) > 0

  const handleAddToBag = () => {
    if (!product) return
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    if (!isSizeInStock(selectedSize)) {
      toast.error('This size is out of stock')
      return
    }
    addToCart(product, selectedSize)
    toast.success('Added to bag')
  }

  const hasAnyInStock = sizes.some(isSizeInStock)
  const canAddToCart = selectedSize != null && isSizeInStock(selectedSize)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-mosaik-gray/30 dark:border-gray-600 border-t-mosaik-black dark:border-t-white animate-spin" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-mosaik-black dark:text-white font-medium">{error || 'Product not found'}</p>
        <Link to="/shop" className="text-sm font-normal text-mosaik-black dark:text-white border-b border-mosaik-black dark:border-white pb-1">
          Back to shop
        </Link>
      </div>
    )
  }

  const mainSrc =
    imageUrls[mainImageIndex] && !imageErrors[mainImageIndex]
      ? imageUrls[mainImageIndex]
      : PLACEHOLDER

  return (
    <main className="w-full max-w-[1400px] mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Image gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[2/3] overflow-hidden bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
            <img
              src={mainSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => handleImageError(mainImageIndex)}
            />
          </div>
          {hasMultipleImages && (
            <div className="grid grid-cols-2 gap-4">
              {imageUrls.slice(1).map((url, i) => {
                const idx = i + 1
                const src = !imageErrors[idx] ? url : PLACEHOLDER
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMainImageIndex(idx)}
                    className={`relative aspect-[2/3] overflow-hidden bg-mosaik-gray-soft border-2 transition-colors ${
                      mainImageIndex === idx ? 'border-mosaik-black dark:border-white' : 'border-transparent dark:border-transparent'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(idx)}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-normal text-mosaik-black dark:text-white uppercase tracking-widest">
              {product.name.toUpperCase()}
            </h1>
            <button
              type="button"
              className="text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white transition-colors"
              aria-label="Add to wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="mt-4 aspect-square w-16 h-16 overflow-hidden border border-mosaik-gray/50 dark:border-mosaik-dark-border">
            <img
              src={product.imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <p className="mt-6 text-lg font-normal text-mosaik-black dark:text-white">
            ${product.price.toFixed(2)}
          </p>

          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-3">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const inStock = isSizeInStock(size)
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => inStock && setSelectedSize(size)}
                    disabled={!inStock}
                    className={`w-12 h-12 rounded-full text-xs font-medium uppercase tracking-widest transition-colors ${
                      !inStock
                        ? 'border border-mosaik-gray/30 dark:border-mosaik-dark-border text-mosaik-gray/50 dark:text-gray-600 opacity-60 cursor-not-allowed line-through'
                        : selectedSize === size
                          ? 'bg-mosaik-black text-white dark:bg-white dark:text-mosaik-black'
                          : 'border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white hover:border-mosaik-black dark:hover:border-white'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            <Link
              to="#"
              className="mt-2 inline-block text-xs font-normal text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white underline underline-offset-2"
            >
              Size guide
            </Link>
          </div>

          {!hasAnyInStock && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">This product is currently out of stock.</p>
          )}

          <button
            type="button"
            onClick={handleAddToBag}
            disabled={!canAddToCart}
            className="mt-10 w-full py-4 text-xs font-medium uppercase tracking-widest text-white bg-mosaik-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to bag
          </button>
          {!selectedSize && hasAnyInStock && (
            <p className="mt-2 text-xs text-mosaik-gray dark:text-gray-400">Please select a size</p>
          )}

          <p className="mt-6 text-sm font-light text-mosaik-gray dark:text-gray-400">
            Free pickup at: MOSAIK
          </p>
        </div>
      </div>
    </main>
  )
}
