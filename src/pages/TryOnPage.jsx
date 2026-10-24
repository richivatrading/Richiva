import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Upload, Camera, ArrowRight, X, Download, RefreshCw, ShoppingCart, Star, Info } from 'lucide-react'
import { getProducts } from '../api/products'
import { createTryOn, getTryOnResult } from '../api/tryon'
import { useAuth } from '../context/AuthContext'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import Toast, { useToast } from '../components/Toast'

export default function TryOnPage() {
  const { user, requireAuth } = useAuth()
  const [products, setProducts]       = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [personImage, setPersonImage] = useState(null)
  const [personPreview, setPersonPreview] = useState(null)
  const [result, setResult]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [dragOver, setDragOver]       = useState(false)
  const fileInputRef = useRef(null)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    getProducts().then(r => setProducts(r.data?.results || r.data || [])).catch(() => {})
  }, [])

  useEffect(() => () => { if (personPreview) URL.revokeObjectURL(personPreview) }, [personPreview])

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setPersonImage(file)
      setPersonPreview(URL.createObjectURL(file))
      setResult(null)
    }
  }

  const handleGenerate = async () => {
    if (!personImage || !selectedProduct) { addToast('Select a photo and a product', 'warning'); return }
    const ok = requireAuth()
    if (!ok) return
    setLoading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('person_image', personImage)
      const res = await createTryOn(fd, selectedProduct.id)
      const reqId = res.data.try_on_request.id

      const poll = async () => {
        const r = await getTryOnResult(reqId)
        setResult(r.data)
        if (r.data.status === 'pending') setTimeout(poll, 2000)
      }
      await poll()
    } catch (err) {
      setResult({ status:'failed', error_message: err.response?.data?.detail || 'Try-on failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => { setResult(null); setSelectedProduct(null); setPersonImage(null); setPersonPreview(null) }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-6 pb-24 lg:pb-8">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A45C] text-[#A9823F] text-xs font-bold tracking-widest mb-4">
          <Sparkles size={14} /> AI POWERED
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Virtual Try-On</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Upload your photo, pick a product, and see how it looks on you — powered by AI. Free, instant, no app needed.</p>
      </div>

      {result?.status === 'done' && result.result_image ? (
        /* ── Result view ─────────────────────────────────────── */
        <div className="max-w-2xl mx-auto animate-fade-up">
          <BeforeAfterSlider beforeImage={personPreview} afterImage={result.result_image} />
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button onClick={() => { const a=document.createElement('a'); a.href=result.result_image; a.download=`fiora-tryon.png`; a.click() }} className="flex-1 btn-outline-gold py-3 flex items-center justify-center gap-2">
              <Download size={16} /> Download
            </button>
            <button onClick={handleReset} className="flex-1 btn-outline-gold py-3 flex items-center justify-center gap-2">
              <RefreshCw size={16} /> Try Another
            </button>
            <Link to={`/product/${selectedProduct?.id}`} className="flex-1 btn-gold py-3 flex items-center justify-center gap-2">
              <ShoppingCart size={16} /> View Product
            </Link>
          </div>
        </div>
      ) : result?.status === 'failed' ? (
        <div className="max-w-md mx-auto text-center bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 mb-4">{result.error_message}</p>
          <button onClick={handleReset} className="btn-gold">Try Again</button>
        </div>
      ) : (
        /* ── Upload + Select ─────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left — Photo upload */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)' }}>1</div>
              Upload Your Photo
            </h3>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-[#C9A45C] bg-[#F5EDD8]' : 'border-[#E5E0D8] hover:border-[#C9A45C]'}`}
            >
              {personPreview ? (
                <img src={personPreview} alt="Preview" className="mx-auto h-56 object-contain rounded-xl" />
              ) : (
                <>
                  <Upload className="mx-auto text-[#C9A45C] mb-3" size={40} />
                  <p className="text-sm font-medium text-gray-700">Drag & drop your photo</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} className="hidden" />
            </div>
            {personPreview && (
              <button onClick={() => { setPersonImage(null); setPersonPreview(null) }} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 mt-2 mx-auto">
                <X size={12} /> Remove photo
              </button>
            )}
            <button type="button" onClick={() => { const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.capture='environment'; i.onchange=e=>handleFile(e.target.files?.[0]); i.click() }} className="flex items-center justify-center gap-2 mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ background:'#F5EDD8', color:'#A9823F' }}>
              <Camera size={16} /> Use Camera
            </button>
          </div>

          {/* Right — Pick product */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)' }}>2</div>
              Select a Product
            </h3>

            {selectedProduct ? (
              <div className="relative rounded-2xl border border-[#C9A45C] p-4 bg-[#FDFBF5] mb-4">
                <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600"><X size={12} /></button>
                <div className="flex items-center gap-3">
                  {selectedProduct.image && <img src={selectedProduct.image} alt="" className="w-16 h-16 rounded-xl object-cover" />}
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{selectedProduct.name}</p>
                    <p className="text-[#A9823F] font-black">Rs. {Number(selectedProduct.price).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">Click a product below to select it</p>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[340px] overflow-y-auto scrollbar-gold pr-1">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${selectedProduct?.id === p.id ? 'border-[#C9A45C] shadow-md' : 'border-[#E5E0D8] hover:border-[#C9A45C]'}`}
                >
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full aspect-[3/4] object-cover" />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-[#F5EDD8] flex items-center justify-center text-xs text-[#C9A45C] font-bold">FIORA</div>
                  )}
                  <p className="text-[10px] font-medium text-gray-700 p-1.5 truncate">{p.name}</p>
                </button>
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-center py-8 text-sm text-gray-400">Loading products...</div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!personImage || !selectedProduct || loading}
              className="btn-gold w-full py-4 mt-5 text-base flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin" /> Processing...</>
              ) : (
                <><Sparkles size={18} /> Generate Virtual Try-On</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <section className="mt-16 text-center">
        <h2 className="text-xl font-black text-gray-900 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { step:'1', title:'Upload Photo', desc:'Take or upload a clear photo of yourself' },
            { step:'2', title:'Pick a Product', desc:'Select any garment from our catalog' },
            { step:'3', title:'See the Result', desc:'AI generates how it looks on you instantly' },
          ].map(s => (
            <div key={s.step} className="card p-6 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-lg font-black" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
                {s.step}
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{s.title}</h4>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
