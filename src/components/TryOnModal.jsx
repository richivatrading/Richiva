import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, Download, RefreshCw, ShoppingCart, X, Sparkles } from 'lucide-react'
import { createTryOn, getTryOnResult } from '../api/tryon'
import BeforeAfterSlider from './BeforeAfterSlider'

export default function TryOnModal({ product, onClose, onAddToCart, addToCartToast }) {
  const [step, setStep] = useState(1)
  const [personImage, setPersonImage] = useState(null)
  const [personPreview, setPersonPreview] = useState(null)
  const [tryOnResult, setTryOnResult] = useState(null)
  const [tryOnLoading, setTryOnLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setPersonImage(file)
      setPersonPreview(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    return () => { if (personPreview) URL.revokeObjectURL(personPreview) }
  }, [personPreview])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFileChange(e.dataTransfer.files?.[0])
  }

  const handleCamera = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => handleFileChange(e.target.files?.[0])
    input.click()
  }

  const handleGenerate = async () => {
    if (!personImage) return
    setTryOnLoading(true)
    setTryOnResult(null)
    try {
      const formData = new FormData()
      formData.append('person_image', personImage)
      const res = await createTryOn(formData, product.id)
      const requestId = res.data.try_on_request.id

      const pollResult = async () => {
        const resultRes = await getTryOnResult(requestId)
        const data = resultRes.data
        setTryOnResult(data)
        if (data.status === 'pending') setTimeout(pollResult, 2000)
      }
      await pollResult()
    } catch (err) {
      const apiMessage = err.response?.data?.detail || err.response?.data?.error_message || err.message
      setTryOnResult({ status: 'failed', error_message: apiMessage || 'Try-on failed. Please try again.' })
    } finally {
      setTryOnLoading(false)
    }
  }

  const handleReset = () => { setStep(1); setTryOnResult(null); setPersonImage(null); setPersonPreview(null) }

  const handleDownload = () => {
    if (tryOnResult?.result_image) {
      const link = document.createElement('a')
      link.href = tryOnResult.result_image
      link.download = `fiora-tryon-${product.id}.png`
      link.click()
    }
  }

  const handleAddToCartFromTryOn = () => { onAddToCart?.(product); addToCartToast?.(); onClose() }

  useEffect(() => {
    if (tryOnResult && (tryOnResult.status === 'done' || tryOnResult.status === 'failed')) setStep(3)
  }, [tryOnResult])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-up">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#F5EDD8,#E8D29A)' }}>
                <Sparkles size={18} style={{ color:'#A9823F' }} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">Virtual Try-On</h2>
                <p className="text-xs text-gray-400">Powered by AI</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'text-white' : 'bg-gray-100 text-gray-400'}`} style={step >= s ? { background:'linear-gradient(135deg,#A9823F,#D8B86A)' } : {}}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-[#C9A45C]' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1 — Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Your Photo</h3>
                <p className="text-sm text-gray-500">Upload a clear photo to see how this product looks on you</p>
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-[#C9A45C] bg-[#F5EDD8]' : 'border-[#E5E0D8] hover:border-[#C9A45C] hover:bg-[#FDFBF5]'}`}
              >
                <Upload className="mx-auto text-[#C9A45C] mb-3" size={40} />
                <p className="text-sm font-medium text-gray-700 mb-1">{personPreview ? 'Click or drop to change photo' : 'Drag & drop your photo here'}</p>
                <p className="text-xs text-gray-400 mb-4">or</p>
                <button type="button" onClick={e => { e.stopPropagation(); handleCamera() }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background:'#F5EDD8', color:'#A9823F' }}>
                  <Camera size={16} /> Take Photo
                </button>
                <p className="text-[11px] text-gray-400 mt-3">Supports JPG, PNG, WEBP (max 10MB)</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleFileChange(e.target.files?.[0])} className="hidden" />
              </div>

              {personPreview && (
                <div className="flex justify-center">
                  <img src={personPreview} alt="Preview" className="h-48 object-contain rounded-xl border border-[#E5E0D8]" />
                </div>
              )}

              <button onClick={() => setStep(2)} disabled={!personImage} className="w-full btn-gold py-3.5 disabled:opacity-40">
                Continue
              </button>
            </div>
          )}

          {/* Step 2 — Confirm */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Confirm Product</h3>
                <p className="text-sm text-gray-500">Confirm the product you want to try on</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-[#E5E0D8] bg-[#FDFBF5]">
                {product.image && <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-xl" />}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{product.name}</h4>
                  <p className="text-[#A9823F] font-black text-lg">Rs. {Number(product.price).toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 btn-outline-gold py-3">Back</button>
                <button onClick={handleGenerate} disabled={tryOnLoading} className="flex-1 btn-gold py-3 flex items-center justify-center gap-2">
                  {tryOnLoading ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin" /> Processing...</>
                  ) : (
                    <><Sparkles size={16} /> Generate Try-On</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Result */}
          {step === 3 && tryOnResult && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Your Virtual Try-On</h3>
                <p className="text-sm text-gray-500">Here's how it looks on you</p>
              </div>

              {tryOnLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-[#E8D29A] border-t-[#A9823F] rounded-full spin mb-4" />
                  <p className="text-gray-700 font-semibold">Creating your virtual try-on...</p>
                  <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                </div>
              )}

              {!tryOnLoading && tryOnResult.status === 'done' && tryOnResult.result_image && (
                <>
                  <BeforeAfterSlider beforeImage={personPreview} afterImage={tryOnResult.result_image} />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleDownload} className="flex-1 btn-outline-gold flex items-center justify-center gap-2 py-3">
                      <Download size={16} /> Download
                    </button>
                    <button onClick={handleReset} className="flex-1 btn-outline-gold flex items-center justify-center gap-2 py-3">
                      <RefreshCw size={16} /> Try Another
                    </button>
                    <button onClick={handleAddToCartFromTryOn} className="flex-1 btn-gold flex items-center justify-center gap-2 py-3">
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                  </div>
                </>
              )}

              {!tryOnLoading && tryOnResult.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                  <p className="text-red-700 text-sm mb-3">{tryOnResult.error_message || 'Try-on failed. Please try again.'}</p>
                  <button onClick={handleReset} className="btn-gold py-2.5 px-6">Try Again</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
