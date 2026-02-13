import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminFetch } from '../api/adminApi'
import { useToast } from '../context/ToastContext'

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  size?: string
}

interface Order {
  id: number
  guestEmail: string
  totalPrice: number
  status?: string
  createdAt: string
  items: OrderItem[]
}

interface OrdersPage {
  content: Order[]
  totalPages: number
  number: number
}

export default function AdminOrders() {
  const { id } = useParams()
  const toast = useToast()
  const [listData, setListData] = useState<OrdersPage | null>(null)
  const [orderDetail, setOrderDetail] = useState<Order | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      setLoading(true)
      adminFetch<Order>(`/orders/${id}`)
        .then(setOrderDetail)
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
        .finally(() => setLoading(false))
    } else {
      setOrderDetail(null)
      setLoading(true)
      adminFetch<OrdersPage>(`/orders?page=${page}&size=20`)
        .then(setListData)
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
        .finally(() => setLoading(false))
    }
  }, [id, page])

  if (id) {
    return (
      <div>
        <Link to="/admin/orders" className="text-xs text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white mb-6 inline-block">
          ← Back to orders
        </Link>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-mosaik-gray/30 dark:border-mosaik-dark-border border-t-mosaik-black dark:border-t-white animate-spin" />
          </div>
        ) : error ? (
          <div>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
            >
              Retry
            </button>
          </div>
        ) : orderDetail ? (
          <div>
            <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-6">Order #{orderDetail.id}</h1>
            <div className="space-y-2 mb-8">
              <p className="text-sm text-mosaik-black dark:text-white"><span className="text-mosaik-gray dark:text-gray-400">Email:</span> {orderDetail.guestEmail}</p>
              <p className="text-sm text-mosaik-black dark:text-white"><span className="text-mosaik-gray dark:text-gray-400">Total:</span> ${orderDetail.totalPrice.toFixed(2)}</p>
              <p className="text-sm text-mosaik-black dark:text-white"><span className="text-mosaik-gray dark:text-gray-400">Date:</span> {new Date(orderDetail.createdAt).toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-mosaik-gray dark:text-gray-400">Status:</span>
                <select
                  value={orderDetail.status ?? 'PENDING'}
                  onChange={async (e) => {
                    const newStatus = e.target.value as (typeof ORDER_STATUSES)[number]
                    if (!ORDER_STATUSES.includes(newStatus)) return
                    setStatusUpdating(true)
                    try {
                      const updated = await adminFetch<Order>(`/orders/${orderDetail.id}/status`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: newStatus }),
                      })
                      setOrderDetail(updated)
                      toast.success('Status updated')
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Update failed')
                    } finally {
                      setStatusUpdating(false)
                    }
                  }}
                  disabled={statusUpdating}
                  className="rounded-none py-1.5 px-3 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-bg text-mosaik-black dark:text-white text-sm disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">Items</h2>
            <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Product</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Qty</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Unit Price</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetail.items?.map((item) => (
                    <tr key={item.id} className="border-b border-mosaik-gray/10 dark:border-mosaik-dark-border last:border-0">
                      <td className="py-3 px-4 text-mosaik-black dark:text-white">{item.productName}</td>
                      <td className="py-3 px-4 text-mosaik-black dark:text-white">{item.quantity}</td>
                      <td className="py-3 px-4 text-mosaik-black dark:text-white">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-mosaik-black dark:text-white">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-8">Orders</h1>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-mosaik-gray/30 dark:border-mosaik-dark-border border-t-mosaik-black dark:border-t-white animate-spin" />
        </div>
      ) : error ? (
        <div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
                <thead>
                <tr className="border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white"></th>
                </tr>
              </thead>
              <tbody>
                {(listData?.content ?? []).map((o) => (
                  <tr key={o.id} className="border-b border-mosaik-gray/10 dark:border-mosaik-dark-border last:border-0">
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{o.id}</td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{o.guestEmail}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-none bg-mosaik-gray-soft dark:bg-mosaik-dark-card text-mosaik-black dark:text-white border border-mosaik-gray/30 dark:border-mosaik-dark-border">
                        {o.status ?? 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">${o.totalPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-mosaik-gray dark:text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/admin/orders/${o.id}`} className="text-xs text-mosaik-black dark:text-white hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {listData && listData.totalPages > 1 && (
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
                Page {page + 1} of {listData.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= listData.totalPages - 1}
                className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
