import { useNavigate } from 'react-router-dom'
import ProductCard from "./ProductCard";

const data = [
  { id: 1, name: "Luxury Jacket", price: 2500, image: "/img1.jpg" },
  { id: 2, name: "Sneakers", price: 1800, image: "/img2.jpg" },
  { id: 3, name: "Silk Scarf", price: 1200, image: "/img3.jpg" },
  { id: 4, name: "Gold Watch", price: 4500, image: "/img4.jpg" },
];

export default function FlashSale() {
  const navigate = useNavigate()
  return (
    <div className="py-12 px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-primary">
          Flash Sale 🔥
        </h2>
        <span className="text-sm text-gray-500 font-medium">Ends in 04:32:15</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {data.map((p) => (
          <ProductCard key={p.id} product={p} onClick={() => navigate('/product/' + p.id)} />
        ))}
      </div>
    </div>
  );
}
