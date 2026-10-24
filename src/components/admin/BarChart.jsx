import { useMemo } from 'react'

export default function BarChart({ data = [], labels = [], color = '#FF4F12', height = 200 }) {
  const bars = useMemo(() => {
    if (!data.length) return []
    const max = Math.max(...data) || 1
    const barWidth = 100 / data.length
    return data.map((v, i) => {
      const h = (v / max) * (height - 20)
      return {
        x: i * barWidth + barWidth * 0.15,
        y: height - h - 10,
        w: barWidth * 0.7,
        h,
        label: labels[i] || `#${i + 1}`,
        value: v
      }
    })
  }, [data, labels, height])

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        {bars.map((bar, i) => (
          <g key={i}>
            <rect
              x={bar.x}
              y={bar.y}
              width={bar.w}
              height={bar.h}
              fill={color}
              rx="1.5"
              className="transition-all duration-300 hover:opacity-80"
            />
            <text
              x={bar.x + bar.w / 2}
              y={height - 2}
              textAnchor="middle"
              className="text-[2.5px] fill-gray-400"
            >
              {bar.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
