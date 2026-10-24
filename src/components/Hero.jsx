export default function Hero() {
  return (
    <div className="h-[80vh] bg-dark text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-dark z-10" />
      <div className="relative z-20 max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          Elevate Your <span className="text-primary">Style</span>
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Discover premium fashion with AI Try-On. Experience luxury like never before.
        </p>
        <a href="/products" className="inline-block bg-primary text-black font-semibold py-4 px-10 rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
          Shop Now
        </a>
      </div>
    </div>
  );
}
