import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider, useCart } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

import Header from './components/Header'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import AuthModals from './components/AuthModals'

import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import SearchPage from './pages/SearchPage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './components/ProductDetail'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import OrdersPage from './pages/OrdersPage'
import AccountPage from './pages/AccountPage'
import TryOnPage from './pages/TryOnPage'
import AdminDashboard from './components/AdminDashboard'
import CheckoutPage from './pages/CheckoutPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function CartLoader() {
  const { refreshCart } = useCart()
  const { user } = useAuth()
  useEffect(() => {
    if (user) refreshCart()
  }, [user, refreshCart])
  return null
}

function AppContent() {
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <ScrollToTop />
      <CartLoader />
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? 'flex-1 flex flex-col h-full h-screen' : 'flex-1'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:id" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/products" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/*" element={<AccountPage />} />
          <Route path="/tryon" element={<TryOnPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={
            <div className="text-center py-20">
              <div className="text-6xl mb-4">404</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Page not found</h2>
              <a href="/" className="btn-gold mt-4 inline-flex">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileBottomNav />}
      <AuthModals />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
