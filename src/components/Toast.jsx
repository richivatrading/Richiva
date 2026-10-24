import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

const COLORS = {
  success: { bg: '#F0FDF4', border: '#86EFAC', icon: '#16A34A', text: '#166534' },
  error:   { bg: '#FEF2F2', border: '#FCA5A5', icon: '#DC2626', text: '#991B1B' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', icon: '#D97706', text: '#92400E' },
  info:    { bg: '#FFF7ED', border: '#D8B86A', icon: '#A9823F', text: '#7C2D12' },
}

function ToastItem({ id, message, type = 'info', onRemove }) {
  const [visible, setVisible] = useState(false)
  const Icon = ICONS[type] || Info
  const colors = COLORS[type] || COLORS.info

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => onRemove(id), 200)
  }

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      className="flex items-start gap-3 p-4 rounded-xl shadow-lg max-w-sm w-full"
    >
      <Icon size={18} style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }} />
      <p style={{ color: colors.text }} className="text-sm font-medium flex-1">{message}</p>
      <button onClick={dismiss} style={{ color: colors.icon }} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return { toasts, addToast, removeToast }
}
