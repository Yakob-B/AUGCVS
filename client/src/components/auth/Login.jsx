import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { FaSpinner } from 'react-icons/fa'

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
      showNotification(
        'error',
        'Login failed',
        err.response?.data?.message || 'Invalid email or password'
      )
    } finally {
      setLoading(false)
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
    </div>
  )
}

export default Login
