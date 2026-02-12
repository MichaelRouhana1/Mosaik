import { useState } from 'react'
import { useCart } from '../context/CartContext'
import type { Product } from '../types/product'

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23e5e5e5' width='400' height='600'/%3E%3Ctext fill='%23999999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [imageError, setImageError] = useState(false)
  const imageSrc = product.imageUrl && !imageError ? product.imageUrl : PLACEHOLDER_IMAGE

  return (
    <article className="group overflow-hidden">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="text-sm text-gray-900 underline underline-offset-2 decoration-1 hover:no-underline">
            Add to Cart
          </span>
        </button>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-normal text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-sm font-normal text-gray-900 mt-0.5">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </article>
  )
}
