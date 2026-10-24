import { addToCart } from '../api/cart'
import ProductCard from './ProductCard'

export default function ProductList({ products, categories, selectedCategory, onCategoryChange, onAddToCart, onProductClick }) {
  const handleAdd = async (productId) => {
    await addToCart(productId)
    onAddToCart()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Products</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
            !selectedCategory ? 'bg-primary text-black border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${
              selectedCategory === category.id ? 'bg-primary text-black border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {products.map((product) => (
           <ProductCard key={product.id} product={product} onClick={() => onProductClick(product.id)} onQuickAdd={(id) => handleAdd(id)} />
         ))}
       </div>
    </div>
  )
}
