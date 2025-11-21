import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
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
    acceptTerms: false,
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms to register'
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
      const { confirmPassword, acceptTerms, ...registerData } = formData
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Decorative Elements */}
      <div className="absolute w-64 h-64 rounded-full bg-purple-800 opacity-30 -top-20 -left-20 animate-pulse-slow"></div>
      <div className="absolute w-12 h-12 rounded-full bg-teal-400 top-20 left-32"></div>
      <div className="absolute w-8 h-8 rounded-full bg-cyan-300 top-40 right-40"></div>
      <div className="absolute w-16 h-16 rounded-full bg-teal-400 bottom-32 left-20"></div>
      <div className="absolute w-10 h-10 rounded-full bg-pink-400 bottom-20 right-80"></div>
      <div className="absolute w-96 h-2 bg-white/40 transform rotate-45 -top-10 right-40"></div>
      <div className="absolute w-80 h-2 bg-white/40 transform rotate-45 top-20 -right-20"></div>
      <div className="absolute w-64 h-2 bg-white/40 transform rotate-45 -bottom-10 left-40"></div>

      {/* Register Card */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-xl rounded-3xl shadow-2xl p-10 z-10 animate-scale-in">
        <h2 className="text-4xl font-heading font-bold text-white text-center mb-8 uppercase tracking-wider">
          Register
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${errors.firstName ? 'ring-2 ring-red-400' : ''}`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-200 mt-1 ml-3">{errors.firstName}</p>
              )}
            </div>
            <div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${errors.lastName ? 'ring-2 ring-red-400' : ''}`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-200 mt-1 ml-3">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${errors.email ? 'ring-2 ring-red-400' : ''}`}
            />
            {errors.email && (
              <p className="text-xs text-red-200 mt-1 ml-3">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${errors.password ? 'ring-2 ring-red-400' : ''}`}
            />
            {errors.password && (
              <p className="text-xs text-red-200 mt-1 ml-3">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${errors.confirmPassword ? 'ring-2 ring-red-400' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-200 mt-1 ml-3">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-6 py-3 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            >
              <option value="admin">Admin</option>
              <option value="registrar">Registrar</option>
              <option value="external">External User</option>
            </select>
          </div>

          {/* Organization (conditional) */}
          {formData.role === 'external' && (
            <div>
              <input
                id="organization"
                name="organization"
                type="text"
                placeholder="Organization"
                value={formData.organization}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-full bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${errors.organization ? 'ring-2 ring-red-400' : ''}`}
              />
              {errors.organization && (
                <p className="text-xs text-red-200 mt-1 ml-3">{errors.organization}</p>
              )}
            </div>
          )}

          {/* Terms of Use */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={loading}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="acceptTerms" className="text-white text-sm">
              I accept{' '}
              <a href="/terms" className="text-cyan-300 hover:text-cyan-200 underline">
                Terms of Use
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-red-200 text-center">{errors.acceptTerms}</p>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full font-bold text-lg uppercase tracking-wide hover:from-cyan-500 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? <FaSpinner className="animate-spin inline" /> : 'Register Now'}
          </button>

          {/* Login Link */}
          <p className="text-center text-white text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-300 hover:text-cyan-200 font-semibold underline">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
