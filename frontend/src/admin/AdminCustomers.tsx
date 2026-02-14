import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminFetch } from '../api/adminApi'

interface CustomerSummary {
  userId: number
  email: string
  fullName: string
  totalOrders: number
  lifetimeSpend: number
  lastOrderDate: string | null
}

interface CustomerOrderSummary {
  id: number
  createdAt: string
  status: string
  totalPrice: number
}

interface CustomerDetail {
  userId: number
  email: string
  fullName: string
  createdAt: string
  orders: CustomerOrderSummary[]
}

export default function AdminCustomers() {
  const { id } = useParams()
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBySpend, setSortBySpend] = useState(true)

  useEffect(() => {
    if (id) {
      setLoading(true)
      adminFetch<CustomerDetail>(`/customers/${id}`)
        .then(setCustomerDetail)
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
        .finally(() => setLoading(false))
    } else {
      setCustomerDetail(null)
      setLoading(true)
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      adminFetch<CustomerSummary[]>(`/customers?${params}`)
        .then((data) => {
          const sorted = [...data]
          if (sortBySpend) {
            sorted.sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)
          } else {
            sorted.sort((a, b) => a.lifetimeSpend - b.lifetimeSpend)
          }
          setCustomers(sorted)
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
        .finally(() => setLoading(false))
    }
  }, [id, search, sortBySpend])

  if (id) {
    return (
      <div>
        <Link
          to="/admin/customers"
          className="text-xs text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white mb-6 inline-block"
        >
          ← Back to customers
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
        ) : customerDetail ? (
          <div>
            <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-6">Customer Details</h1>
            <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border p-6 mb-8">
              <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">Profile</h2>
              <div className="space-y-2">
                <p className="text-sm text-mosaik-black dark:text-white">
                  <span className="text-mosaik-gray dark:text-gray-400">Name:</span> {customerDetail.fullName || '—'}
                </p>
                <p className="text-sm text-mosaik-black dark:text-white">
                  <span className="text-mosaik-gray dark:text-gray-400">Email:</span> {customerDetail.email}
                </p>
                <p className="text-sm text-mosaik-black dark:text-white">
                  <span className="text-mosaik-gray dark:text-gray-400">Joined:</span>{' '}
                  {new Date(customerDetail.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">Order History</h2>
            <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Order ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customerDetail.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 px-4 text-center text-mosaik-gray dark:text-gray-400">
                        No orders yet
                      </td>
                    </tr>
                  ) : (
                    customerDetail.orders.map((order) => (
                      <tr key={order.id} className="border-b border-mosaik-gray/10 dark:border-mosaik-dark-border last:border-0">
                        <td className="py-3 px-4">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="text-mosaik-black dark:text-white hover:underline font-medium"
                          >
                            #{order.id}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-mosaik-gray dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-none bg-mosaik-gray-soft dark:bg-mosaik-dark-card text-mosaik-black dark:text-white border border-mosaik-gray/30 dark:border-mosaik-dark-border">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-mosaik-black dark:text-white">${order.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
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
      <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-8">Customers</h1>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput.trim())}
            className="rounded-none py-2 px-4 border border-mosaik-gray/50 dark:border-mosaik-dark-border bg-transparent dark:bg-mosaik-dark-card text-mosaik-black dark:text-white placeholder:text-mosaik-gray dark:placeholder:text-gray-500 text-sm w-full sm:w-64"
          />
          <button
            type="button"
            onClick={() => setSearch(searchInput.trim())}
            className="rounded-none px-4 py-2 text-xs font-medium uppercase tracking-widest border border-mosaik-black dark:border-white text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
          >
            Search
          </button>
        </div>
        <button
          type="button"
          onClick={() => setSortBySpend((s) => !s)}
          className="rounded-none px-4 py-2 text-xs font-medium uppercase tracking-widest border border-mosaik-gray/50 dark:border-mosaik-dark-border text-mosaik-black dark:text-white hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
        >
          Sort: {sortBySpend ? 'Highest Spenders ↓' : 'Lowest Spenders ↑'}
        </button>
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
            onClick={() => window.location.reload()}
            className="rounded-none px-4 py-2 text-xs uppercase border border-mosaik-gray/50 dark:border-mosaik-dark-border hover:bg-mosaik-gray-soft dark:hover:bg-mosaik-dark-card"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Total Orders</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Lifetime Spend</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Last Active</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-mosaik-gray dark:text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.userId} className="border-b border-mosaik-gray/10 dark:border-mosaik-dark-border last:border-0">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-mosaik-black dark:text-white font-medium">{c.fullName || '—'}</p>
                        <p className="text-xs text-mosaik-gray dark:text-gray-400">{c.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{c.totalOrders}</td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">${c.lifetimeSpend.toFixed(2)}</td>
                    <td className="py-3 px-4 text-mosaik-gray dark:text-gray-400">
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/customers/${c.userId}`}
                        className="text-xs text-mosaik-black dark:text-white hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
