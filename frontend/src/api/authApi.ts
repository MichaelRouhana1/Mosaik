const API_BASE = 'http://localhost:8080/api/auth'

export function getCustomerToken(): string | null {
  return localStorage.getItem('customer_token')
}

export function getCustomerAuthHeader(): Record<string, string> {
  const token = getCustomerToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getCustomerAuthHeader(),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    localStorage.removeItem('customer_token')
    throw new Error('UNAUTHORIZED')
  }
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(msg || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}
