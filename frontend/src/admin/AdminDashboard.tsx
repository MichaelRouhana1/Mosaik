import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminFetch } from '../api/adminApi'

interface Stats {
  totalProducts: number
  totalOrders: number
  revenueLast30Days: number
  ordersLast7Days: number
}

interface Order {
  id: number
  guestEmail: string
  totalPrice: number
  createdAt: string
}

interface OrdersPage {
  content: Order[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      adminFetch<Stats>('/stats'),
      adminFetch<OrdersPage>('/orders?page=0&size=5'),
    ])
      .then(([s, ordersPage]) => {
        setStats(s)
        setRecentOrders(ordersPage.content || [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-mosaik-gray/30 dark:border-mosaik-dark-border border-t-mosaik-black dark:border-t-white animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  return (
    <div>
      <h1 className="text-xl font-normal text-mosaik-black dark:text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border p-6 bg-white dark:bg-mosaik-dark-card">
          <p className="text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-2">Total Products</p>
          <p className="text-2xl font-normal text-mosaik-black dark:text-white">{stats?.totalProducts ?? 0}</p>
          <Link to="/admin/products" className="text-xs text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white mt-2 inline-block">
            View all →
          </Link>
        </div>
        <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border p-6 bg-white dark:bg-mosaik-dark-card">
          <p className="text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-2">Total Orders</p>
          <p className="text-2xl font-normal text-mosaik-black dark:text-white">{stats?.totalOrders ?? 0}</p>
          <Link to="/admin/orders" className="text-xs text-mosaik-gray dark:text-gray-400 hover:text-mosaik-black dark:hover:text-white mt-2 inline-block">
            View all →
          </Link>
        </div>
        <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border p-6 bg-white dark:bg-mosaik-dark-card">
          <p className="text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-2">Revenue (30d)</p>
          <p className="text-2xl font-normal text-mosaik-black dark:text-white">
            ${(stats?.revenueLast30Days ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border p-6 bg-white dark:bg-mosaik-dark-card">
          <p className="text-xs font-medium uppercase tracking-widest text-mosaik-gray dark:text-gray-400 mb-2">Orders (7d)</p>
          <p className="text-2xl font-normal text-mosaik-black dark:text-white">{stats?.ordersLast7Days ?? 0}</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-widest text-mosaik-black dark:text-white mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-mosaik-gray dark:text-gray-400">No orders yet.</p>
        ) : (
          <div className="border border-mosaik-gray/20 dark:border-mosaik-dark-border overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-mosaik-gray/20 dark:border-mosaik-dark-border bg-mosaik-gray-soft dark:bg-mosaik-dark-card">
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Total</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-widest text-mosaik-black dark:text-white"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-mosaik-gray/10 dark:border-mosaik-dark-border last:border-0">
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{o.id}</td>
                    <td className="py-3 px-4 text-mosaik-black dark:text-white">{o.guestEmail}</td>
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
        )}
      </div>
    </div>
  )
}
