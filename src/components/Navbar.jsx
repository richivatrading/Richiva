import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, Search, User, X, Menu } from 'lucide-react'

export default function Navbar({ user, onLogout, cartCount, onShowSignIn, onShowSignUp }) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleAiTryOn = () => {
    window.dispatchEvent(new CustomEvent('open-try-on'))
    setMobileMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('search-query', { detail: searchQuery.trim() }))
    }
  }

  useEffect(() => {
    const handler = (e) => {
      setSearchQuery(e.detail)
    }
    window.addEventListener('search-query', handler)
    return () => window.removeEventListener('search-query', handler)
  }, [])

  return (
    <nav className="flex justify-between items-center px-4 md:px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="FIORA" className="h-10 w-auto" />
        <span className="text-xl font-semibold text-primary tracking-wide hidden sm:block">FIORA</span>
      </Link>

      <div className="hidden lg:flex gap-6 text-sm font-medium">
        <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>
        <Link to="/products" className="text-gray-700 hover:text-primary transition-colors">Shop</Link>
        <Link to="/categories" className="text-gray-700 hover:text-primary transition-colors">Categories</Link>
        <Link to="/products" className="text-gray-700 hover:text-primary transition-colors">New Arrivals</Link>
        <Link to="/products" className="text-gray-700 hover:text-primary transition-colors">Offers</Link>
        <button onClick={handleAiTryOn} className="text-primary hover:text-primary-dark transition-colors font-semibold">
          AI Try-On
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="text-gray-600 hover:text-primary transition-colors">
            <Search size={20} />
          </button>
          {showSearch && (
            <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48"
                autoFocus
              />
              <button type="button" onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </form>
          )}
        </div>

        <button className="text-gray-600 hover:text-primary transition-colors hidden sm:block">
          <Heart size={20} />
        </button>

        <Link to="/cart" className="relative">
          <ShoppingCart className="text-gray-600 hover:text-primary transition-colors" size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <div className="hidden md:flex items-center gap-3">
            <User className="text-gray-600" size={20} />
            <span className="text-sm text-gray-700 max-w-[120px] truncate">{user.email}</span>
            <button onClick={onLogout} className="text-sm text-primary hover:text-primary-dark font-medium">
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden md:flex gap-2">
            <button onClick={onShowSignIn} className="text-sm text-primary hover:text-primary-dark font-medium">
              Login
            </button>
            <button onClick={onShowSignUp} className="bg-primary text-black text-sm font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
              Register
            </button>
          </div>
        )}

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-gray-600 hover:text-primary transition-colors">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg lg:hidden animate-fade-in">
          <div className="flex flex-col p-4 gap-3 text-sm font-medium">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2">Shop</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2">Categories</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2">New Arrivals</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-primary py-2">Offers</Link>
            <button onClick={handleAiTryOn} className="text-primary hover:text-primary-dark py-2 text-left font-semibold">AI Try-On</button>
            {user ? (
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="text-primary hover:text-primary-dark py-2 text-left">Logout</button>
            ) : (
              <>
                <button onClick={() => { onShowSignIn(); setMobileMenuOpen(false); }} className="text-primary hover:text-primary-dark py-2 text-left">Login</button>
                <button onClick={() => { onShowSignUp(); setMobileMenuOpen(false); }} className="bg-primary text-black font-semibold py-2 px-4 rounded-lg text-center">Register</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
