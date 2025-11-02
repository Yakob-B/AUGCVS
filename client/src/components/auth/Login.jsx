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
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-pulse-slow">
              <MdSchool className="text-white text-4xl" />
            </div>
          </div>
          <h2 className="text-4xl font-heading font-bold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-dark-muted">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 card animate-slide-up" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
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
                  className={`input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
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
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-dark-muted hover:text-dark-text transition-colors"
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
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Register Link */}
          <div className="text-center">
            <p className="text-dark-muted">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
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
