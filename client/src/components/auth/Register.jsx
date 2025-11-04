import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import Logo from '../common/Logo'
import { MdPerson, MdEmail, MdLock, MdBusiness } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'external',
    organization: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    if (!formData.firstName) {
      newErrors.firstName = 'First Name is required'
      formIsValid = false
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last Name is required'
      formIsValid = false
    }
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      formIsValid = false
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      formIsValid = false
    }
    if (formData.role === 'external' && !formData.organization) {
      newErrors.organization = 'Organization is required for external users'
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
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      showNotification('success', 'Registration successful!', 'Welcome! Please log in.')
      navigate('/login')
    } catch (err) {
      showNotification(
        'error',
        'Registration failed',
        err.response?.data?.message || 'Registration failed. Email might already be in use.'
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
            <Logo size="xl" showText={false} animated={true} />
          </div>
          <h2 className="text-4xl font-heading font-bold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-white/70">
            Join Ambo University Credential Verification System
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 shadow-xl animate-slide-up" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                  <MdPerson size={20} />
                </span>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                Last Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                  <MdPerson size={20} />
                </span>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.lastName}</p>
              )}
            </div>

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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                  <MdLock size={20} />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 pl-10 pr-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-white/50 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="admin">Admin</option>
                <option value="registrar">Registrar</option>
                <option value="external">External User</option>
              </select>
            </div>

            {/* Organization (only for external) */}
            {formData.role === 'external' && (
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-white mb-2">
                  Organization
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
                    <MdBusiness size={20} />
                  </span>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    placeholder="Enter your organization"
                    value={formData.organization}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.organization ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.organization}</p>
                )}
              </div>
            )}
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
                  Creating account...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
