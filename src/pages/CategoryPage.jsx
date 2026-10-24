import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProducts, getCategory } from '../api/products'
import ProductCard from '../components/ProductCard'
import TryOnModal from '../components/TryOnModal'
import { ArrowLeft } from 'lucide-react'

export default function CategoryPage() {
  const { id } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tryOnProduct, setTryOnProduct] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getCategory(id).then(r => setCategory(r.data)).catch(() => {}),
      getProducts({ category: id }).then(r => setProducts(r.data?.results || r.data || [])).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [id])

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 pb-24 lg:pb-8">
      <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#A9823F] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Categories
      </Link>

      {loading ? (
        <div>
          <div className="skeleton h-8 w-40 rounded mb-2" />
          <div className="skeleton h-4 w-64 rounded mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => <div key={i} className="rounded-2xl overflow-hidden"><div className="skeleton aspect-[3/4]" /><div className="p-3 space-y-2"><div className="skeleton h-3 w-3/4 rounded" /></div></div>)}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-900">{category?.name || 'Category'}</h1>
            <div className="gold-divider mt-1" />
            {category?.description && <p className="text-gray-500 text-sm mt-2">{category.description}</p>}
            <p className="text-sm text-gray-400 mt-1">{products.length} products</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-500">No products in this category yet.</p>
              <Link to="/shop" className="btn-gold mt-4 inline-flex">Browse All Products</Link>
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
