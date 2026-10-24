import { useEffect, useState } from 'react'
import { getCategories } from '../api/products'

export default function Categories({ onCategorySelect, onNavigateToProducts }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to fetch categories:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading categories...</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No categories available yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Shop by Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => {
              if (onCategorySelect) onCategorySelect(category.id)
              if (onNavigateToProducts) onNavigateToProducts()
            }}
            className="card-luxury cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-t-xl">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-48 bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1 text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
              )}
              <button className="mt-3 w-full btn-outline text-sm">
                Browse {category.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
