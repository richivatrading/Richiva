import { useMemo } from 'react'

const COLORS = ['#FF4F12', '#22C55E', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6']

export default function DonutChart({ data = [], size = 160 }) {
  const segments = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1
    let cumulative = 0
    return data.map((d, i) => {
      const value = d.value
      cumulative += value
      return {
        ...d,
        color: d.color || COLORS[i % COLORS.length],
        percentage: ((value / total) * 100).toFixed(1)
      }
    })
  }, [data])

  const strokeWidth = size * 0.22
  const radius = size / 2
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2)

  const paths = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1
    let cumulativePercent = 0
    return segments.map((seg) => {
      const percent = seg.value / total
      const dashArray = `${percent * circumference} ${circumference}`
      const offset = -cumulativePercent * circumference
      cumulativePercent += percent
      return { ...seg, dashArray, offset }
    })
  }, [segments, circumference, data])

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        {paths.map((seg, i) => (
          <circle
            key={i}
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.offset}
            className="transition-all duration-700 ease-out"
            style={{ transformOrigin: 'center' }}
          />
        ))}
      </svg>
      <div className="w-full space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-gray-600 truncate max-w-[120px]">{seg.label}</span>
            </div>
            <span className="font-semibold text-gray-900 tabular-nums">{seg.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
