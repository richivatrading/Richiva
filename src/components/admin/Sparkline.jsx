import { useMemo } from 'react'

export default function Sparkline({ data = [], color = '#FF4F12', width = 120, height = 40 }) {
  const points = useMemo(() => {
    if (!data.length) return ''
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const stepX = data.length > 1 ? width / (data.length - 1) : 0
    return data.map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    }).join(' ')
  }, [data, width, height])

  if (!data.length) return null

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}
