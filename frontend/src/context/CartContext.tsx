import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { Product } from '../types/product'
import { useAuth } from './AuthContext'

const GUEST_CART_KEY = 'mosaik_guest_cart'

export function getCartItemSku(productId: number, size?: string): string {
  return size ? `${productId}-${size}` : `${productId}`
}

export interface CartItem {
  product: Product
  quantity: number
  size?: string
  sku: string
}

interface CartContextValue {
  items: CartItem[]
  addToCart: (product: Product, size?: string) => void
  removeFromCart: (sku: string) => void
  updateQuantity: (sku: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isLoading: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

function productFromApi(p: { id: number; name: string; description?: string; price: number; imageUrl?: string; additionalImageUrls?: string; category: string; color?: string; sizes?: string }): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    imageUrl: p.imageUrl ?? '',
    additionalImageUrls: p.additionalImageUrls,
    category: p.category,
    color: p.color,
    sizes: p.sizes,
  }
}

function ensureSku(item: { product: Product; quantity: number; size?: string; sku?: string }): string {
  if (item.sku && item.sku.trim()) return item.sku
  return getCartItemSku(item.product.id, item.size)
}

function toCartItem(raw: { product: Product; quantity: number; size?: string; sku?: string }): CartItem {
  return {
    product: raw.product,
    quantity: raw.quantity,
    size: raw.size,
    sku: ensureSku(raw),
  }
}

function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { product: Product; quantity: number; size?: string; sku?: string }[]
    return parsed
      .filter((i) => i.product && i.quantity > 0)
      .map(toCartItem)
  } catch {
    return []
  }
}

function saveGuestCart(items: CartItem[]) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, authFetch } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const prevAuthRef = useRef(isAuthenticated)

  const syncToBackend = useCallback(
    async (newItems: CartItem[]) => {
      if (!isAuthenticated || !authFetch) return
      try {
        await authFetch('/cart', {
          method: 'PUT',
          body: JSON.stringify({
            items: newItems.map((i) => ({
              productId: i.product.id,
              quantity: i.quantity,
              size: i.size || null,
              sku: i.sku,
            })),
          }),
        })
      } catch {
        // ignore sync errors
      }
    },
    [isAuthenticated, authFetch]
  )

  const loadCart = useCallback(async () => {
    setIsLoading(true)
    if (isAuthenticated && authFetch) {
      try {
        const res = await authFetch('/cart')
        if (res.ok) {
          const data = await res.json()
          const apiItems = (data.items ?? []) as { productId: number; quantity: number; size?: string; sku?: string; product: Record<string, unknown> }[]
          setItems(
            apiItems.map((i) =>
              toCartItem({
                product: productFromApi(i.product as Parameters<typeof productFromApi>[0]),
                quantity: i.quantity,
                size: i.size || undefined,
                sku: i.sku,
              })
            )
          )
        } else {
          setItems([])
        }
      } catch {
        setItems([])
      }
    } else {
      setItems(loadGuestCart())
    }
    setIsLoading(false)
  }, [isAuthenticated, authFetch])

  useEffect(() => {
    if (isAuthenticated && loadGuestCart().length > 0) {
      return
    }
    loadCart()
  }, [loadCart, isAuthenticated])

  useEffect(() => {
    const wasGuest = !prevAuthRef.current
    const isNowLoggedIn = isAuthenticated
    prevAuthRef.current = isAuthenticated

    if (wasGuest && isNowLoggedIn) {
      const guestItems = loadGuestCart()
      if (guestItems.length > 0 && authFetch) {
        authFetch('/cart')
          .then((res) => (res.ok ? res.json() : { items: [] }))
          .then((data) => {
            const apiItems = (data.items ?? []) as { productId: number; quantity: number; size?: string; sku?: string; product: Record<string, unknown> }[]
            const backendCart: CartItem[] = apiItems.map((i) =>
              toCartItem({
                product: productFromApi(i.product as Parameters<typeof productFromApi>[0]),
                quantity: i.quantity,
                size: i.size || undefined,
                sku: i.sku,
              })
            )
            const merged = [...backendCart]
            const seenSkus = new Set(merged.map((i) => i.sku))
            for (const g of guestItems) {
              const sku = g.sku
              const existing = merged.find((i) => i.sku === sku)
              if (existing) {
                existing.quantity = Math.max(existing.quantity, g.quantity)
              } else if (!seenSkus.has(sku)) {
                seenSkus.add(sku)
                merged.push(g)
              }
            }
            setItems(merged)
            return authFetch('/cart', {
              method: 'PUT',
              body: JSON.stringify({
                items: merged.map((i) => ({ productId: i.product.id, quantity: i.quantity, size: i.size || null, sku: i.sku })),
              }),
            })
          })
          .then(() => saveGuestCart([]))
          .catch(() => setItems(guestItems))
          .finally(() => setIsLoading(false))
      }
    } else if (!wasGuest && !isNowLoggedIn) {
      setItems([])
      saveGuestCart([])
    }
  }, [isAuthenticated, authFetch])

  const persist = useCallback(
    (newItems: CartItem[]) => {
      if (isAuthenticated) {
        syncToBackend(newItems)
      } else {
        saveGuestCart(newItems)
      }
    },
    [isAuthenticated, syncToBackend]
  )

  const addToCart = useCallback(
    (product: Product, size?: string) => {
      const sku = getCartItemSku(product.id, size)
      setItems((prev) => {
        const existing = prev.find((i) => i.sku === sku)
        let next: CartItem[]
        if (existing) {
          next = prev.map((i) => (i.sku === sku ? { ...i, quantity: i.quantity + 1 } : i))
        } else {
          next = [...prev, { product, quantity: 1, size, sku }]
        }
        persist(next)
        return next
      })
    },
    [persist]
  )

  const removeFromCart = useCallback(
    (sku: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.sku !== sku)
        persist(next)
        return next
      })
    },
    [persist]
  )

  const updateQuantity = useCallback(
    (sku: string, quantity: number) => {
      setItems((prev) => {
        if (quantity < 1) {
          const next = prev.filter((i) => i.sku !== sku)
          persist(next)
          return next
        }
        const next = prev.map((i) => (i.sku === sku ? { ...i, quantity } : i))
        persist(next)
        return next
      })
    },
    [persist]
  )

  const clearCart = useCallback(() => {
    setItems([])
    persist([])
  }, [persist])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const value: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
