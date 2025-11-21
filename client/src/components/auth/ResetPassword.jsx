import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as authService from '../../services/auth'
import { MdLock, MdSchool, MdCheckCircle, MdArrowBack } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Optionally verify token on mount
    if (!token) {
      showNotification('error', 'Invalid Link', 'Password reset link is invalid.')
      navigate('/forgot-password')
    }
  }, [token, navigate, showNotification])

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

    if (!formData.password) {
      newErrors.password = 'Password is required'
      formIsValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      formIsValid = false
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
      formIsValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const response = await authService.resetPassword(token, formData.password)
      setVerified(true)
      showNotification('success', 'Password Reset', 'Your password has been reset successfully!')

      // Auto login after successful reset
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password'
      showNotification('error', 'Reset Failed', errorMessage)
      
      if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
        setTimeout(() => {
          navigate('/forgot-password')
        }, 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  if (verified) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-slide-down">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MdCheckCircle className="text-white text-4xl" />
              </div>
            </div>
            <h2 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text">
              Password Reset!
            </h2>
            <p className="mt-4 dark:text-dark-muted light:text-light-muted">
              Your password has been successfully reset.
            </p>
            <p className="mt-2 text-sm dark:text-dark-muted light:text-light-muted">
              Redirecting to login...
            </p>
            <div className="mt-6">
              <Link to="/login" className="btn-primary inline-flex items-center justify-center">
                <MdArrowBack className="mr-2" />
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-slide-down">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <MdSchool className="text-white text-4xl" />
            </div>
          </div>
          <h2 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text">
            Reset Password
          </h2>
          <p className="mt-2 dark:text-dark-muted light:text-light-muted">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 card animate-slide-up" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none dark:text-dark-muted light:text-light-muted">
                  <MdLock size={20} />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center dark:text-dark-muted light:text-light-muted hover:dark:text-dark-text hover:light:text-light-text transition-colors"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none dark:text-dark-muted light:text-light-muted">
                  <MdLock size={20} />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center dark:text-dark-muted light:text-light-muted hover:dark:text-dark-text hover:light:text-light-text transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.confirmPassword}</p>
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
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-400 font-medium transition-colors inline-flex items-center"
            >
              <MdArrowBack className="mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
