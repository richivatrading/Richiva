import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, Search, User, X, Menu, ChevronDown, Sparkles, LogOut, Package, MapPin, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { getProducts, getCategories } from '../api/products'

const NAV_LINKS = [
  { label: 'Home',        to: '/' },
  { label: 'Shop',        to: '/shop' },
  { label: 'Categories',  to: '/categories' },
  { label: 'New Arrivals',to: '/shop?sort=newest' },
  { label: 'Offers',      to: '/shop?discount=true' },
]

export default function Header() {
  const { user, logout, setAuthModal } = useAuth()
  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fiora_recent_searches') || '[]') } catch { return [] }
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const userMenuRef = useRef(null)
  const debounceRef = useRef(null)

  // close on route change
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); setUserMenuOpen(false) }, [location.pathname])

  // outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    setSearchLoading(true)
    try {
      const res = await getProducts({ search: q })
      setSearchResults((res.data?.results || res.data || []).slice(0, 6))
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(q), 300)
  }

  const commitSearch = (q = searchQuery) => {
    if (!q.trim()) return
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('fiora_recent_searches', JSON.stringify(updated))
    setSearchOpen(false)
    setSearchQuery('')
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('fiora_recent_searches')
  }

  const cartCount = cart?.count || 0
  const wishCount = wishlist?.length || 0

  return (
    <>
      {/* ── Top Strip ──────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg,#A9823F 0%,#D8B86A 50%,#B88A42 100%)' }} className="text-white text-center text-xs py-2 px-4 font-medium tracking-wide">
        ✨ Free Delivery on orders above Rs. 2,000 &nbsp;|&nbsp; Use code <strong>FIORA10</strong> for 10% off &nbsp;|&nbsp; Try On before you Buy!
      </div>

      {/* ── Main Header ────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#E5E0D8] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt="Fiora" className="h-9 w-auto" onError={e => { e.target.style.display='none' }} />
            <span className="text-xl font-black tracking-widest text-gold-gradient hidden sm:block" style={{
              background:'linear-gradient(135deg,#A9823F,#D8B86A,#A9823F)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'
            }}>FIORA</span>
          </Link>

          {/* Search Bar — Desktop */}
          <div className="flex-1 max-w-2xl hidden md:block" ref={searchRef}>
            <div className="relative">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
                placeholder="Search for products, categories, brands..."
                className="w-full pl-11 pr-10 py-2.5 rounded-xl border-2 border-[#E5E0D8] bg-[#FAF9F6] text-sm focus:border-[#C9A45C] focus:bg-white transition-all outline-none"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}

              {/* Dropdown */}
              {searchOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] z-50 overflow-hidden animate-slide-down">
                  {/* Loading */}
                  {searchLoading && (
                    <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
                  )}

                  {/* Results */}
                  {!searchLoading && searchResults.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">Products</p>
                      {searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { commitSearch(p.name); navigate(`/product/${p.id}`) }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F5EDD8] transition-colors text-left"
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#F5EDD8] flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-500">Rs. {Number(p.price).toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                      <button
                        onClick={() => commitSearch()}
                        className="w-full text-center text-xs font-semibold text-[#A9823F] py-2 hover:underline"
                      >
                        View all results for "{searchQuery}" →
                      </button>
                    </div>
                  )}

                  {/* Empty */}
                  {!searchLoading && searchQuery && searchResults.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">No results for "<strong>{searchQuery}</strong>"</p>
                      <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                    </div>
                  )}

                  {/* Recent */}
                  {!searchQuery && recentSearches.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-3 py-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent Searches</p>
                        <button onClick={clearRecent} className="text-xs text-[#A9823F] hover:underline">Clear</button>
                      </div>
                      {recentSearches.map((r) => (
                        <button
                          key={r}
                          onClick={() => commitSearch(r)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F5EDD8] transition-colors text-left"
                        >
                          <Search size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{r}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions when empty & no recent */}
                  {!searchQuery && recentSearches.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-400">
                      Start typing to search for products...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">

            {/* Search icon — mobile */}
            <Link to="/search" className="md:hidden p-2 rounded-xl hover:bg-[#F5EDD8] text-gray-600 hover:text-[#A9823F] transition-colors">
              <Search size={20} />
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 rounded-xl hover:bg-[#F5EDD8] text-gray-600 hover:text-[#A9823F] transition-colors hidden sm:flex items-center">
              <Heart size={20} />
              {wishCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">{wishCount}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-[#F5EDD8] text-gray-600 hover:text-[#A9823F] transition-colors flex items-center">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[1rem] h-4 text-[10px] font-bold px-1 rounded-full flex items-center justify-center" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)', color:'#fff' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Virtual try-on pill */}
            <Link to="/tryon" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#C9A45C] text-[#A9823F] hover:bg-[#F5EDD8] transition-colors">
              <Sparkles size={13} />
              Try On
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[#F5EDD8] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
                    {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate">{user.first_name || 'Account'}</span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] overflow-hidden animate-slide-down z-50">
                    <div className="p-3 border-b border-[#F5EDD8]">
                      <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {[
                      { icon: User,    label: 'My Account', to: '/account' },
                      { icon: Package, label: 'My Orders',  to: '/orders' },
                      { icon: Heart,   label: 'Wishlist',   to: '/wishlist' },
                      { icon: Sparkles,label: 'Try-On History', to: '/tryon' },
                    ].map(({ icon: Icon, label, to }) => (
                      <Link key={label} to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5EDD8] hover:text-[#A9823F] transition-colors">
                        <Icon size={16} />
                        {label}
                      </Link>
                    ))}
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F5EDD8] hover:text-[#A9823F] transition-colors border-t border-[#F5EDD8]">
                        <Settings size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-[#F5EDD8]"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => setAuthModal('signin')} className="text-sm font-semibold text-[#A9823F] hover:text-[#8F6B32] transition-colors px-3 py-1.5">
                  Login
                </button>
                <button onClick={() => setAuthModal('signup')} className="btn-gold text-sm py-2 px-4">
                  Register
                </button>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#F5EDD8] text-gray-600 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Category nav strip ─────────────────────────────────────── */}
        <div className="hidden lg:block border-t border-[#F0EBE0]">
          <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-6 h-10">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`text-sm font-medium whitespace-nowrap transition-colors pb-0.5 ${
                  location.pathname === to.split('?')[0]
                    ? 'text-[#A9823F] border-b-2 border-[#C9A45C]'
                    : 'text-gray-600 hover:text-[#A9823F]'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#A9823F]">
              <Sparkles size={13} />
              <Link to="/tryon" className="hover:underline">AI Virtual Try-On</Link>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#E5E0D8] bg-white animate-slide-down">
            <div className="p-4 space-y-1">
              {/* Mobile Search */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] text-sm outline-none focus:border-[#C9A45C]"
                  onKeyDown={(e) => e.key === 'Enter' && commitSearch(e.target.value)}
                />
              </div>
              {NAV_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#F5EDD8] hover:text-[#A9823F] transition-colors">
                  {label}
                </Link>
              ))}
              <Link to="/tryon" className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-[#A9823F] hover:bg-[#F5EDD8] transition-colors">
                ✨ AI Virtual Try-On
              </Link>
              <div className="border-t border-[#E5E0D8] pt-3 mt-2">
                {user ? (
                  <>
                    <Link to="/account" className="block py-2.5 px-3 rounded-xl text-sm text-gray-700 hover:bg-[#F5EDD8] hover:text-[#A9823F]">My Account</Link>
                    <Link to="/orders"  className="block py-2.5 px-3 rounded-xl text-sm text-gray-700 hover:bg-[#F5EDD8] hover:text-[#A9823F]">My Orders</Link>
                    <Link to="/wishlist" className="block py-2.5 px-3 rounded-xl text-sm text-gray-700 hover:bg-[#F5EDD8] hover:text-[#A9823F]">Wishlist</Link>
                    <button onClick={logout} className="w-full text-left py-2.5 px-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">Logout</button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setAuthModal('signin'); setMobileOpen(false) }} className="flex-1 btn-outline-gold text-sm py-2.5">Login</button>
                    <button onClick={() => { setAuthModal('signup'); setMobileOpen(false) }} className="flex-1 btn-gold text-sm py-2.5">Register</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
