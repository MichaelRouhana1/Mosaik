import { useState, useEffect, useRef } from 'react'
import { adminFetch } from '../api/adminApi'
import { useToast } from '../context/ToastContext'
import type { Product, ProductVariant } from '../types/product'
import ProductImageUpload from './ProductImageUpload'

function StockPopover({
  variants,
  totalStock,
  children,
}: {
  variants: ProductVariant[]
  totalStock: number
  children: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const variantMap = new Map(variants.map((v) => [v.size, v.stock]))
  const sizes = variants.length > 0 ? variants.map((v) => v.size) : ['XS', 'S', 'M', 'L', 'XL']

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setShow(true), 250)
  }

  const handleLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setShow(false)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className="cursor-default">{children}</span>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
          <div className="relative bg-white dark:bg-mosaik-dark-card border border-mosaik-gray/30 dark:border-mosaik-dark-border shadow-lg py-3 px-4 min-w-[200px]">
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white dark:border-b-mosaik-dark-card"
            />
            <p className="text-[10px] font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400 text-center mb-2">
              Stock
            </p>
            <p className="text-sm font-medium text-mosaik-black dark:text-white text-center mb-3">
              {totalStock}
            </p>
            <div className="flex gap-2 justify-center">
              {sizes.map((size) => (
                <div
                  key={size}
                  className="flex flex-col items-center min-w-[32px] py-2 px-2 border border-mosaik-gray/30 dark:border-mosaik-dark-border bg-mosaik-gray-soft/50 dark:bg-mosaik-dark-bg/50"
                >
                  <span className="text-[10px] uppercase text-mosaik-gray dark:text-gray-400">{size}</span>
                  <span className="text-sm font-medium text-mosaik-black dark:text-white">
                    {variantMap.get(size) ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProductsPage {
  content: Product[]
  totalPages: number
  number: number
  totalElements: number
}

const CATEGORIES = ['Jeans', 'Jackets', 'T-Shirts', 'Hoodies', 'Sweaters', 'Trousers', 'Shirts']

export default function AdminProducts() {
  const toast = useToast()
  const [data, setData] = useState<ProductsPage | null>(null)
  const [cat, setCat] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null)
  const [sort, setSort] = useState<{ by: 'product' | 'stock' | 'price'; dir: 'asc' | 'desc' } | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [discountModal, setDiscountModal] = useState(false)
  const [discountInput, setDiscountInput] = useState('')
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL']

  const handleSort = (col: 'product' | 'stock' | 'price') => {
    setSort((prev) => {
      if (prev?.by === col) {
        return { by: col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      }
      return { by: col, dir: 'asc' }
    })
  }

  const sortedProducts = (() => {
    const list = [...(data?.content ?? [])]
    if (!sort) return list
    const { by: sortBy, dir: sortDir } = sort
    return list.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'product') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortBy === 'stock') {
        const sa = (a.variants ?? []).reduce((s, v) => s + v.stock, 0)
        const sb = (b.variants ?? []).reduce((s, v) => s + v.stock, 0)
        cmp = sa - sb
      } else if (sortBy === 'price') {
        cmp = a.price - b.price
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  })()

  const allSelected = sortedProducts.length > 0 && selectedProductIds.length === sortedProducts.length
  const someSelected = selectedProductIds.length > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedProductIds([])
    } else {
      setSelectedProductIds(sortedProducts.map((p) => p.id))
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrls: ['', '', ''] as [string, string, string],
    category: '',
    color: '',
    visible: true,
    variants: STANDARD_SIZES.map((size) => ({ size, stock: 0 })),
  })

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), size: '20' })
    if (cat) params.set('cat', cat)
    if (search.trim()) params.set('search', search.trim())
    adminFetch<ProductsPage>(`/products?${params}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, cat, search])

  const handleDeleteClick = (p: Product) => setDeleteConfirm(p)

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    const id = deleteConfirm.id
    setDeleting(id)
    try {
      await adminFetch(`/products/${id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      toast.success('Product deleted')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleBulkVisibility = async (visible: boolean) => {
    if (!someSelected) return
    setBulkActionLoading(true)
    try {
      await adminFetch('/products/bulk-visibility', {
        method: 'PATCH',
        body: JSON.stringify({ productIds: selectedProductIds, visible }),
      })
      setSelectedProductIds([])
      toast.success(visible ? 'Products shown' : 'Products hidden')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDiscount = async () => {
    const pct = parseFloat(discountInput)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast.error('Enter a valid percentage (0–100)')
      return
    }
    if (!someSelected) return
    setBulkActionLoading(true)
    try {
      await adminFetch('/products/bulk-discount', {
        method: 'PATCH',
        body: JSON.stringify({ productIds: selectedProductIds, discountPercentage: pct }),
      })
      setSelectedProductIds([])
      setDiscountModal(false)
      setDiscountInput('')
      toast.success(`Discount applied`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!someSelected) return
    setBulkActionLoading(true)
    try {
      await adminFetch('/products/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ productIds: selectedProductIds }),
      })
      setSelectedProductIds([])
      setBulkDeleteConfirm(false)
      toast.success('Products deleted')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    const additional = p.additionalImageUrls
      ? p.additionalImageUrls.split(',').map((s) => s.trim())
      : []
    const imageUrls: [string, string, string] = [
      p.imageUrl || '',
      additional[0] || '',
      additional[1] || '',
    ]
    const variantMap = new Map((p.variants ?? []).map((v) => [v.size, v.stock]))
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      imageUrls,
      category: p.category,
      color: p.color || '',
      visible: p.visible !== false,
      variants: STANDARD_SIZES.map((size) => ({ size, stock: variantMap.get(size) ?? 0 })),
    })
  }

  const openCreate = () => {
    setCreating(true)
    setForm({
      name: '',
      description: '',
      price: '',
      imageUrls: ['', '', ''],
      category: '',
      color: '',
      visible: true,
      variants: STANDARD_SIZES.map((size) => ({ size, stock: 0 })),
    })
  }

  const saveEdit = async () => {
    if (!editing) return
    setSaving(true)
    const additionalImageUrls = form.imageUrls
      .slice(1)
      .filter(Boolean)
      .join(',') || null
    try {
      await adminFetch(`/products/${editing.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: form.price ? parseFloat(form.price) : null,
          imageUrl: form.imageUrls[0] || null,
          additionalImageUrls,
          category: form.category || null,
          color: form.color || null,
          visible: form.visible,
          variants: form.variants.map((v) => ({ size: v.size, stock: v.stock })),
        }),
      })
      setEditing(null)
      toast.success('Product updated')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const saveCreate = async () => {
    if (!form.name || !form.price || !form.category || !form.imageUrls[0]?.trim()) {
      toast.error('Name, price, category, and at least one image are required')
      return
    }
    setSaving(true)
    const additionalImageUrls = form.imageUrls
      .slice(1)
      .filter(Boolean)
      .join(',') || null
    try {
      await adminFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: parseFloat(form.price),
          imageUrl: form.imageUrls[0] || null,
          additionalImageUrls,
          category: form.category,
          color: form.color || null,
          visible: form.visible,
          variants: form.variants.map((v) => ({ size: v.size, stock: v.stock })),
        }),
      })
      setCreating(false)
      toast.success('Product created')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-normal text-mosaik-black dark:text-white">Products</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-none px-4 py-2 text-xs font-medium uppercase tracking-widest text-white bg-mosaik-black hover:opacity-90"
        >
          Add Product
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setSearch(searchInput.trim()), setPage(0))}
            className="rounded-none py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-card text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 text-sm w-full sm:w-48"
          />
          <button
            type="button"
            onClick={() => { setSearch(searchInput.trim()); setPage(0) }}
            className="rounded-none px-4 py-2 text-xs font-medium uppercase tracking-widest border border-mosaik-black dark:border-white text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
          >
            Search
          </button>
        </div>
        <select
          value={cat}
          onChange={(e) => { setCat(e.target.value); setPage(0) }}
          className="rounded-none py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-card text-mosaik-black dark:text-white text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-mosaik-gray/30 dark:border-mosaik-dark-border border-t-mosaik-black dark:border-t-white animate-spin" />
        </div>
      ) : error ? (
        <div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => { setError(null); load() }}
            className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {someSelected && (
            <div className="mb-4 flex flex-wrap items-center gap-3 py-3 px-4 bg-mosaik-gray-soft dark:bg-mosaik-dark-card border border-mosaik-gray/20 dark:border-mosaik-dark-border">
              <span className="text-sm text-mosaik-black dark:text-white">
                {selectedProductIds.length} selected
              </span>
              <button
                type="button"
                onClick={() => handleBulkVisibility(false)}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-bg disabled:opacity-50"
              >
                Hide Selected
              </button>
              <button
                type="button"
                onClick={() => handleBulkVisibility(true)}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-bg disabled:opacity-50"
              >
                Show Selected
              </button>
              <button
                type="button"
                onClick={() => setDiscountModal(true)}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-bg disabled:opacity-50"
              >
                Apply Discount %
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductIds([])}
                className="rounded-none px-4 py-2 text-xs uppercase text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white"
              >
                Clear
              </button>
            </div>
          )}
          <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                  <th className="text-left py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-mosaik-gray/50 dark:border-mosaik-dark-border"
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('product')}
                      className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white hover:opacity-80 flex items-center gap-1"
                    >
                      Product
                      {sort?.by === 'product' && (sort.dir === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Category</th>
                  <th className="text-left py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('stock')}
                      className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white hover:opacity-80 flex items-center gap-1"
                    >
                      Stock
                      {sort?.by === 'stock' && (sort.dir === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleSort('price')}
                      className="text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white hover:opacity-80 flex items-center gap-1"
                    >
                      Price
                      {sort?.by === 'price' && (sort.dir === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Color</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => {
                  const totalStock = (p.variants ?? []).reduce((sum, v) => sum + v.stock, 0)
                  return (
                  <tr key={p.id} className="border-b border-mosaik-gray/10 dark:border-mosaik-dark-border last:border-0">
                    <td className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-mosaik-gray/50 dark:border-mosaik-dark-border"
                      />
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-10 h-12 object-cover bg-mosaik-gray-soft dark:bg-mosaik-dark-bg"
                        />
                      ) : (
                        <div className="w-10 h-12 bg-mosaik-gray-soft dark:bg-mosaik-dark-bg" />
                      )}
                      <span className="text-mosaik-black dark:text-white">{p.name}</span>
                    </td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{p.category}</td>
                    <td className="py-3 px-4">
                      <StockPopover variants={p.variants ?? []} totalStock={totalStock}>
                        {totalStock === 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">0 (Out of Stock)</span>
                        ) : (
                          <span className="text-mosaik-black dark:text-white">{totalStock}</span>
                        )}
                      </StockPopover>
                    </td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-mosaik-gray dark:text-gray-400">{p.color || '—'}</td>
                    <td className="py-3 px-4">
                      {p.visible === false ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400">Hidden</span>
                      ) : (
                        <span className="text-xs text-mosaik-gray dark:text-gray-400">Visible</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="text-xs text-mosaik-black dark:text-white hover:underline mr-4"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(p)}
                        disabled={deleting === p.id}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                      >
                        {deleting === p.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Prev
              </button>
              <span className="py-2 text-sm text-mosaik-gray dark:text-gray-400">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages - 1}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-mosaik-dark-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-mosaik-gray/20 dark:border-mosaik-dark-border">
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">Edit Product</h2>
            <ProductForm form={form} setForm={setForm} onUploadError={(e) => toast.error(e.message)} />
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="rounded-none px-4 py-2 text-xs uppercase bg-mosaik-black text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-mosaik-dark-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-mosaik-gray/20 dark:border-mosaik-dark-border">
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">Add Product</h2>
            <ProductForm form={form} setForm={setForm} onUploadError={(e) => toast.error(e.message)} />
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={saveCreate}
                disabled={saving}
                className="rounded-none px-4 py-2 text-xs uppercase bg-mosaik-black text-white disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                disabled={saving}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-mosaik-dark-card p-6 max-w-sm w-full border border-mosaik-gray/20 dark:border-mosaik-dark-border">
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">Delete Product</h2>
            <p className="text-sm text-mosaik-gray dark:text-gray-400 mb-6">
              Delete &quot;{deleteConfirm.name}&quot;? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting !== null}
                className="rounded-none px-4 py-2 text-xs uppercase bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting !== null}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {discountModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-mosaik-dark-card p-6 max-w-sm w-full border border-mosaik-gray/20 dark:border-mosaik-dark-border">
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">Apply Discount</h2>
            <p className="text-sm text-mosaik-gray dark:text-gray-400 mb-4">
              Enter discount percentage (0–100). New price = current price × (1 − % / 100).
            </p>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="e.g. 15"
              className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-bg text-mosaik-black dark:text-white text-sm mb-6"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBulkDiscount}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase bg-mosaik-black text-white disabled:opacity-50"
              >
                {bulkActionLoading ? 'Applying…' : 'Apply'}
              </button>
              <button
                type="button"
                onClick={() => { setDiscountModal(false); setDiscountInput('') }}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-mosaik-dark-card p-6 max-w-sm w-full border border-mosaik-gray/20 dark:border-mosaik-dark-border">
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-2">Delete Selected Products</h2>
            <p className="text-sm text-mosaik-gray dark:text-gray-400 mb-6">
              Delete {selectedProductIds.length} product(s)? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {bulkActionLoading ? 'Deleting…' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={bulkActionLoading}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type FormState = {
  name: string
  description: string
  price: string
  imageUrls: [string, string, string]
  category: string
  color: string
  visible: boolean
  variants: { size: string; stock: number }[]
}

function ProductForm({
  form,
  setForm,
  onUploadError,
}: {
  form: FormState
  setForm: (f: FormState) => void
  onUploadError?: (err: Error) => void
}) {
  const fields = [
    { key: 'name' as const, label: 'Name', required: true },
    { key: 'description' as const, label: 'Description', required: false },
    { key: 'price' as const, label: 'Price', required: true, type: 'number' },
    { key: 'category' as const, label: 'Category', required: true },
    { key: 'color' as const, label: 'Color', required: false },
  ]

  const updateImageUrl = (index: number, url: string) => {
    const next = [...form.imageUrls] as [string, string, string]
    next[index] = url
    setForm({ ...form, imageUrls: next })
  }

  return (
    <div className="space-y-4">
      {fields.map(({ key, label, required, type }) => (
        <div key={key}>
          <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">{label}</label>
          {key === 'category' ? (
            <select
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-bg text-mosaik-black dark:text-white text-sm"
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <input
              type={type || 'text'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={required}
              className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-bg text-mosaik-black dark:text-white text-sm"
            />
          )}
        </div>
      ))}
      <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="visible"
            checked={form.visible}
            onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            className="rounded border-mosaik-gray/50 dark:border-mosaik-dark-border"
          />
          <label htmlFor="visible" className="text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400">
            Visible (show on storefront)
          </label>
        </div>
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400">
          Images (up to 3, first is primary)
        </p>
        {([0, 1, 2] as const).map((i) => (
          <ProductImageUpload
            key={i}
            imageUrl={form.imageUrls[i]}
            onChange={(url) => updateImageUrl(i, url)}
            onError={(e) => onUploadError?.(e)}
            slotLabel={i === 0 ? 'Image 1 (required)' : `Image ${i + 1} (optional)`}
          />
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-mosaik-gray/20 dark:border-mosaik-dark-border">
        <p className="text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400">
          Sizes &amp; Inventory
        </p>
        <p className="text-xs text-mosaik-gray dark:text-gray-400">
          Set stock for each size. Use 0 if not stocked.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {form.variants.map((v, i) => (
            <div key={v.size}>
              <label className="block text-xs uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-1">
                {v.size}
              </label>
              <input
                type="number"
                min={0}
                value={v.stock}
                onChange={(e) => {
                  const next = [...form.variants]
                  next[i] = { ...next[i], stock: Math.max(0, parseInt(e.target.value, 10) || 0) }
                  setForm({ ...form, variants: next })
                }}
                className="rounded-none w-full py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-bg text-mosaik-black dark:text-white text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
