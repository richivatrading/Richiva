import { useState } from 'react'
import { X, Eye, EyeOff, Loader } from 'lucide-react'
import { login as apiLogin, register as apiRegister } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function AuthModal({ mode, onClose, onSwitch }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email:'', password:'', first_name:'', last_name:'', phone:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const isLogin = mode === 'signin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = isLogin
        ? await apiLogin({ email: form.email, password: form.password })
        : await apiRegister(form)
      login(res.data)
      onClose()
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'string') setError(data)
      else if (data?.non_field_errors) setError(data.non_field_errors[0])
      else if (data?.detail) setError(data.detail)
      else if (data?.email) setError(data.email[0])
      else setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-[#F0EAE0]">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="text-center">
            <span className="text-xl font-black tracking-widest text-gold-gradient" style={{ background:'linear-gradient(135deg,#A9823F,#D8B86A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              FIORA
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-sm text-gray-500 mt-1">{isLogin ? 'Sign in to your account' : 'Join Fiora today — it\'s free!'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">First Name</label>
                <input
                  className="form-input text-sm"
                  placeholder="e.g. Priya"
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Last Name</label>
                <input
                  className="form-input text-sm"
                  placeholder="e.g. Sharma"
                  value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Email Address</label>
            <input
              type="email"
              className="form-input text-sm"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Phone (optional)</label>
              <input
                type="tel"
                className="form-input text-sm"
                placeholder="+977 98XX-XXXXXX"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input text-sm pr-10"
                placeholder={isLogin ? '••••••••' : 'Min. 6 characters'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={isLogin ? undefined : 6}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base flex items-center justify-center gap-2">
            {loading ? <><Loader size={18} className="spin" /> {isLogin ? 'Signing in...' : 'Creating account...'}</> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <p className="text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={onSwitch} className="text-[#A9823F] font-semibold hover:underline">
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function AuthModals() {
  const { authModal, setAuthModal } = useAuth()
  if (!authModal) return null
  return (
    <AuthModal
      mode={authModal}
      onClose={() => setAuthModal(null)}
      onSwitch={() => setAuthModal(authModal === 'signin' ? 'signup' : 'signin')}
    />
  )
}
