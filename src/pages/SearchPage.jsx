import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X } from 'lucide-react'
import { getProducts } from '../api/products'
import ProductCard from '../components/ProductCard'
import TryOnModal from '../components/TryOnModal'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputVal, setInputVal]   = useState(searchParams.get('q') || '')
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [tryOnProduct, setTryOnProduct] = useState(null)
  const query = searchParams.get('q') || ''

  useEffect(() => { setInputVal(query) }, [query])

  useEffect(() => {
    if (!query) { setProducts([]); return }
    setLoading(true)
    getProducts({ search: query })
      .then(r => setProducts(r.data?.results || r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [query])

  const doSearch = (q = inputVal) => {
    if (!q.trim()) return
    setSearchParams({ q: q.trim() })
    // track recent
    const prev = JSON.parse(localStorage.getItem('fiora_recent_searches') || '[]')
    const next  = [q.trim(), ...prev.filter(r => r !== q.trim())].slice(0, 5)
    localStorage.setItem('fiora_recent_searches', JSON.stringify(next))
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 pb-24 lg:pb-8">
      {/* Search input */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Search for products, brands, categories..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-[#E5E0D8] text-base outline-none focus:border-[#C9A45C] bg-white shadow-sm"
          autoFocus
        />
        {inputVal && (
          <button onClick={() => { setInputVal(''); setSearchParams({}) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        )}
      </div>

      {!query && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">What are you looking for?</h2>
          <p className="text-gray-500 text-sm">Search for products, categories, or brands</p>
          {/* Popular searches */}
          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Popular Searches</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Lehenga','Saree','Kurta','Dress','Accessories','Jewellery'].map(s => (
                <button key={s} onClick={() => { setInputVal(s); doSearch(s) }} className="px-4 py-2 rounded-full border border-[#E5E0D8] text-sm font-medium text-gray-700 hover:border-[#C9A45C] hover:text-[#A9823F] transition-colors bg-white">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {query && (
        <>
          <div className="mb-4">
            <h1 className="text-xl font-black text-gray-900">Results for "<span className="text-[#A9823F]">{query}</span>"</h1>
            <p className="text-sm text-gray-500 mt-1">{loading ? 'Searching...' : `${products.length} products found`}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="skeleton aspect-[3/4]" />
                  <div className="p-3 space-y-2"><div className="skeleton h-3 w-3/4 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">😕</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500 text-sm mb-6">We couldn't find anything for "<strong>{query}</strong>"</p>
              <p className="text-sm text-gray-400">Try checking your spelling or using different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} onTryOn={setTryOnProduct} />)}
            </div>
          )}
        </>
      )}

      {tryOnProduct && (
        <TryOnModal product={tryOnProduct} onClose={() => setTryOnProduct(null)} onAddToCart={() => {}} addToCartToast={() => {}} />
      )}
    </div>
  )
}
