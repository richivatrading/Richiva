import { useState, useRef, useEffect } from 'react'

export default function BeforeAfterSlider({ beforeImage, afterImage }) {
  const [pos, setPos] = useState(50)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  const updatePos = (clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(2, Math.min(98, pct)))
  }

  useEffect(() => {
    const move = (e) => { if (dragging.current) updatePos(e.touches ? e.touches[0].clientX : e.clientX) }
    const up   = ()  => { dragging.current = false }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-col-resize select-none border border-[#E5E0D8] bg-[#F5EDD8]"
      onMouseDown={() => { dragging.current = true }}
      onTouchStart={() => { dragging.current = true }}
    >
      {/* After (full width behind) */}
      <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />

      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: containerRef.current ? containerRef.current.offsetWidth : '100%' }} />
      </div>

      {/* Slider line */}
      <div className="absolute top-0 bottom-0" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
        <div className="h-full w-0.5" style={{ background: 'linear-gradient(180deg, #A9823F, #D8B86A)' }} />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full shadow-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#A9823F,#D8B86A)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M8 5l-5 7 5 7"/><path d="M16 5l5 7-5 7"/></svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>BEFORE</div>
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#A9823F,#D8B86A)' }}>AFTER</div>
    </div>
  )
}
