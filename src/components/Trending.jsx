import { useNavigate } from 'react-router-dom'
import ProductCard from "./ProductCard";

export default function Trending() {
  const navigate = useNavigate()
  return (
    <div className="py-12 px-4 md:px-8 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-900">
        Trending Now
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((id) => (
          <ProductCard
            key={id}
            product={{
              id,
              name: "Premium Wear",
              price: 2200,
              image: "/img1.jpg",
            }}
            onClick={() => navigate('/product/' + id)}
          />
        ))}
      </div>
    </div>
  );
}
