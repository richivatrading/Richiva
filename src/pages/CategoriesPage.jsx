import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../api/products'
import { ArrowRight } from 'lucide-react'

const CAT_ICONS = {
  Women:'👗', Men:'👔', Beauty:'💄', Jewellery:'💎', Shoes:'👡', Bags:'👜',
  Accessories:'✨', 'New Arrivals':'🆕', Ethnic:'🥻', Tops:'👚', Bottoms:'👖', Saree:'🥻', Lehenga:'💃', Kurta:'🧥',
}

const PASTEL_GRADIENTS = [
  'linear-gradient(135deg,#fef9ee,#f5edd8)',
  'linear-gradient(135deg,#f0fdf4,#d1fae5)',
  'linear-gradient(135deg,#fdf2f8,#fbcfe8)',
  'linear-gradient(135deg,#eff6ff,#bfdbfe)',
  'linear-gradient(135deg,#f5f3ff,#ddd6fe)',
  'linear-gradient(135deg,#fff7ed,#fed7aa)',
  'linear-gradient(135deg,#f0f9ff,#bae6fd)',
  'linear-gradient(135deg,#f8fafc,#e2e8f0)',
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-8 pb-24 lg:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">All Categories</h1>
        <div className="gold-divider mt-2" />
        <p className="text-gray-500 text-sm mt-2">Browse our curated collection across all categories</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No categories found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.id}`}
              className="group rounded-2xl overflow-hidden border border-[#E5E0D8] hover:border-[#C9A45C] hover:shadow-xl transition-all cursor-pointer"
              style={{ background: PASTEL_GRADIENTS[i % PASTEL_GRADIENTS.length] }}
            >
              {cat.image ? (
                <div className="h-44 overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                  {CAT_ICONS[cat.name] || '✨'}
                </div>
              )}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#A9823F] transition-colors">{cat.name}</h3>
                  {cat.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>}
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-[#A9823F] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
