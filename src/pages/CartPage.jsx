import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Toast, { useToast } from '../components/Toast'
import { getCart as apiGetCart } from '../api/cart'

export default function CartPage() {
  const { cart, updateCart, removeFromCart, refreshCart } = useCart()
  const { user, setAuthModal } = useAuth()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [cartData, setCartData] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('token')) return
    apiGetCart().then(r => setCartData(r.data)).catch(() => {})
  }, [cart])

  const items = cartData?.items || []
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0)
  const shipping = subtotal > 2000 ? 0 : 100
  const total = subtotal + shipping

  const handleUpdate = async (productId, qty) => {
    if (qty < 1) { handleRemove(productId); return }
    setLoading(true)
    try { await updateCart(productId, qty) } catch {}
    setLoading(false)
  }

  const handleRemove = async (productId) => {
    setLoading(true)
    try { await removeFromCart(productId); addToast('Removed from cart', 'info') } catch {}
    setLoading(false)
  }

  const handleCheckout = () => {
    if (!user) { setAuthModal('signin'); return }
    navigate('/checkout')
  }

  const EmptyCart = () => (
    <div className="text-center py-20">
      <ShoppingCart size={64} className="mx-auto text-gray-200 mb-4" />
      <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
      <p className="text-gray-500 text-sm mb-6">Add items to your cart to start shopping</p>
      <Link to="/shop" className="btn-gold px-8">Shop Now</Link>
    </div>
  )

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 pb-24 lg:pb-8">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Shopping Cart</h1>
        <div className="gold-divider mt-1" />
        {items.length > 0 && <p className="text-sm text-gray-500 mt-2">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>}
      </div>

      {items.length === 0 && !localStorage.getItem('token') ? (
        <div className="text-center py-20">
          <ShoppingCart size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Login to view your cart</h3>
          <p className="text-gray-500 text-sm mb-6">Please sign in to see your saved cart items</p>
          <button onClick={() => setAuthModal('signin')} className="btn-gold px-8">Login</button>
        </div>
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const price = Number(item.price) || 0
              const qty   = item.quantity || 1
              return (
                <div key={item.product?.id || item.id} className="card p-4 flex gap-4">
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#F5EDD8] flex-shrink-0">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">👗</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/product/${item.product?.id}`} className="text-sm font-bold text-gray-900 hover:text-[#A9823F] line-clamp-2 block">
                          {item.product?.name || 'Product'}
                        </Link>
                        {item.product?.category?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.product.category.name}</p>
                        )}
                      </div>
                      <button onClick={() => handleRemove(item.product?.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex items-center gap-1 border border-[#E5E0D8] rounded-xl overflow-hidden">
                        <button onClick={() => handleUpdate(item.product?.id, qty - 1)} disabled={loading} className="px-3 py-1.5 text-gray-500 hover:bg-[#F5EDD8] transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1.5 font-bold text-sm">{qty}</span>
                        <button onClick={() => handleUpdate(item.product?.id, qty + 1)} disabled={loading} className="px-3 py-1.5 text-gray-500 hover:bg-[#F5EDD8] transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900">Rs. {(price * qty).toLocaleString()}</p>
                        {qty > 1 && <p className="text-xs text-gray-400">Rs. {price.toLocaleString()} each</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-black text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#A9823F]">Add Rs. {(2000 - subtotal).toLocaleString()} more for free delivery</p>
                )}
              </div>

              <div className="h-px bg-[#E5E0D8] mb-4" />

              <div className="flex justify-between font-black text-lg mb-6">
                <span>Total</span>
                <span style={{ color: '#A9823F' }}>Rs. {total.toLocaleString()}</span>
              </div>

              <button onClick={handleCheckout} className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <Link to="/shop" className="block text-center text-sm text-gray-500 hover:text-[#A9823F] mt-3 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
