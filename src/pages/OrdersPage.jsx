import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Clock, CheckCircle, Truck, Star } from 'lucide-react'
import { getOrders } from '../api/orders'
import { useAuth } from '../context/AuthContext'

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  CONFIRMED:  { label: 'Confirmed',  color: '#3B82F6', bg: '#EFF6FF', icon: CheckCircle },
  PROCESSING: { label: 'Processing', color: '#8B5CF6', bg: '#F5F3FF', icon: Clock },
  SHIPPED:    { label: 'Shipped',    color: '#06B6D4', bg: '#ECFEFF', icon: Truck },
  DELIVERED:  { label: 'Delivered',  color: '#10B981', bg: '#F0FDF4', icon: CheckCircle },
  PAID:       { label: 'Paid',       color: '#10B981', bg: '#F0FDF4', icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',  color: '#EF4444', bg: '#FEF2F2', icon: Clock },
}

export default function OrdersPage() {
  const { user, setAuthModal } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) { setLoading(false); return }
    getOrders()
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!localStorage.getItem('token')) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
        <Package size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Login to view orders</h2>
        <button onClick={() => setAuthModal('signin')} className="btn-gold px-8 mt-4">Login</button>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 pb-24 lg:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
        <div className="gold-divider mt-1" />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-500 text-sm mb-6">When you place an order, it'll show up here</p>
          <Link to="/shop" className="btn-gold px-8">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
            const StatusIcon = cfg.icon
            const date = order.created_at ? new Date(order.created_at).toLocaleDateString('en-NP', { year:'numeric', month:'short', day:'numeric' }) : ''
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={16} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-900">Order #FI-{String(order.id).padStart(5,'0')}</span>
                    </div>
                    <p className="text-xs text-gray-500">{date}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                    <p className="text-lg font-black" style={{ color: '#A9823F' }}>Rs. {Number(order.total || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Delivery steps */}
                {order.status !== 'CANCELLED' && (
                  <div className="mt-4 pt-4 border-t border-[#F0EAE0]">
                    <div className="flex items-center gap-0">
                      {['PENDING','CONFIRMED','SHIPPED','DELIVERED'].map((s, i, arr) => {
                        const statuses = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','PAID','DELIVERED']
                        const currentIdx = statuses.indexOf(order.status)
                        const stepMap = { 'PENDING':0, 'CONFIRMED':1, 'SHIPPED':2, 'DELIVERED':3 }
                        const stepIdx = stepMap[s]
                        const curStep = stepMap[order.status] ?? stepMap['PENDING']
                        const done = curStep >= stepIdx
                        return (
                          <div key={s} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full border-2 transition-colors" style={{ borderColor: done ? '#A9823F' : '#E5E0D8', background: done ? '#A9823F' : '#fff' }} />
                              <span className="text-[9px] text-gray-400 mt-1 whitespace-nowrap font-medium">{s.charAt(0)+s.slice(1).toLowerCase()}</span>
                            </div>
                            {i < arr.length - 1 && (
                              <div className="flex-1 h-0.5 mx-1 rounded" style={{ background: done && curStep > stepIdx ? '#A9823F' : '#E5E0D8' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
