import { useState, useEffect } from 'react'
import { adminFetch } from '../api/adminApi'
import { useToast } from '../context/ToastContext'
import type { Product } from '../types/product'
import ProductImageUpload from './ProductImageUpload'

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
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrls: ['', '', ''] as [string, string, string],
    category: '',
    color: '',
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
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      imageUrls,
      category: p.category,
      color: p.color || '',
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
          <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Color</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.content ?? []).map((p) => (
                  <tr key={p.id} className="border-b border-mosaik-gray/10 dark:border-mosaik-dark-border last:border-0">
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{p.name}</td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{p.category}</td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">${p.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-mosaik-gray dark:text-gray-400">{p.color || '—'}</td>
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
                ))}
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
    </div>
  )
}
