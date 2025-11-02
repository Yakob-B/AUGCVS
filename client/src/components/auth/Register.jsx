import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { MdPerson, MdEmail, MdLock, MdBusiness, MdSchool } from 'react-icons/md'
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
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-pulse-slow">
              <MdSchool className="text-white text-4xl" />
            </div>
          </div>
          <h2 className="text-4xl font-heading font-bold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-dark-muted">
            Join Ambo University Credential Verification System
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 card animate-slide-up" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-dark-text mb-2">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
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
                  className={`input pl-10 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-dark-text mb-2">
                Last Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
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
                  className={`input pl-10 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.lastName}</p>
              )}
            </div>

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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-text mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
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
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-dark-muted hover:text-dark-text transition-colors"
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
              <label htmlFor="role" className="block text-sm font-medium text-dark-text mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="input"
              >
                <option value="admin">Admin</option>
                <option value="registrar">Registrar</option>
                <option value="external">External User</option>
              </select>
            </div>

            {/* Organization (only for external) */}
            {formData.role === 'external' && (
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-dark-text mb-2">
                  Organization
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
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
                    className={`input pl-10 ${errors.organization ? 'border-red-500 focus:ring-red-500' : ''}`}
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
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-dark-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
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
