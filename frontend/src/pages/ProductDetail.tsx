import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxZoomed, setLightboxZoomed] = useState(false)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const lightboxScrollRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null)

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

  useEffect(() => {
    if (!product?.category) return
    const url = `${API_URL}?cat=${encodeURIComponent(product.category)}`
    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Product[]) => {
        const similar = data.filter((p) => p.id !== product.id).slice(0, 10)
        setSimilarProducts(similar)
      })
      .catch(() => setSimilarProducts([]))
  }, [product?.id, product?.category])

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const goToPrevImage = () => {
    setMainImageIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length)
  }

  const goToNextImage = () => {
    setMainImageIndex((i) => (i + 1) % imageUrls.length)
  }

  const openLightbox = () => {
    setLightboxIndex(mainImageIndex)
    setLightboxZoomed(false)
    setLightboxOpen(true)
  }

  const closeLightbox = useCallback(() => {
    setMainImageIndex(lightboxIndex)
    setLightboxOpen(false)
    setLightboxZoomed(false)
  }, [lightboxIndex])

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length)
    setLightboxZoomed(false)
    lightboxScrollRef.current?.scrollTo(0, 0)
  }, [imageUrls.length])

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % imageUrls.length)
    setLightboxZoomed(false)
    lightboxScrollRef.current?.scrollTo(0, 0)
  }, [imageUrls.length])

  const handleLightboxDragStart = useCallback((clientX: number, clientY: number) => {
    const el = lightboxScrollRef.current
    if (!el || !lightboxZoomed) return
    dragRef.current = { x: clientX, y: clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop }
  }, [lightboxZoomed])

  const handleLightboxDragMove = useCallback((clientX: number, clientY: number) => {
    const d = dragRef.current
    const el = lightboxScrollRef.current
    if (!d || !el) return
    el.scrollLeft = d.scrollLeft + d.x - clientX
    el.scrollTop = d.scrollTop + d.y - clientY
  }, [])

  const handleLightboxDragEnd = useCallback(() => {
    dragRef.current = null
  }, [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext])

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
          <div
            className="relative aspect-[2/3] overflow-hidden bg-mosaik-gray-soft dark:bg-mosaik-dark-card group cursor-pointer"
            onClick={openLightbox}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox()}
            aria-label="View full image"
          >
            <img
              src={mainSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => handleImageError(mainImageIndex)}
            />
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToPrevImage() }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/60 text-mosaik-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80"
                  aria-label="Previous image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goToNextImage() }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-black/60 text-mosaik-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white dark:hover:bg-black/80"
                  aria-label="Next image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Lightbox overlay */}
          {lightboxOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              aria-modal="true"
              role="dialog"
              aria-label="Image gallery"
            >
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4 max-w-[95vw] max-h-[90vh]">
                {/* Vertical thumbnail strip - left */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[90vh] py-2 scrollbar-hide shrink-0">
                  {imageUrls.map((url, idx) => {
                    const src = !imageErrors[idx] ? url : PLACEHOLDER
                    const isSelected = lightboxIndex === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLightboxIndex(idx)
                          setLightboxZoomed(false)
                          lightboxScrollRef.current?.scrollTo(0, 0)
                        }}
                        className={`flex-shrink-0 w-16 h-20 overflow-hidden transition-all duration-200 ${
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-black opacity-100'
                            : 'opacity-60 hover:opacity-80 border border-white/20 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={src}
                          alt=""
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Main image area */}
                <div className="relative flex-1 min-w-0 flex items-center justify-center">
                  {imageUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); lightboxPrev() }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
                        aria-label="Previous image"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); lightboxNext() }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
                        aria-label="Next image"
                      >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      const willBeZoomed = !lightboxZoomed
                      setLightboxZoomed((z) => !z)
                      if (willBeZoomed) {
                        requestAnimationFrame(() => lightboxScrollRef.current?.scrollTo(0, 0))
                      } else {
                        lightboxScrollRef.current?.scrollTo(0, 0)
                      }
                    }}
                    className="absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-none z-10 transition-colors"
                    aria-label={lightboxZoomed ? 'Zoom out' : 'Zoom in'}
                  >
                    {lightboxZoomed ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>

                  <div
                    ref={lightboxScrollRef}
                    className={`w-full h-[85vh] overflow-auto overscroll-contain select-none scrollbar-hide ${
                      lightboxZoomed
                        ? 'flex items-start justify-start cursor-grab active:cursor-grabbing touch-none'
                        : 'flex items-center justify-center'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      if (lightboxZoomed) handleLightboxDragStart(e.clientX, e.clientY)
                    }}
                    onMouseMove={(e) => {
                      if (dragRef.current) {
                        e.preventDefault()
                        handleLightboxDragMove(e.clientX, e.clientY)
                      }
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation()
                      handleLightboxDragEnd()
                    }}
                    onMouseLeave={() => {
                      handleLightboxDragEnd()
                    }}
                    onTouchStart={(e) => {
                      if (lightboxZoomed && e.touches.length === 1) {
                        handleLightboxDragStart(e.touches[0].clientX, e.touches[0].clientY)
                      }
                    }}
                    onTouchMove={(e) => {
                      if (dragRef.current && e.touches.length === 1) {
                        e.preventDefault()
                        handleLightboxDragMove(e.touches[0].clientX, e.touches[0].clientY)
                      }
                    }}
                    onTouchEnd={() => handleLightboxDragEnd()}
                  >
                    <div
                      className={`flex items-center justify-center ${lightboxZoomed ? 'min-w-[110%] min-h-[110%] shrink-0' : ''}`}
                    >
                      <img
                        src={imageUrls[lightboxIndex] && !imageErrors[lightboxIndex] ? imageUrls[lightboxIndex] : PLACEHOLDER}
                        alt={product.name}
                        className={`object-contain select-none pointer-events-none ${
                          lightboxZoomed ? 'w-[110%] h-[110%]' : 'max-w-full max-h-[85vh]'
                        }`}
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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

      {similarProducts.length > 0 && (
        <section className="mt-24 pt-16 border-t border-mosaik-gray/20 dark:border-mosaik-dark-border">
          <h2 className="text-sm font-medium text-mosaik-black dark:text-white tracking-[0.2em] uppercase mb-8">
            Similar Items
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similarProducts.map((p) => (
              <div key={p.id} className="min-w-0">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
