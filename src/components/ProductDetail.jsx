import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduct } from '../api/products'
import { Heart, Star, Truck, Shield, RotateCcw, CheckCircle, ChevronRight, X, Minus, Plus, ShoppingCart, Share2, Sparkles, ArrowLeft } from 'lucide-react'
import Toast, { useToast } from './Toast'
import SizeGuideModal from './SizeGuideModal'
import TryOnModal from './TryOnModal'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

const MOCK_SIZES = ['XS', 'S', 'M', 'L', 'XL']

const MOCK_COLORS = [
  { name: 'Gold', hex: '#C9A45C' },
  { name: 'Black', hex: '#171717' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Rose', hex: '#E8B4B8' },
]

const MOCK_REVIEWS = [
  { id: 1, name: 'Priya Sharma', rating: 5, text: 'Loved the fit and fabric. The finish is absolutely gorgeous!', date: '2026-08-05', verified: true },
  { id: 2, name: 'Anita Gurung', rating: 5, text: 'Beautiful piece for weddings. The color is exactly as shown.', date: '2026-07-28', verified: true },
  { id: 3, name: 'Sneha Thapa', rating: 4, text: 'Nice quality. Slightly long but overall very happy with the purchase.', date: '2026-07-20', verified: true },
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { requireAuth } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(MOCK_COLORS[0])
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showTryOn, setShowTryOn] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const { toasts, addToast, removeToast } = useToast()

  const wishlisted = product ? isWishlisted(product.id) : false

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)
    getProduct(id)
      .then(res => setProduct(res.data))
      .catch(() => { setError(true); setProduct(null) })
      .finally(() => setLoading(false))
  }, [id])

  const productImages = product?.image
    ? [product.image, product.image, product.image, product.image]
    : []

  const price = Number(product?.price || 0)
  const origPrice = Math.round(price / 0.78)
  const discount = Math.round(((origPrice - price) / origPrice) * 100)

  const handleAddToCart = async () => {
    if (!selectedSize) { addToast('Please select a size', 'error'); return }
    const ok = requireAuth()
    if (!ok) return
    try {
      await addToCart(id, quantity)
      addToast('Added to cart!', 'success')
    } catch {
      addToast('Failed to add to cart', 'error')
    }
  }

  const handleBuyNow = async () => {
    if (!selectedSize) { addToast('Please select a size', 'error'); return }
    const ok = requireAuth()
    if (!ok) return
    try {
      await addToCart(id, quantity)
      navigate('/cart')
    } catch {
      addToast('Failed to proceed', 'error')
    }
  }

  const handleWishlist = () => {
    if (!product) return
    toggle(product)
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', wishlisted ? 'info' : 'success')
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        addToast('Link copied!', 'success')
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4 pt-4">
            <div className="skeleton h-5 w-24 rounded" />
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-40 rounded" />
            <div className="skeleton h-12 w-full rounded-xl mt-8" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Product not found</h2>
        <Link to="/shop" className="btn-gold mt-4 inline-flex">Back to Shop</Link>
      </div>
    )
  }

  return (
    <div className="pb-24 lg:pb-8 bg-[#FAF9F6]">
      <Toast toasts={toasts} onRemove={removeToast} />
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
      {showTryOn && (
        <TryOnModal
          product={product}
          onClose={() => setShowTryOn(false)}
          onAddToCart={handleAddToCart}
          addToCartToast={() => addToast('Added to cart!', 'success')}
        />
      )}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setShowFullscreen(false)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white"><X size={32} /></button>
          <img src={productImages[selectedImage]} alt={product.name} className="max-w-full max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-[#A9823F]">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-[#A9823F]">Shop</Link>
          <ChevronRight size={14} />
          {product.category?.name && (
            <>
              <Link to={`/categories/${product.category.id}`} className="hover:text-[#A9823F]">{product.category.name}</Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Image Gallery ────────────────────────────────── */}
          <div>
            <div className="relative bg-white rounded-2xl overflow-hidden border border-[#E5E0D8] mb-3 aspect-square group cursor-pointer" onClick={() => setShowFullscreen(true)}>
              {productImages.length > 0 ? (
                <img src={productImages[selectedImage]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#E8D29A] text-5xl font-black">FIORA</div>
              )}
              {discount > 0 && <div className="absolute top-4 left-4 badge-discount text-sm px-3 py-1">-{discount}%</div>}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={e => { e.stopPropagation(); handleWishlist() }} className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center transition-all hover:scale-110">
                  <Heart size={18} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
                <button onClick={e => { e.stopPropagation(); handleShare() }} className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-400 hover:text-[#A9823F] transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
            {/* Thumbnails */}
            {productImages.length > 0 && (
              <div className="flex gap-2">
                {productImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-[#C9A45C] shadow-md' : 'border-[#E5E0D8] opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ─────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5">
              {/* Brand & Name */}
              <div>
                <p className="text-xs font-bold text-[#A9823F] uppercase tracking-widest mb-1">Fiora</p>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{product.category?.name || 'Fashion'}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= 4 ? 'star-filled' : 'star-empty'} />)}
                </div>
                <span className="text-sm font-bold text-gray-900">4.8</span>
                <span className="text-sm text-gray-400">(124 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">Rs. {price.toLocaleString()}</span>
                <span className="text-lg text-gray-400 line-through">Rs. {origPrice.toLocaleString()}</span>
                {discount > 0 && <span className="badge-discount text-sm">{discount}% OFF</span>}
              </div>
              <p className="text-xs text-gray-400 -mt-3">Inclusive of all taxes</p>

              <div className="h-px bg-[#E5E0D8]" />

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-900">Select Size</label>
                  <button onClick={() => setShowSizeGuide(true)} className="text-xs text-[#A9823F] font-semibold hover:underline">Size Guide</button>
                </div>
                <div className="flex gap-2">
                  {MOCK_SIZES.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-[3rem] px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSize === size ? 'text-white shadow-md' : 'bg-white border border-[#E5E0D8] text-gray-700 hover:border-[#C9A45C] hover:text-[#A9823F]'}`} style={selectedSize === size ? { background:'linear-gradient(135deg,#A9823F,#D8B86A)' } : {}}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-3 block">Color: <span className="font-normal text-gray-500">{selectedColor.name}</span></label>
                <div className="flex gap-3">
                  {MOCK_COLORS.map(color => (
                    <button key={color.name} onClick={() => setSelectedColor(color)} className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor.name === color.name ? 'border-[#A9823F] scale-110 shadow-md' : 'border-[#E5E0D8] hover:border-gray-400'}`} style={{ backgroundColor: color.hex }} title={color.name} />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-gray-900">Qty</label>
                <div className="flex items-center border border-[#E5E0D8] rounded-xl overflow-hidden bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="px-3 py-2 text-gray-500 hover:bg-[#F5EDD8] transition-colors"><Minus size={15} /></button>
                  <span className="px-4 py-2 font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock||99, quantity+1))} className="px-3 py-2 text-gray-500 hover:bg-[#F5EDD8] transition-colors"><Plus size={15} /></button>
                </div>
                <span className="text-xs text-gray-400">{product.stock || 99} available</span>
              </div>

              {/* AI Try-On banner */}
              <div className="rounded-2xl p-4 border border-[#E5E0D8] bg-[#FDFBF5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'linear-gradient(135deg,#F5EDD8,#E8D29A)' }}>
                  <Sparkles size={18} style={{ color:'#A9823F' }} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">AI Virtual Try-On</h4>
                  <p className="text-xs text-gray-500">See how this looks on you before buying</p>
                </div>
                <button onClick={() => setShowTryOn(true)} className="text-xs font-bold text-[#A9823F] hover:text-[#8F6B32] whitespace-nowrap">Try Now →</button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button onClick={() => setShowTryOn(true)} className="w-14 h-14 rounded-2xl bg-white border-2 border-[#C9A45C] text-[#A9823F] flex items-center justify-center hover:bg-[#F5EDD8] transition-all flex-shrink-0" title="Virtual Try-On">
                  <Sparkles size={22} />
                </button>
                <button onClick={handleAddToCart} className="flex-1 btn-gold py-4 text-base flex items-center justify-center gap-2">
                  <ShoppingCart size={20} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-1 btn-outline-gold py-4 text-base font-bold">
                  Buy Now
                </button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: Truck, label: 'Free Delivery', sub: 'Above Rs. 2,000' },
                  { icon: RotateCcw, label: '7-Day Returns', sub: 'Easy exchange' },
                  { icon: Shield, label: 'Secure Pay', sub: 'Khalti & COD' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="text-center p-3 rounded-xl bg-white border border-[#E5E0D8]">
                    <Icon size={18} className="mx-auto mb-1" style={{ color:'#A9823F' }} />
                    <p className="text-xs font-bold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs: Details / Reviews ───────────────────────── */}
        <div className="mt-12 border-t border-[#E5E0D8] pt-8">
          <div className="flex gap-6 mb-6 border-b border-[#E5E0D8]">
            {['details','reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab ? 'text-[#A9823F] border-[#C9A45C]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                {tab === 'details' ? 'Product Details' : `Reviews (${MOCK_REVIEWS.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="max-w-3xl animate-fade-up">
              <h3 className="font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description || 'Premium quality fashion piece from Fiora collection. Crafted with attention to detail for a perfect fit and luxurious feel.'}</p>
              <h3 className="font-bold text-gray-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Material','Premium fabric'], ['Fit','Regular fit'], ['Occasion','Casual, Party, Wedding'],
                  ['Sleeve','Varies'], ['Pattern','As shown'], ['Care','Dry clean recommended'],
                ].map(([k,v]) => (
                  <div key={k} className="p-3 rounded-xl bg-white border border-[#E5E0D8]">
                    <p className="text-xs text-gray-400 font-semibold">{k}</p>
                    <p className="text-sm text-gray-800 font-medium">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl animate-fade-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center px-6 py-4 rounded-2xl bg-white border border-[#E5E0D8]">
                  <p className="text-3xl font-black text-gray-900">4.8</p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= 5 ? 'star-filled' : 'star-empty'} />)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">124 reviews</p>
                </div>
              </div>
              <div className="space-y-4">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
                        {review.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{review.name}</h4>
                          {review.verified && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'#FFF7ED', color:'#A9823F' }}>Verified</span>}
                        </div>
                        <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= review.rating ? 'star-filled' : 'star-empty'} />)}</div>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8" />
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E0D8] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 lg:hidden p-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowTryOn(true)} className="w-14 h-14 rounded-2xl border-2 border-[#C9A45C] text-[#A9823F] flex items-center justify-center hover:bg-[#F5EDD8] transition-colors flex-shrink-0">
            <Sparkles size={20} />
          </button>
          <button onClick={handleAddToCart} className="flex-1 btn-gold py-3.5 text-sm">
            <ShoppingCart size={16} className="inline mr-1.5" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
