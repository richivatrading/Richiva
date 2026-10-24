import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap, TrendingUp, Star, Shield, Truck, RotateCcw } from 'lucide-react'
import { getProducts, getCategories } from '../api/products'
import ProductCard from '../components/ProductCard'
import TryOnModal from '../components/TryOnModal'
import { useToast } from '../components/Toast'
import Toast from '../components/Toast'

// ── Carousel slides ───────────────────────────────────────────────
const SLIDES = [
  {
    title: 'New Season Collection',
    subtitle: 'Discover curated ethnic & western fusion wear',
    cta: 'Shop Now',
    to: '/shop',
    gradient: 'linear-gradient(135deg,#2D1B00 0%,#4A2E00 40%,#1A0F00 100%)',
    accent: '#D8B86A',
    tag: 'NEW ARRIVALS',
  },
  {
    title: 'Virtual Try-On',
    subtitle: 'See how any outfit looks on you — before you buy',
    cta: 'Try It Free',
    to: '/tryon',
    gradient: 'linear-gradient(135deg,#0F1F2E 0%,#1A3345 40%,#0A1520 100%)',
    accent: '#C9A45C',
    tag: 'AI FEATURE',
  },
  {
    title: "Women's Ethnic Wear",
    subtitle: 'Premium Lehenga, Saree & Kurta collections',
    cta: 'Explore Collection',
    to: '/shop?cat=ethnic',
    gradient: 'linear-gradient(135deg,#1F0A1A 0%,#3D1535 40%,#130711 100%)',
    accent: '#E8D29A',
    tag: 'TRENDING',
  },
  {
    title: 'Flash Sale — Up to 40% Off',
    subtitle: 'Limited time offers on selected items',
    cta: 'Grab Deals',
    to: '/shop?discount=true',
    gradient: 'linear-gradient(135deg,#1A0A00 0%,#3D1E00 40%,#100800 100%)',
    accent: '#FFD700',
    tag: '⚡ FLASH DEALS',
  },
]

const CATEGORY_ICONS = {
  Women: '👗', Men: '👔', Beauty: '💄', Jewellery: '💎', Shoes: '👡', Bags: '👜', Accessories: '✨', 'New Arrivals': '🆕',
}

const STATIC_CATEGORIES = [
  { name: 'Women',       icon: '👗', slug: 'women' },
  { name: 'Men',         icon: '👔', slug: 'men' },
  { name: 'Beauty',      icon: '💄', slug: 'beauty' },
  { name: 'Jewellery',   icon: '💎', slug: 'jewellery' },
  { name: 'Shoes',       icon: '👡', slug: 'shoes' },
  { name: 'Bags',        icon: '👜', slug: 'bags' },
  { name: 'Accessories', icon: '✨', slug: 'accessories' },
  { name: 'New Arrivals',icon: '🆕', slug: 'newest' },
]

const TRUST_BADGES = [
  { icon: Truck,     label: 'Free Delivery',     sub: 'Orders above Rs. 2,000' },
  { icon: RotateCcw, label: '7-Day Returns',      sub: 'Hassle-free returns' },
  { icon: Shield,    label: 'Secure Payments',    sub: 'Khalti & Cash on Delivery' },
  { icon: Sparkles,  label: 'AI Try-On',          sub: 'Try before you buy' },
]

function ProductSection({ title, icon: Icon, products, onTryOn, viewAllTo, accent }) {
  const { toasts, addToast, removeToast } = useToast()
  const navigate = useNavigate()

  return (
    <section className="py-10">
      <Toast toasts={toasts} onRemove={removeToast} />
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={20} style={{ color: accent || '#A9823F' }} />}
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent || '#A9823F' }}>{title}</span>
          </div>
          <div className="h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${accent||'#A9823F'}, #D8B86A)` }} />
        </div>
        <Link to={viewAllTo || '/shop'} className="text-sm font-semibold text-[#A9823F] hover:text-[#8F6B32] flex items-center gap-1 transition-colors">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton aspect-[3/4]" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, 10).map((p) => (
            <ProductCard key={p.id} product={p} onTryOn={onTryOn} />
          ))}
        </div>
      )}
    </section>
  )
}

