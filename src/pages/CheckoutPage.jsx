import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, MapPin, Truck, Wallet, Package, CheckCircle2, Loader2,
  ArrowRight, ChevronLeft, Lock, Tag, X, Plus, Edit3, Trash2,
  CheckCircle, Clock, Star, Phone, Mail, User, Home, Navigation
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Toast, { useToast } from '../components/Toast'
import { getCart as apiGetCart } from '../api/cart'
import { checkout as apiCheckout } from '../api/orders'

const STEPS = [
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'payment', label: 'Payment', icon: Wallet },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
  { id: 'confirmation', label: 'Confirmation', icon: Package },
]

const DELIVERY_METHODS = [
  { id: 'standard', name: 'Standard Delivery', description: '3–5 Business Days', price: 100, eta: 'Aug 15–17, 2026' },
  { id: 'express', name: 'Express Delivery', description: '1–2 Business Days', price: 200, eta: 'Aug 13–14, 2026' },
]

const PAYMENT_METHODS = [
  { id: 'esewa', name: 'eSewa', description: 'Pay securely using eSewa', icon: Wallet },
  { id: 'khalti', name: 'Khalti', description: 'Pay securely using Khalti', icon: Wallet },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when your order arrives', icon: Package },
]

const MOCK_ADDRESSES = [
  { id: 1, label: 'Home', fullName: 'Richa Baidya', phone: '+977 98XXXXXXXX', address: 'Kathmandu Metropolitan City', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600', isDefault: true },
  { id: 2, label: 'Office', fullName: 'Richa Baidya', phone: '+977 98XXXXXXXX', address: 'New Baneshwor', city: 'Kathmandu', state: 'Bagmati', country: 'Nepal', postalCode: '44600', isDefault: false },
]

const COUPONS = {
  'FIORA10': { type: 'percent', value: 10, description: '10% off on orders above Rs. 2,000' },
  'WELCOME200': { type: 'fixed', value: 200, description: 'Rs. 200 off on your first order' },
  'FREESHIP': { type: 'shipping', value: 100, description: 'Free shipping on any order' },
}

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState('delivery')

  const getToken = () => {
    try { return localStorage.getItem('token') } catch { return null }
  }

  useEffect(() => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    apiGetCart()
      .then(r => {
        const data = r.data || { items: [] }
        if (!data.items || data.items.length === 0) navigate('/cart')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    const token = getToken()
    if (token && user) {
      setAddressForm(prev => ({
        ...prev,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || prev.fullName,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  const subtotal = useMemo(() => cart.items?.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0) || 0, [cart])
  const deliveryPrice = DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.price || 100
  const shipping = subtotal > 2000 ? 0 : deliveryPrice

  let discount = 0
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') discount = Math.round(subtotal * appliedCoupon.value / 100)
    else if (appliedCoupon.type === 'fixed') discount = appliedCoupon.value
    else if (appliedCoupon.type === 'shipping') discount = shipping
  }

  const total = Math.max(0, subtotal + shipping - discount)

  const validateDelivery = () => {
    const newErrors = {}
    if (!selectedAddressId) newErrors.address = 'Please select a delivery address'
    if (!deliveryMethod) newErrors.delivery = 'Please select a delivery method'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePayment = () => {
    const newErrors = {}
    if (!paymentMethod) newErrors.payment = 'Please select a payment method'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApplyCoupon = () => {
    setCouponError('')
    const coupon = COUPONS[couponCode.trim().toUpperCase()]
    if (!coupon) {
      setCouponError('Invalid coupon code')
      return
    }
    if (coupon.type === 'percent' && subtotal < 2000) {
      setCouponError('This coupon requires a minimum order of Rs. 2,000')
      return
    }
    setAppliedCoupon({ code: couponCode.trim().toUpperCase(), ...coupon })
    addToast('Coupon applied successfully!', 'success')
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    addToast('Coupon removed', 'info')
  }

  const handleSaveAddress = () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.street || !addressForm.city) {
      addToast('Please fill in required address fields', 'error')
      return
    }
    const newAddress = {
      id: Date.now(),
      label: editingAddress?.label || 'Home',
      ...addressForm,
      address: `${addressForm.house || ''} ${addressForm.street}${addressForm.additional ? ', ' + addressForm.additional : ''}`.trim(),
      postalCode: addressForm.postalCode || '',
      isDefault: addresses.length === 0,
    }
    if (editingAddress) {
      setAddresses(prev => prev.map(a => a.id === editingAddress.id ? { ...a, ...newAddress } : a))
      if (selectedAddressId === editingAddress.id) setSelectedAddressId(newAddress.id)
    } else {
      setAddresses(prev => [...prev, newAddress])
      setSelectedAddressId(newAddress.id)
    }
    setShowAddressForm(false)
    setEditingAddress(null)
    setAddressForm({ fullName: '', phone: '', province: '', district: '', city: '', ward: '', street: '', house: '', additional: '' })
    addToast('Address saved successfully', 'success')
  }

  const handleEditAddress = (addr) => {
    setEditingAddress(addr)
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.state || '',
      district: '',
      city: addr.city,
      ward: '',
      street: addr.address,
      house: '',
      additional: '',
    })
    setShowAddressForm(true)
  }

  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
    if (selectedAddressId === id) setSelectedAddressId(null)
    addToast('Address deleted', 'info')
  }

  const handlePlaceOrder = async () => {
    if (!validatePayment()) return
    setSubmitting(true)
    try {
      const selectedAddr = addresses.find(a => a.id === selectedAddressId)
      const orderData = {
        first_name: selectedAddr?.fullName?.split(' ')[0] || user?.first_name || '',
        last_name: selectedAddr?.fullName?.split(' ').slice(1).join(' ') || user?.last_name || '',
        email: user?.email || '',
        phone: selectedAddr?.phone || user?.phone || '',
        address: selectedAddr?.address || '',
        city: selectedAddr?.city || '',
        state: selectedAddr?.state || '',
        country: selectedAddr?.country || 'Nepal',
        postal_code: selectedAddr?.postalCode || '',
      }
      const res = await apiCheckout(orderData)
      await refreshCart()
      setOrderConfirmation({
        orderId: res.data?.order?.id || Date.now(),
        total: res.data?.order?.total || total,
        eta: DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.eta || 'Aug 15–17, 2026',
        paymentMethod,
      })
      setStep('confirmation')
      addToast('Order placed successfully!', 'success')
    } catch (err) {
      addToast(err.response?.data?.detail || 'Checkout failed. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!getToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gold-pale rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={32} className="text-gold-dark" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Login to Checkout</h2>
          <p className="text-muted mb-6 max-w-sm mx-auto">Please sign in to complete your purchase securely.</p>
          <button onClick={() => navigate('/')} className="btn-gold px-8">Login to Continue</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-gold-dark" size={40} />
      </div>
    )
  }

  if (step === 'confirmation' && orderConfirmation) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Toast toasts={toasts} onRemove={removeToast} />
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-dark mb-2">Order Placed Successfully!</h2>
          <p className="text-muted mb-6">Thank you for shopping with FIORA.</p>
          <div className="bg-bg rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Order Number</span>
              <span className="font-semibold text-dark">#{orderConfirmation.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Estimated Delivery</span>
              <span className="font-semibold text-dark">{orderConfirmation.eta}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Payment Method</span>
              <span className="font-semibold text-dark capitalize">{orderConfirmation.paymentMethod === 'cod' ? 'Cash on Delivery' : orderConfirmation.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total Paid</span>
              <span className="font-bold text-gold-dark">Rs. {orderConfirmation.total.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/orders')} className="flex-1 btn-gold">Track Order</button>
            <button onClick={() => navigate('/shop')} className="flex-1 btn-outline-gold">Continue Shopping</button>
          </div>
        </div>
      </div>
    )
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === step)

  return (
    <div className="min-h-screen bg-bg pb-24 lg:pb-8">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="FIORA" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Lock size={14} className="text-gold-dark" />
              <span className="font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isCompleted = currentStepIndex > idx
              return (
                <div key={s.id} className="flex-1 flex items-center">
                  <button
                    onClick={() => {
                      if (isCompleted) setStep(s.id)
                      else if (s.id === 'payment' && validateDelivery()) setStep('payment')
                      else if (s.id === 'review' && validatePayment()) setStep('review')
                    }}
                    disabled={!isCompleted && !isActive}
                    className={`flex items-center gap-2 sm:gap-3 py-2 px-3 rounded-xl transition-all ${
                      isActive ? 'bg-gold-pale/50' : ''
                    } ${isCompleted ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-default opacity-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted ? 'bg-gold text-white' : isActive ? 'bg-gold text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`text-sm font-semibold hidden sm:block ${isActive ? 'text-gold-dark' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`hidden sm:block flex-1 h-px mx-2 ${isCompleted ? 'bg-gold' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                  <MapPin size={20} className="text-gold-dark" />
                  Delivery Address
                </h2>
                <button
                  type="button"
                  onClick={() => { setEditingAddress(null); setAddressForm({ fullName: '', phone: '', province: '', district: '', city: '', ward: '', street: '', house: '', additional: '' }); setShowAddressForm(true) }}
                  className="text-xs font-semibold text-gold-dark hover:text-gold-deep flex items-center gap-1"
                >
                  <Plus size={14} /> Add New Address
                </button>
              </div>

              {showAddressForm && (
                <div className="mb-6 p-5 bg-bg rounded-xl border border-border animate-fade-up">
                  <h3 className="text-sm font-bold text-dark mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Full Name *</label>
                      <input type="text" value={addressForm.fullName} onChange={e => setAddressForm(p => ({ ...p, fullName: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Phone Number *</label>
                      <input type="tel" value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Province</label>
                      <input type="text" value={addressForm.province} onChange={e => setAddressForm(p => ({ ...p, province: e.target.value }))} className="form-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">District</label>
                      <input type="text" value={addressForm.district} onChange={e => setAddressForm(p => ({ ...p, district: e.target.value }))} className="form-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">City / Municipality *</label>
                      <input type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Ward Number</label>
                      <input type="text" value={addressForm.ward} onChange={e => setAddressForm(p => ({ ...p, ward: e.target.value }))} className="form-input" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-muted mb-1">Street / Tole *</label>
                      <input type="text" value={addressForm.street} onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))} className="form-input" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">House Number</label>
                      <input type="text" value={addressForm.house} onChange={e => setAddressForm(p => ({ ...p, house: e.target.value }))} className="form-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Additional Info</label>
                      <input type="text" value={addressForm.additional} onChange={e => setAddressForm(p => ({ ...p, additional: e.target.value }))} className="form-input" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddress(null) }} className="btn-outline-gold text-sm">Cancel</button>
                    <button type="button" onClick={handleSaveAddress} className="btn-gold text-sm">Save Address</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {addresses.map(addr => {
                  const isSelected = selectedAddressId === addr.id
                  return (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-gold bg-gold-pale/20' : 'border-border hover:border-gold-light bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-[#A9823F]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-dark">{addr.label}</span>
                          {addr.isDefault && <span className="text-[10px] font-semibold text-gold-dark bg-gold-pale px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-sm font-medium text-dark">{addr.fullName}</p>
                        <p className="text-xs text-muted mt-0.5">{addr.phone}</p>
                        <p className="text-sm text-muted mt-1">{addr.address}</p>
                        <p className="text-sm text-muted">{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-sm text-muted">{addr.country}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={(e) => { e.preventDefault(); handleEditAddress(addr) }} className="p-1.5 text-gray-400 hover:text-gold-dark transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); handleDeleteAddress(addr.id) }} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </label>
                  )
                })}
              </div>
              {errors.address && <p className="text-xs text-red-600 mt-2">{errors.address}</p>}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => { if (validateDelivery()) setStep('payment') }}
                  className="btn-gold flex items-center gap-2"
                >
                  Continue to Payment <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                <Truck size={20} className="text-gold-dark" />
                Delivery Method
              </h2>
              <div className="space-y-3">
                {DELIVERY_METHODS.map(method => {
                  const isSelected = deliveryMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setDeliveryMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected ? 'border-gold bg-gold-pale/20' : 'border-border hover:border-gold-light bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-gold text-white' : 'bg-gold-pale text-gold-dark'}`}>
                        <Truck size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark text-sm">{method.name}</h3>
                        <p className="text-xs text-muted mt-0.5">{method.description}</p>
                        {isSelected && <p className="text-xs text-gold-dark font-medium mt-1">Estimated: {method.eta}</p>}
                      </div>
                      <span className="text-sm font-bold text-dark">{method.price === 0 ? 'FREE' : `Rs. ${method.price}`}</span>
                      {isSelected && <CheckCircle2 size={20} className="text-gold-dark flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
              {errors.delivery && <p className="text-xs text-red-600 mt-2">{errors.delivery}</p>}
            </div>

            {/* Payment Method */}
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                <Wallet size={20} className="text-gold-dark" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected ? 'border-gold bg-gold-pale/20' : 'border-border hover:border-gold-light bg-white'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-gold text-white' : 'bg-gold-pale text-gold-dark'}`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark">{method.name}</h3>
                        <p className="text-xs text-muted mt-0.5">{method.description}</p>
                      </div>
                      {isSelected && <CheckCircle2 size={20} className="text-gold-dark flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
              {errors.payment && <p className="text-xs text-red-600 mt-2">{errors.payment}</p>}

              <div className="mt-6 flex justify-between">
                <button type="button" onClick={() => setStep('delivery')} className="btn-outline-gold">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { if (validatePayment()) setStep('review') }}
                  className="btn-gold flex items-center gap-2"
                >
                  Review Order <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Review Order */}
            {step === 'review' && (
              <div className="card p-6 sm:p-8 animate-fade-up">
                <h2 className="text-lg font-bold text-dark mb-6 flex items-center gap-2">
                  <Package size={20} className="text-gold-dark" />
                  Review Your Order
                </h2>

                {/* Shipping Summary */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Shipping To</h3>
                    <button type="button" onClick={() => setStep('delivery')} className="text-xs text-gold-dark hover:text-gold-deep font-medium">Edit</button>
                  </div>
                  <div className="bg-bg rounded-xl p-4 border border-border">
                    {(() => {
                      const addr = addresses.find(a => a.id === selectedAddressId)
                      if (!addr) return <p className="text-sm text-muted">No address selected</p>
                      return (
                        <>
                          <p className="font-semibold text-dark">{addr.fullName}</p>
                          <p className="text-sm text-muted mt-1">{addr.address}</p>
                          <p className="text-sm text-muted">{addr.city}, {addr.state} {addr.postalCode}</p>
                          <p className="text-sm text-muted">{addr.country}</p>
                          <p className="text-sm text-muted mt-1">{addr.phone}</p>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Delivery Summary */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Delivery Method</h3>
                    <button type="button" onClick={() => setStep('delivery')} className="text-xs text-gold-dark hover:text-gold-deep font-medium">Edit</button>
                  </div>
                  <div className="bg-bg rounded-xl p-4 border border-border flex items-center gap-3">
                    <Truck size={20} className="text-gold-dark" />
                    <div>
                      <p className="font-semibold text-dark text-sm">{DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.name}</p>
                      <p className="text-xs text-muted">{DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.eta}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Payment Method</h3>
                    <button type="button" onClick={() => setStep('payment')} className="text-xs text-gold-dark hover:text-gold-deep font-medium">Edit</button>
                  </div>
                  <div className="bg-bg rounded-xl p-4 border border-border flex items-center gap-3">
                    <Wallet size={20} className="text-gold-dark" />
                    <span className="font-semibold text-dark capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                    Order Items ({cart.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {cart.items?.map(item => (
                      <div key={item.product?.id || item.id} className="flex gap-4 p-3 bg-bg rounded-xl border border-border">
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">👗</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark line-clamp-1">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-muted mt-0.5">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="text-sm font-bold text-dark">Rs. {(Number(item.price) * (item.quantity || 1)).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep('payment')} className="btn-outline-gold">
                    Back
                  </button>
                  <button type="submit" disabled={submitting} className="btn-gold flex items-center gap-2">
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="font-black text-dark mb-4 text-lg">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cart.items?.map(item => (
                  <div key={item.product?.id || item.id} className="flex justify-between text-sm">
                    <span className="text-muted truncate pr-2">
                      {item.product?.name || 'Product'} x {item.quantity || 1}
                    </span>
                    <span className="font-semibold text-dark flex-shrink-0">
                      Rs. {(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border mb-3" />
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between text-muted">
                  <span>Subtotal ({cart.items?.length || 0} items)</span>
                  <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-semibold'}>
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Coupon */}
              <div className="border-t border-border pt-3 mb-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{appliedCoupon.code}</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-green-600 hover:text-green-800">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 form-input text-sm"
                      />
                      <button type="button" onClick={handleApplyCoupon} className="btn-outline-gold text-sm px-4">Apply</button>
                    </div>
                    {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="h-px bg-border mb-3" />
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-dark">Total Payable</span>
                <span className="text-xl font-black text-gold-dark">Rs. {total.toLocaleString()}</span>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting || step !== 'review'}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing Order...
                  </>
                ) : (
                  <>
                    Place Order — Rs. {total.toLocaleString()} <ShieldCheck size={18} />
                  </>
                )}
              </button>
              <p className="text-xs text-muted text-center mt-3">Secure checkout powered by Fiora</p>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Secure', icon: ShieldCheck },
                    { label: 'Returns', icon: RotateCcw },
                    { label: 'Support', icon: Phone },
                  ].map(badge => (
                    <div key={badge.label} className="flex flex-col items-center text-center p-2 rounded-lg bg-bg">
                      <badge.icon size={16} className="text-gold-dark mb-1" />
                      <span className="text-[10px] font-medium text-muted">{badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      {step !== 'confirmation' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 lg:hidden">
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs text-muted">Total Payable</p>
              <p className="text-lg font-black text-gold-dark">Rs. {total.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || step !== 'review'}
              className="btn-gold px-6 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
