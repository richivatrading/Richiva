import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, addToCart, updateCart, removeFromCart } from '../api/cart'
import { checkout } from '../api/orders'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart } from 'lucide-react'

export default function Cart({ cart, onUpdateCart, user, onNavigate }) {
  const [localCart, setLocalCart] = useState(cart)
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLocalCart(cart)
  }, [cart])

  const handleAdd = async (productId) => {
    await addToCart(productId)
    const res = await getCart()
    onUpdateCart(res.data)
    setLocalCart(res.data)
  }

  const handleUpdate = async (productId, quantity) => {
    await updateCart(productId, quantity)
    const res = await getCart()
    onUpdateCart(res.data)
    setLocalCart(res.data)
  }

  const handleRemove = async (productId) => {
    await removeFromCart(productId)
    const res = await getCart()
    onUpdateCart(res.data)
    setLocalCart(res.data)
  }

  const handleCheckout = async () => {
    if (!user) {
      onNavigate('login')
      return
    }
    setCheckingOut(true)
    try {
      const res = await checkout({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        phone: user.phone || '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
      })
      alert('Order created successfully!')
      onNavigate('orders')
    } catch (err) {
      alert(err.response?.data?.detail || 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  const isEmpty = !localCart.items || localCart.items.length === 0

  return (
    <div className="min-h-screen bg-emerald-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Bag</h1>
            <p className="text-muted mt-1">
              {isEmpty ? 'Your bag is empty' : `${localCart.count} item${localCart.count !== 1 ? 's' : ''} in your bag`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={() => navigate('/products')}
              className="text-sm font-medium text-emerald hover:text-emerald-dark transition-colors flex items-center gap-1"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-3xl border border-border shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-emerald-light rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-emerald" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your bag is empty</h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Looks like you haven't added anything to your bag yet. Explore our collection and find something you love.
            </p>
            <button onClick={() => navigate('/products')} className="btn-primary inline-flex items-center gap-2">
              Start Shopping
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {localCart.items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div
                      className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer"
                      onClick={() => navigate('/product/' + item.product.id)}
                    >
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className="font-semibold text-gray-900 truncate cursor-pointer hover:text-emerald transition-colors"
                            onClick={() => navigate('/product/' + item.product.id)}
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted mt-0.5">Rs {item.price} each</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="inline-flex items-center border border-border rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={() => handleUpdate(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 font-semibold text-gray-900 min-w-[2.5rem] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdate(item.product.id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            Rs {(Number(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-medium text-gray-900">Rs {localCart.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Shipping</span>
                    <span className="font-medium text-emerald">Free</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">Rs {localCart.total}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Checkout
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-xs text-muted text-center mt-3">
                  Secure checkout powered by Fiora
                </p>
                <div className="mt-6 p-4 bg-emerald-bg rounded-xl border border-border">
                  <div className="flex items-start gap-3">
                    <Heart size={18} className="text-emerald mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Save for later</p>
                      <p className="text-xs text-muted mt-0.5">Add items to your wishlist and come back anytime.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
