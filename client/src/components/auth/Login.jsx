import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { MdEmail, MdLock, MdSchool } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

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
      await login(formData.email, formData.password)
      showNotification('success', 'Login successful!', 'Welcome back!')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const dashboardPath = user.role === 'admin' ? '/admin' : user.role === 'registrar' ? '/registrar' : '/external'
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-slide-down">
          <div className="flex justify-center mb-4">
            {!logoError ? (
              <img 
                src="/images/logo.png" 
                alt="Ambo University Logo" 
                className="h-20 w-auto object-contain animate-float"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-float">
                <MdSchool className="text-white text-4xl" />
              </div>
            )}
          </div>
          <h2 className="text-4xl font-heading font-bold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-white/70">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 shadow-xl animate-slide-up" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                  <MdEmail size={20} />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                  <MdLock size={20} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 pl-10 pr-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-white/50 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-500/30 animate-glow"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <p>
              <Link
                to="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </p>
            <p className="text-white/70">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
