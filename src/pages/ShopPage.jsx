import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, ChevronUp, X, Search } from 'lucide-react'
import { getProducts, getCategories } from '../api/products'
import ProductCard from '../components/ProductCard'
import TryOnModal from '../components/TryOnModal'
import Toast, { useToast } from '../components/Toast'

const SORT_OPTIONS = [
  { value: 'popular',   label: 'Most Popular' },
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc',label: 'Price: High → Low' },
  { value: 'discount',  label: 'Biggest Discount' },
]

const PRICE_RANGES = [
  { label: 'Under Rs. 500',          min: 0,    max: 500 },
  { label: 'Rs. 500 – 1,500',        min: 500,  max: 1500 },
  { label: 'Rs. 1,500 – 3,000',      min: 1500, max: 3000 },
  { label: 'Rs. 3,000 – 5,000',      min: 3000, max: 5000 },
  { label: 'Above Rs. 5,000',        min: 5000, max: 999999 },
]

function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-[#E5E0D8] pb-4 mb-4">
      <button onClick={onToggle} className="w-full flex items-center justify-between mb-3">
        <span className="filter-label">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="animate-fade-up">{children}</div>}
    </div>
  )
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [tryOnProduct, setTryOnProduct] = useState(null)
  const [showFilters, setShowFilters]   = useState(false)

  const [openSections, setOpenSections] = useState({ category: true, price: true, availability: false })
  const toggleSection = (k) => setOpenSections(p => ({ ...p, [k]: !p[k] }))

  // active filters from URL
  const sort       = searchParams.get('sort') || 'popular'
  const discount   = searchParams.get('discount') === 'true'
  const catFilter  = searchParams.get('cat') || ''
  const catId      = searchParams.get('catId') || ''
  const search     = searchParams.get('q') || ''
  const priceRange = searchParams.get('price') || ''
  const inStock    = searchParams.get('instock') === 'true'

  const { toasts, addToast, removeToast } = useToast()

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    setSearchParams(p)
  }

  useEffect(() => {
    getCategories().then(r => setCategories(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search)            params.search   = search
    if (catId)             params.category = catId
    if (sort === 'newest') params.ordering = '-created_at'
    if (sort === 'price_asc') params.ordering = 'price'
    if (sort === 'price_desc') params.ordering = '-price'

    getProducts(params)
      .then(r => {
        let data = r.data?.results || r.data || []
        if (priceRange) {
          const range = PRICE_RANGES.find(pr => pr.label === priceRange)
          if (range) data = data.filter(p => Number(p.price) >= range.min && Number(p.price) <= range.max)
        }
        if (inStock) data = data.filter(p => p.stock > 0)
        if (discount) data = data.filter((_, i) => i % 2 === 0)
        setProducts(data)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [sort, catId, search, priceRange, inStock, discount])

  const activeFiltersCount = [catId, priceRange, inStock ? 'instock' : '', discount ? 'discount' : ''].filter(Boolean).length

  const clearAllFilters = () => {
    const p = new URLSearchParams()
    if (sort !== 'popular') p.set('sort', sort)
    setSearchParams(p)
  }

  const FilterPanel = () => (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-gray-900 text-base">Filters</h3>
        {activeFiltersCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-red-500 font-semibold hover:text-red-700">
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category" open={openSections.category} onToggle={() => toggleSection('category')}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio" name="category" value=""
              checked={!catId}
              onChange={() => updateParam('catId', '')}
              className="accent-[#C9A45C]"
            />
            <span className="text-sm text-gray-700 group-hover:text-[#A9823F]">All Categories</span>
          </label>
          {categories.map(c => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio" name="category" value={c.id}
                checked={catId === String(c.id)}
                onChange={() => updateParam('catId', String(c.id))}
                className="accent-[#C9A45C]"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#A9823F]">{c.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range" open={openSections.price} onToggle={() => toggleSection('price')}>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="radio" name="price" value="" checked={!priceRange} onChange={() => updateParam('price', '')} className="accent-[#C9A45C]" />
            <span className="text-sm text-gray-700 group-hover:text-[#A9823F]">All Prices</span>
          </label>
          {PRICE_RANGES.map(r => (
            <label key={r.label} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="price" value={r.label} checked={priceRange === r.label} onChange={() => updateParam('price', r.label)} className="accent-[#C9A45C]" />
              <span className="text-sm text-gray-700 group-hover:text-[#A9823F]">{r.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" open={openSections.availability} onToggle={() => toggleSection('availability')}>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStock}
            onChange={e => updateParam('instock', e.target.checked ? 'true' : '')}
            className="accent-[#C9A45C]"
          />
          <span className="text-sm text-gray-700 group-hover:text-[#A9823F]">In Stock Only</span>
        </label>
      </FilterSection>

      {/* Discount */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={discount}
            onChange={e => updateParam('discount', e.target.checked ? 'true' : '')}
            className="accent-[#C9A45C]"
          />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-[#A9823F]">On Sale / Discounted</span>
        </label>
      </div>
    </aside>
  )

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 pb-24 lg:pb-8">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {search ? `Search results for "${search}"` : discount ? 'Flash Deals' : 'Shop All'}
        </h1>
        <div className="gold-divider mt-1" />
        <p className="text-sm text-gray-500 mt-2">{products.length} products found</p>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {catId && categories.find(c => String(c.id) === catId) && (
            <ChipFilter label={categories.find(c => String(c.id) === catId)?.name} onRemove={() => updateParam('catId', '')} />
          )}
          {priceRange && <ChipFilter label={priceRange} onRemove={() => updateParam('price', '')} />}
          {inStock    && <ChipFilter label="In Stock"   onRemove={() => updateParam('instock', '')} />}
          {discount   && <ChipFilter label="On Sale"    onRemove={() => updateParam('discount', '')} />}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <FilterPanel />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 btn-outline-gold text-sm py-2 px-4"
            >
              <SlidersHorizontal size={16} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            <select
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
              className="ml-auto form-input w-auto py-2 text-sm cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-3 space-y-2"><div className="skeleton h-3 w-3/4 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearAllFilters} className="btn-gold">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} onTryOn={setTryOnProduct} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl overflow-y-auto p-5 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowFilters(false)} className="btn-gold w-full mt-4">Apply Filters</button>
          </div>
        </div>
      )}

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

function ChipFilter({ label, onRemove }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5EDD8] border border-[#D8B86A] text-xs font-semibold text-[#A9823F]">
      {label}
      <button onClick={onRemove} className="text-[#A9823F] hover:text-[#8F6B32]"><X size={12} /></button>
    </div>
  )
}
