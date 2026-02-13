import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import type { Product } from '../types/product'
import { useAuth } from './AuthContext'

const GUEST_CART_KEY = 'mosaik_guest_cart'
const CART_DEBUG = true
const log = (...args: unknown[]) => CART_DEBUG && console.log('[Cart]', ...args)

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
  const resolved = item.sku && item.sku.trim() ? item.sku : getCartItemSku(item.product.id, item.size)
  if (CART_DEBUG && (!item.sku || !item.sku.trim())) {
    log('ensureSku fallback: rawSku=', JSON.stringify(item.sku), 'size=', item.size, 'productId=', item.product?.id, '->', resolved)
  }
  return resolved
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
    if (!raw) {
      log('loadGuestCart: empty')
      return []
    }
    const parsed = JSON.parse(raw) as { product: Product; quantity: number; size?: string; sku?: string }[]
    const items = parsed
      .filter((i) => i.product && i.quantity > 0)
      .map(toCartItem)
    log('loadGuestCart:', items.length, 'items', items.map((i) => ({ sku: i.sku, rawSku: parsed.find((p) => p.product?.id === i.product.id)?.sku, size: i.size })))
    return items
  } catch (e) {
    log('loadGuestCart error:', e)
    return []
  }
}

function saveGuestCart(items: CartItem[]) {
  try {
    log('saveGuestCart:', items.length, 'items', items.map((i) => i.sku))
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
        const payload = newItems.map((i) => ({ productId: i.product.id, quantity: i.quantity, size: i.size || null, sku: i.sku }))
        log('syncToBackend:', payload)
        await authFetch('/cart', {
          method: 'PUT',
          body: JSON.stringify({ items: payload }),
        })
      } catch (e) {
        log('syncToBackend error:', e)
        // ignore sync errors
      }
    },
    [isAuthenticated, authFetch]
  )

  const loadCart = useCallback(async () => {
    setIsLoading(true)
    log('loadCart: isAuthenticated=', isAuthenticated)
    if (isAuthenticated && authFetch) {
      try {
        const res = await authFetch('/cart')
        if (res.ok) {
          const data = await res.json()
          const apiItems = (data.items ?? []) as { productId: number; quantity: number; size?: string; sku?: string; product: Record<string, unknown> }[]
          log('loadCart (backend):', apiItems.length, 'items', apiItems.map((i) => ({ productId: i.productId, size: i.size, sku: i.sku })))
          const cartItems = apiItems.map((i) =>
            toCartItem({
              product: productFromApi(i.product as Parameters<typeof productFromApi>[0]),
              quantity: i.quantity,
              size: i.size || undefined,
              sku: i.sku,
            })
          )
          log('loadCart (parsed):', cartItems.map((i) => i.sku))
          setItems(cartItems)
        } else {
          log('loadCart: backend not ok', res.status)
          setItems([])
        }
      } catch (e) {
        log('loadCart error:', e)
        setItems([])
      }
    } else {
      const guest = loadGuestCart()
      log('loadCart (guest):', guest.length)
      setItems(guest)
    }
    setIsLoading(false)
  }, [isAuthenticated, authFetch])

  useEffect(() => {
    const guestCount = loadGuestCart().length
    if (isAuthenticated && guestCount > 0) {
      log('loadCart SKIP: authenticated + guest has', guestCount, 'items (merge effect will handle)')
      return
    }
    loadCart()
  }, [loadCart, isAuthenticated])

  useEffect(() => {
    const wasGuest = !prevAuthRef.current
    const isNowLoggedIn = isAuthenticated
    log('auth effect: wasGuest=', wasGuest, 'isNowLoggedIn=', isNowLoggedIn)
    prevAuthRef.current = isAuthenticated

    if (wasGuest && isNowLoggedIn) {
      const guestItems = loadGuestCart()
      log('login merge: guestItems=', guestItems.length, guestItems.map((i) => i.sku))
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
            log('login merge: backendCart SKUs=', backendCart.map((i) => i.sku), 'raw api skus=', apiItems.map((i) => i.sku))
            const merged = [...backendCart]
            const seenSkus = new Set(merged.map((i) => i.sku))
            for (const g of guestItems) {
              const sku = g.sku
              const existing = merged.find((i) => i.sku === sku)
              log('login merge: guest sku=', sku, 'existing=', !!existing, 'seenSkus.has=', seenSkus.has(sku))
              if (existing) {
                existing.quantity = Math.max(existing.quantity, g.quantity)
              } else if (!seenSkus.has(sku)) {
                seenSkus.add(sku)
                merged.push(g)
              }
            }
            log('login merge: merged SKUs=', merged.map((i) => i.sku), 'count=', merged.length)
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
      log('logout: clearing cart and guest storage')
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
      log('addToCart: productId=', product.id, 'size=', size, 'sku=', sku)
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
