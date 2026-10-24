import { Link, useLocation } from 'react-router-dom'
import { Home, Grid, ShoppingCart, Heart, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const ITEMS = [
  { icon: Home,         label: 'Home',       to: '/' },
  { icon: Grid,         label: 'Categories', to: '/categories' },
  { icon: ShoppingCart, label: 'Cart',       to: '/cart', badge: 'cart' },
  { icon: Heart,        label: 'Wishlist',   to: '/wishlist', badge: 'wish' },
  { icon: User,         label: 'Account',    to: '/account' },
]

export default function MobileBottomNav() {
  const location = useLocation()
  const { cart } = useCart()
  const { wishlist } = useWishlist()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E0D8] flex lg:hidden safe-bottom">
      {ITEMS.map(({ icon: Icon, label, to, badge }) => {
        const active = location.pathname === to
        const count = badge === 'cart' ? cart?.count : badge === 'wish' ? wishlist?.length : 0
        return (
          <Link key={to} to={to} className={`mob-nav-item ${active ? 'active' : ''}`}>
            <div className="relative">
              <Icon size={20} className={active ? 'text-[#A9823F]' : 'text-gray-400'} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 text-[9px] font-black rounded-full flex items-center justify-center" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)', color:'#fff' }}>
                  {count}
                </span>
              )}
            </div>
            <span className={active ? 'text-[#A9823F]' : ''}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
