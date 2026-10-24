import { createContext, useContext, useState, useCallback } from 'react'
import { getCart as apiGetCart, addToCart as apiAddToCart, updateCart as apiUpdateCart, removeFromCart as apiRemoveFromCart } from '../api/cart'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: '0.00', count: 0 })
  const [cartLoading, setCartLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await apiGetCart()
      setCart(res.data)
    } catch {}
  }, [])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setCartLoading(true)
    try {
      await apiAddToCart(productId, quantity)
      await refreshCart()
      return true
    } catch (err) {
      throw err
    } finally {
      setCartLoading(false)
    }
  }, [refreshCart])

  const updateCart = useCallback(async (productId, quantity) => {
    try {
      await apiUpdateCart(productId, quantity)
      await refreshCart()
    } catch {}
  }, [refreshCart])

  const removeFromCart = useCallback(async (productId) => {
    try {
      await apiRemoveFromCart(productId)
      await refreshCart()
    } catch {}
  }, [refreshCart])

  return (
    <CartContext.Provider value={{ cart, cartLoading, refreshCart, addToCart, updateCart, removeFromCart, setCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
