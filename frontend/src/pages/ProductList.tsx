import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import CategoryHeader from '../components/CategoryHeader'
import UtilityBar, { type SortOption } from '../components/UtilityBar'
import FilterPanel, { type FilterState } from '../components/FilterPanel'
import type { Product } from '../types/product'

const API_URL = 'http://localhost:8080/api/products'

const CAT_SLUG_TO_CATEGORY: Record<string, string> = {
  trousers: 'Trousers',
  shirts: 'Shirts',
  tshirts: 'T-Shirts',
  hoodies: 'Hoodies',
  jackets: 'Jackets',
  jeans: 'Jeans',
  sweaters: 'Sweaters',
}

const PEXELS = (id: number, w = 400, h = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

const EDITORIAL_TILES = [
  { image: PEXELS(1537638, 400, 600), caption: 'Autumn Layers' },
  { image: PEXELS(1040945, 400, 600), caption: 'Minimal Essentials' },
  { image: PEXELS(4611700, 400, 600), caption: 'Tailored Casual' },
]

const PRODUCTS_PER_PAGE = 12

export default function ProductList() {
  const [searchParams] = useSearchParams()
  const categorySlug = searchParams.get('cat')

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setProductsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [sort, setSort] = useState<SortOption>('recommended')
  const [filters, setFilters] = useState<FilterState>({
    fit: [],
    fabric: [],
    color: [],
    length: [],
  })
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE)

  const apiCategory = categorySlug ? CAT_SLUG_TO_CATEGORY[categorySlug] ?? categorySlug : null

  useEffect(() => {
    const url = apiCategory ? `${API_URL}?cat=${encodeURIComponent(apiCategory)}` : API_URL
    fetch(url)
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
      .finally(() => setProductsLoading(false))
  }, [apiCategory])

  const filteredAndSorted = useMemo(() => {
    let list = [...products]

    if (filters.color.length > 0) {
      list = list.filter((p) => p.color && filters.color.includes(p.color))
    }
    if (filters.fit.length > 0 || filters.fabric.length > 0 || filters.length.length > 0) {
      // No Fit/Fabric/Length in Product yet - skip for now
    }

    if (sort === 'recommended') {
      // Keep API order
    } else if (sort === 'newest') {
      list.sort((a, b) => b.id - a.id)
    } else if (sort === 'price-low') {
      list.sort((a, b) => a.price - b.price)
    }

    return list
  }, [products, filters, sort])

  const displayItems = useMemo(() => {
    const items: Array<{ type: 'product'; product: Product } | { type: 'editorial'; index: number }> = []
    let editorialIndex = 0
    filteredAndSorted.forEach((product, i) => {
      if (i > 0 && i % 12 === 0) {
        items.push({ type: 'editorial', index: editorialIndex % EDITORIAL_TILES.length })
        editorialIndex++
      }
      items.push({ type: 'product', product })
    })
    return items
  }, [filteredAndSorted])

  const visibleItems = displayItems.slice(0, visibleCount)
  const hasMore = visibleCount < displayItems.length

  const loadMore = () => {
    setVisibleCount((n) => n + PRODUCTS_PER_PAGE)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mosaik-gray/30 border-t-mosaik-black animate-spin" />
          <p className="text-sm font-light text-mosaik-gray">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white">
        <div className="text-center max-w-md p-8 border border-mosaik-gray/30">
          <p className="text-mosaik-black font-medium">{error}</p>
          <p className="mt-2 text-sm text-mosaik-gray">
            Make sure the backend is running at http://localhost:8080
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white min-h-screen">
      <CategoryHeader categorySlug={categorySlug} />
      <UtilityBar
        onFiltersClick={() => setFilterPanelOpen(true)}
        sort={sort}
        onSortChange={setSort}
      />

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <main className="w-full px-6 py-8">
        {filteredAndSorted.length === 0 ? (
          <p className="text-center text-sm font-light text-mosaik-gray py-16">
            No products match your filters.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleItems.map((item, i) =>
                item.type === 'product' ? (
                  <ProductCard key={item.product.id} product={item.product} />
                ) : (
                  <div
                    key={`editorial-${i}`}
                    className="relative aspect-[2/3] overflow-hidden flex-shrink-0"
                  >
                    <img
                      src={EDITORIAL_TILES[item.index].image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <p className="absolute bottom-4 left-4 text-xs font-light text-white tracking-widest uppercase">
                      {EDITORIAL_TILES[item.index].caption}
                    </p>
                  </div>
                )
              )}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  type="button"
                  onClick={loadMore}
                  className="rounded-none px-8 py-3 text-xs font-medium uppercase tracking-widest text-mosaik-black border border-mosaik-black hover:bg-mosaik-black hover:text-white transition-colors duration-200"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
