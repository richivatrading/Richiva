import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Toast, { useToast } from '../components/Toast'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { requireAuth } = useAuth()
  const { toasts, addToast, removeToast } = useToast()

  const handleAddToCart = async (product) => {
    const ok = requireAuth()
    if (!ok) return
    try {
      await addToCart(product.id, 1)
      addToast('Added to cart!', 'success')
    } catch {
      addToast('Failed to add to cart', 'error')
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 pb-24 lg:pb-8">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={22} className="text-red-500" />
          <h1 className="text-2xl font-black text-gray-900">My Wishlist</h1>
        </div>
        <div className="gold-divider" />
        <p className="text-sm text-gray-500 mt-2">{wishlist.length} saved items</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 text-sm mb-6">Save items you love by clicking the ♡ on any product</p>
          <Link to="/shop" className="btn-gold px-8">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlist.map(product => {
            const price = Number(product.price) || 0
            const origPrice = Math.round(price / 0.75)
            return (
              <div key={product.id} className="product-card group">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative aspect-[3/4] bg-[#F5EDD8] overflow-hidden rounded-t-2xl">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">👗</div>
                    )}
                    <button
                      onClick={e => { e.preventDefault(); removeFromWishlist(product.id) }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-black text-gray-900">Rs. {price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">Rs. {origPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-gold w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