export default function HomePage() {
  const [slideIdx, setSlideIdx] = useState(0)
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [tryOnProduct, setTryOnProduct] = useState(null)
  const intervalRef = useRef(null)
  const navigate    = useNavigate()
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    getProducts().then(r => setProducts(r.data?.results || r.data || [])).catch(() => {})
    getCategories().then(r => setCategories(r.data || [])).catch(() => {})
  }, [])

  // auto-advance carousel
  useEffect(() => {
    intervalRef.current = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const slide = SLIDES[slideIdx]

  const goSlide = (dir) => {
    clearInterval(intervalRef.current)
    setSlideIdx(i => (i + dir + SLIDES.length) % SLIDES.length)
    intervalRef.current = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), 5000)
  }

  // product sections
  const newest   = [...products].sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
  const trending = [...products].sort(() => Math.random() - 0.5)
  const deals    = [...products].filter((_, i) => i % 3 === 0)

  return (
    <div className="pb-20 lg:pb-0">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* ── Hero Carousel ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: slide.gradient, minHeight: 420, transition: 'background 0.6s ease' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex items-center justify-end pr-16">
          <span className="text-[12rem] font-black tracking-widest text-white leading-none">FIORA</span>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-20 md:py-28 carousel-slide" key={slideIdx}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold tracking-widest border" style={{ borderColor: slide.accent, color: slide.accent }}>
            {slide.tag}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 max-w-xl leading-tight">{slide.title}</h1>
          <p className="text-white/70 text-lg mb-8 max-w-md">{slide.subtitle}</p>
          <Link to={slide.to} className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-[#171717] transition-all hover:scale-105 hover:shadow-2xl" style={{ background: `linear-gradient(135deg, ${slide.accent}, #fff9 180%)`, boxShadow: `0 8px 30px ${slide.accent}55` }}>
            {slide.cta} <ArrowRight size={18} />
          </Link>
        </div>

        {/* Controls */}
        <button onClick={() => goSlide(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => goSlide(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} className="rounded-full transition-all" style={{ width: i === slideIdx ? 24 : 8, height: 8, background: i === slideIdx ? slide.accent : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      </section>

      {/* ── Trust badges ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E5E0D8]">
        <div className="max-w-[1400px] mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#F5EDD8,#E8D29A)' }}>
                <Icon size={18} style={{ color: '#A9823F' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category grid ─────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900">Shop by Category</h2>
          <div className="gold-divider mx-auto mt-2" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {(categories.length > 0 ? categories.map(c => ({ name: c.name, icon: CATEGORY_ICONS[c.name] || '✨', slug: c.slug || c.name.toLowerCase(), id: c.id })) : STATIC_CATEGORIES).map((cat) => (
            <Link
              key={cat.name}
              to={cat.id ? `/categories/${cat.id}` : `/shop?cat=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#C9A45C] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg,#F5EDD8,#E8D29A)' }}>
                {cat.icon}
              </div>
              <span className="text-[11px] font-semibold text-gray-700 group-hover:text-[#A9823F] text-center leading-tight transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Flash Deals ───────────────────────────────────────────── */}
      <section className="py-6 px-6 bg-gradient-to-r from-[#1A0A00] to-[#3D1E00]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={24} className="text-[#FFD700]" />
            <span className="text-xl font-black text-white">Flash Deals</span>
            <div className="flex items-center gap-1 ml-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-bold text-red-300">LIVE</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(deals.length > 0 ? deals : [...Array(5)]).slice(0, 5).map((p, i) => (
              p?.id ? (
                <div key={p.id} className="product-card bg-white/10 backdrop-blur-sm border border-white/10">
                  <Link to={`/product/${p.id}`} className="block">
                    <div className="relative aspect-[3/4] bg-[#F5EDD8]/10 overflow-hidden rounded-t-2xl">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                      <div className="absolute top-2 left-2 badge-gold">-25%</div>
                    </div>
                    <div className="p-3">
                      <p className="text-white/90 text-sm font-semibold line-clamp-2">{p.name}</p>
                      <p className="text-[#D8B86A] font-black text-base mt-1">Rs. {Number(p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                </div>
              ) : (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-3 space-y-2 bg-white/5">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/shop?discount=true" className="btn-gold px-8 py-3 rounded-full text-sm">
              View All Flash Deals <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promo Strip ───────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/tryon" className="group relative overflow-hidden rounded-2xl p-8 min-h-[200px] flex flex-col justify-between cursor-pointer" style={{ background: 'linear-gradient(135deg,#1A0A00,#4A2200)' }}>
            <div>
              <span className="badge-gold mb-3 inline-block">AI FEATURE</span>
              <h3 className="text-2xl font-black text-white mb-2">Virtual Try-On</h3>
              <p className="text-white/60 text-sm">See it on you before you buy</p>
            </div>
            <div className="flex items-center gap-2 text-[#D8B86A] text-sm font-bold group-hover:gap-3 transition-all">
              <Sparkles size={16} /> Try Now <ArrowRight size={14} />
            </div>
            <div className="absolute right-6 top-6 text-[80px] opacity-10 select-none">✨</div>
          </Link>

          <Link to="/shop?sort=newest" className="group relative overflow-hidden rounded-2xl p-8 min-h-[200px] flex flex-col justify-between cursor-pointer" style={{ background: 'linear-gradient(135deg,#0A1520,#1A3550)' }}>
            <div>
              <span className="badge-new mb-3 inline-block">NEW IN</span>
              <h3 className="text-2xl font-black text-white mb-2">New Arrivals</h3>
              <p className="text-white/60 text-sm">Fresh styles just dropped</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold group-hover:gap-3 transition-all">
              <Star size={16} /> Explore <ArrowRight size={14} />
            </div>
            <div className="absolute right-6 top-6 text-[80px] opacity-10 select-none">👗</div>
          </Link>
        </div>
      </section>

      {/* ── Product sections ──────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6">
        <ProductSection title="Trending Now" icon={TrendingUp} products={trending} onTryOn={setTryOnProduct} viewAllTo="/shop?sort=trending" accent="#A9823F" />
        <ProductSection title="New Arrivals"  icon={Star}       products={newest}   onTryOn={setTryOnProduct} viewAllTo="/shop?sort=newest" accent="#059669" />
      </div>

      {/* ── Try-On CTA Banner ─────────────────────────────────────── */}
      <section className="my-4 mx-6 md:mx-auto md:max-w-[1400px] rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#A9823F 0%,#D8B86A 50%,#B88A42 100%)' }}>
        <div className="px-8 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Fiora AI</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Try On Any Product</h2>
            <p className="text-white/80 text-base max-w-md">
              Upload your photo and see how any garment looks on you — powered by AI. Free, instant, no app required.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/tryon" className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#A9823F] font-bold text-sm hover:bg-[#FAF9F6] transition-all hover:shadow-xl hover:-translate-y-0.5">
              <Sparkles size={18} /> Try It Now
            </Link>
            <Link to="/shop" className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white font-bold text-sm hover:bg-white/10 transition-colors">
              Shop All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6">
        <ProductSection title="Best Sellers" icon={Star} products={products} onTryOn={setTryOnProduct} viewAllTo="/shop" accent="#7C3AED" />
      </div>

      {/* Try-On Modal */}
      {tryOnProduct && (
        <TryOnModal
          product={tryOnProduct}
          onClose={() => setTryOnProduct(null)}
          onAddToCart={() => {}}
          addToCartToast={() => addToast('Added to cart!', 'success')}
        />
      )}
    </div>
  )
}
