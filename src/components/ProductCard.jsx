import { Heart, Star, ShoppingCart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function StarRating({ rating = 4.5, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={12} className={s <= Math.round(rating) ? 'star-filled' : 'star-empty'} />
        ))}
      </div>
      {count > 0 && <span className="text-[11px] text-gray-400">({count})</span>}
    </div>
  )
}

export default function ProductCard({ product, onTryOn }) {
  const { toggle, isWishlisted } = useWishlist()
  const { addToCart, cartLoading } = useCart()
  const { requireAuth } = useAuth()

  const wishlisted = isWishlisted(product.id)
  const price    = Number(product.price) || 0
  const origPrice = Math.round(price / 0.75)
  const discount  = Math.round(((origPrice - price) / origPrice) * 100)

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product)
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const ok = requireAuth()
    if (!ok) return
    try {
      await addToCart(product.id, 1)
    } catch {}
  }

  const handleTryOn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onTryOn?.(product)
  }

  return (
    <Link to={`/product/${product.id}`} className="product-card group block">
      {/* Image area */}
      <div className="relative overflow-hidden bg-[#F5EDD8] aspect-[3/4]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            style={{ transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-[#D8B86A] opacity-30 font-black tracking-widest">FIORA</span>
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 badge-discount">
            -{discount}% OFF
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110"
        >
          <Heart size={15} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>

        {/* Hover overlay buttons */}
        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleTryOn}
            className="w-full flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#A9823F] text-xs font-bold py-2 rounded-lg shadow-md hover:bg-[#F5EDD8] transition-colors"
          >
            <Sparkles size={13} />
            Virtual Try-On
          </button>
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="w-full flex items-center justify-center gap-1.5 btn-gold text-xs py-2 rounded-lg"
          >
            <ShoppingCart size={13} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {product.category?.name && (
          <p className="text-[10px] font-semibold text-[#A9823F] uppercase tracking-wider mb-1">{product.category.name}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>

        <StarRating rating={4.5} count={Math.floor(Math.random() * 200) + 20} />

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-base font-black text-gray-900">Rs. {price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 line-through">Rs. {origPrice.toLocaleString()}</span>
        </div>

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="text-[11px] text-orange-500 font-semibold mt-1">Only {product.stock} left!</p>
        )}
        {product.stock === 0 && (
          <p className="text-[11px] text-red-500 font-semibold mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  )
}
