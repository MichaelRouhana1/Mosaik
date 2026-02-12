import { useState, useEffect, useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import type { Product } from '../types/product'

const API_URL = 'http://localhost:8080/api/products'

interface ProductListProps {
  searchQuery?: string
}

export default function ProductList({ searchQuery = '' }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products')
        return res.json()
      })
      .then((data) => {
        setProducts(data)
        setError(null)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    )
  }, [products, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md p-8 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-800 font-medium">{error}</p>
          <p className="mt-2 text-sm text-red-600">
            Make sure the backend is running at http://localhost:8080
          </p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No products found.</p>
      </div>
    )
  }

  return (
    <div className="w-full px-3 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 py-12">
            No products match your search.
          </p>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  )
}
