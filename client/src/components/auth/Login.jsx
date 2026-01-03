import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { FaSpinner } from 'react-icons/fa'
import { MdMessage, MdEmail, MdClose, MdSend } from 'react-icons/md'
import * as authService from '../../services/auth'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  // Contact Feature State
  const [isDeactivated, setIsDeactivated] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [contactLoading, setContactLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
    // Reset deactivated state on change
    setIsDeactivated(false)
  }

  const validateForm = () => {
    let formIsValid = true
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
      formIsValid = false
    } else if (!/\S+@\S+\.\S/.test(formData.email)) {
      newErrors.email = 'Email address is invalid'
      formIsValid = false
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
      formIsValid = false
    }

    setErrors(newErrors)
    return formIsValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setIsDeactivated(false)
    try {
      const user = await login(formData.email, formData.password)
      showNotification('success', 'Login successful!', 'Welcome back!')

      let dashboardPath = '/external'
      if (user.role === 'superadmin') {
        dashboardPath = '/dashboard/superadmin/create-user'
      } else if (user.role === 'admin') {
        dashboardPath = '/admin'
      } else if (user.role === 'registrar') {
        dashboardPath = '/registrar'
      }

      navigate(dashboardPath)
    } catch (err) {
      const isDeactivatedError = err.response?.status === 403 && err.response?.data?.message?.toLowerCase().includes('deactivated')
      setIsDeactivated(isDeactivatedError)

      showNotification(
        'error',
        isDeactivatedError ? 'Account Deactivated' : 'Login failed',
        err.response?.data?.message || 'Invalid email or password'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    if (!contactMessage.trim()) return

    setContactLoading(true)
    try {
      await authService.contactAdmin({
        email: formData.email,
        message: contactMessage
      })
      showNotification('success', 'Message Sent', 'Your message has been sent to the administrator.')
      setShowContactModal(false)
      setContactMessage('')
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Something went wrong.'
      showNotification('error', 'Failed to Send', errorMsg)
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-pink-400 to-red-500 -top-10 -left-10 opacity-80 animate-pulse-slow"></div>
      <div className="absolute w-40 h-40 rounded-full bg-yellow-400 top-0 left-40 opacity-90"></div>
      <div className="absolute w-96 h-96 rounded-full bg-purple-400 -bottom-20 -right-20 opacity-80 animate-pulse-slow delay-700"></div>
      <div className="absolute w-48 h-48 rounded-full bg-teal-400 bottom-0 right-60 opacity-90"></div>

      {/* Login Card */}
      <div className="bg-white w-full max-w-md shadow-2xl rounded-sm z-10 overflow-hidden animate-scale-in">
        <div className="p-10 pb-6">
          <h2 className="text-2xl font-heading font-bold text-gray-700 tracking-widest mb-10 uppercase">
            Login
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-8">
              {/* Email */}
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-purple-500 transition-colors bg-transparent ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="absolute text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full border-b border-gray-300 py-2 text-gray-700 focus:outline-none focus:border-purple-500 transition-colors bg-transparent ${errors.password ? 'border-red-500' : ''}`}
                />
                {errors.password && (
                  <p className="absolute text-xs text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-center pt-4">
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wide transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Deactivated Notice */}
        {isDeactivated && (
          <div className="px-10 pb-4 animate-bounce-short">
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full py-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-200"
            >
              <MdMessage className="text-lg" />
              Contact Support
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex h-16 mt-6">
          <Link
            to="/register"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-sm uppercase tracking-wider flex items-center justify-center transition-colors"
          >
            Register
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-[#2d3b55] hover:bg-[#1a2233] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-70"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Sign In'}
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-scale-in">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    Contact Administrator
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Describe your issue and we'll get back to you.
                  </p>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MdClose className="text-2xl text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <MdEmail />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">From Account</p>
                    <p className="text-gray-700 font-semibold">{formData.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Your Message
                  </label>
                  <textarea
                    rows="4"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Tell us what happened..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-gray-700 placeholder:text-gray-300 resize-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleContactSubmit}
                  disabled={contactLoading || !contactMessage.trim()}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transform transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {contactLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <MdSend className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
