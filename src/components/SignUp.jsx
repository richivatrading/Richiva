import { useState, useRef, useEffect } from 'react'
import { register, verifyOtp, resendOtp } from '../api/auth'
import LocationPicker from './LocationPicker'

function maskEmail(email) {
  if (!email || !email.includes('@')) return email
  const [user, domain] = email.split('@')
  if (user.length <= 2) return `${user[0]}***@${domain}`
  return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`
}

export default function SignUp({ onSignUp, onClose, onSwitchToSignIn }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [location, setLocation] = useState(null)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])

  // Cooldown countdown timer
  useEffect(() => {
    let timer
    if (step === 2 && cooldown > 0) {
      setCanResend(false)
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, cooldown])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: location?.address || '',
        latitude: location?.lat || null,
        longitude: location?.lng || null,
      }
      const res = await register(payload)
      setRegisteredEmail(res.data.email || form.email)
      setMessage(res.data.detail || 'Verification email sent. Please check your inbox.')
      setStep(2)
      setCooldown(60)
      setCanResend(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDigitChange = (index, val) => {
    const cleanVal = val.replace(/\D/g, '')
    if (!cleanVal && val !== '') return

    const newDigits = [...digits]
    newDigits[index] = cleanVal.slice(-1)
    setDigits(newDigits)

    // Move to next input if filled
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      const newDigits = [...digits]
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i]
      }
      setDigits(newDigits)
      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  const fullCode = digits.join('')

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (fullCode.length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setLoading(true)
    try {
      const res = await verifyOtp({ email: registeredEmail, code: fullCode })
      onSignUp(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await resendOtp({ email: registeredEmail })
      setMessage(res.data.detail || 'A new code has been sent.')
      setCooldown(60)
      setCanResend(false)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mb-4 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
      {message && <p className="text-emerald-700 mb-4 text-sm font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-200">{message}</p>}

      {step === 1 ? (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A45C] focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A45C] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A45C] focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 9841234567"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A45C] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A45C] focus:border-transparent transition-all"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A45C] focus:border-transparent transition-all"
              required
            />
          </div>
          <LocationPicker value={location} onChange={setLocation} />
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold disabled:opacity-50 mt-2 py-3"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          <p className="text-center text-sm text-gray-600 mt-3">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-[#A9823F] hover:text-[#8F6B32] font-medium"
            >
              Sign In
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Code sent to</p>
            <p className="font-bold text-gray-900 text-base">{maskEmail(registeredEmail)}</p>
          </div>

          {/* 6 Digit Boxes */}
          <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-black text-gray-900 border-2 border-gray-300 rounded-xl focus:border-[#C9A45C] focus:ring-2 focus:ring-[#C9A45C]/20 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || fullCode.length < 6}
            className="w-full btn-gold disabled:opacity-50 py-3.5 text-base font-bold"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend OTP Section */}
          <div className="text-center pt-2 border-t border-gray-100 space-y-2">
            <p className="text-sm text-gray-500">Didn't receive the code?</p>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm font-bold text-[#A9823F] hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-xs text-gray-400 font-medium">
                Resend available in <span className="font-bold text-gray-700">{cooldown}s</span>
              </p>
            )}
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-gray-400 hover:text-gray-700 underline"
            >
              Back to registration
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

