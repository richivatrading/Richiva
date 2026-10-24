import { useNavigate, Link } from 'react-router-dom'
import { User, Package, Heart, Sparkles, Settings, LogOut, ChevronRight, MapPin, Bell, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MENU_ITEMS = [
  { icon: Package,  label: 'My Orders',     sub: 'Track and manage your orders',   to: '/orders' },
  { icon: Heart,    label: 'Wishlist',       sub: 'View your saved items',          to: '/wishlist' },
  { icon: Sparkles, label: 'Try-On History', sub: 'Browse your AI try-on sessions', to: '/tryon' },
  { icon: MapPin,   label: 'Addresses',      sub: 'Manage delivery addresses',      to: '/account/addresses' },
  { icon: Bell,     label: 'Notifications',  sub: 'Manage notification settings',   to: '/account/notifications' },
  { icon: Settings, label: 'Settings',       sub: 'Account settings & security',    to: '/account/settings' },
]

export default function AccountPage() {
  const { user, logout, setAuthModal } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#F5EDD8,#E8D29A)' }}>
          <User size={36} style={{ color: '#A9823F' }} />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Welcome to Fiora</h2>
        <p className="text-gray-500 text-sm mb-6">Login or create an account to manage your orders, wishlist, and more</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => setAuthModal('signin')} className="btn-gold px-8">Login</button>
          <button onClick={() => setAuthModal('signup')} className="btn-outline-gold px-8">Create Account</button>
        </div>
      </div>
    )
  }

  const initial = (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-24 lg:pb-8">
      {/* Profile header */}
      <div className="card p-6 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0" style={{ background: 'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-gray-900">{user.first_name} {user.last_name}</h2>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
        </div>
        <div className="badge-gold">{user.role}</div>
      </div>

      {/* Menu items */}
      <div className="card overflow-hidden divide-y divide-[#F5EDD8]">
        {MENU_ITEMS.map(({ icon: Icon, label, sub, to }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-4 p-4 hover:bg-[#FAF9F6] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg,#F5EDD8,#E8D29A)' }}>
              <Icon size={18} style={{ color: '#A9823F' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#A9823F] transition-colors">{label}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#A9823F] group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {user.role === 'ADMIN' && (
        <Link to="/admin" className="card mt-4 p-4 flex items-center gap-4 hover:bg-[#FAF9F6] transition-colors group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
            <Settings size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Admin Dashboard</p>
            <p className="text-xs text-gray-500">Manage products, orders & analytics</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
      )}

      <button
        onClick={() => { logout(); navigate('/') }}
        className="mt-4 w-full card p-4 flex items-center gap-4 hover:bg-red-50 transition-colors group text-left"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50">
          <LogOut size={18} className="text-red-400" />
        </div>
        <span className="text-sm font-semibold text-red-500">Logout</span>
      </button>
    </div>
  )
}
