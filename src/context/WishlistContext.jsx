import { createContext, useContext, useState, useCallback } from 'react'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fiora_wishlist') || '[]')
    } catch {
      return []
    }
  })

  const save = (items) => {
    setWishlist(items)
    localStorage.setItem('fiora_wishlist', JSON.stringify(items))
  }

  const toggle = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      const next = exists ? prev.filter((p) => p.id !== product.id) : [...prev, product]
      localStorage.setItem('fiora_wishlist', JSON.stringify(next))
      return next
    })
  }, [])

  const isWishlisted = useCallback((productId) => {
    return wishlist.some((p) => p.id === productId)
  }, [wishlist])

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const next = prev.filter((p) => p.id !== productId)
      localStorage.setItem('fiora_wishlist', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
