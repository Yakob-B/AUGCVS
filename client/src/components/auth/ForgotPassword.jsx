import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as authService from '../../services/auth'
import Logo from '../common/Logo'
import { MdEmail, MdArrowBack } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const ForgotPassword = () => {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setEmail(e.target.value)
    setErrors({})
  }

  const validateForm = () => {
    let formIsValid = true
    const newErrors = {}

    if (!email) {
      newErrors.email = 'Email is required'
      formIsValid = false
    } else if (!/\S+@\S+\.\S/.test(email)) {
      newErrors.email = 'Email address is invalid'
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
      await authService.forgotPassword(email)
      setEmailSent(true)
      showNotification('success', 'Email Sent', 'Password reset link has been sent to your email address.')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send password reset email'
      showNotification('error', 'Error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-slide-down">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-float">
                <MdEmail className="text-white text-4xl" />
              </div>
            </div>
            <h2 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text">
              Check Your Email
            </h2>
            <p className="mt-4 dark:text-dark-muted light:text-light-muted">
              We've sent a password reset link to <strong className="dark:text-dark-text light:text-light-text">{email}</strong>
            </p>
            <p className="mt-2 text-sm dark:text-dark-muted light:text-light-muted">
              Click the link in the email to reset your password. The link will expire in 10 minutes.
            </p>
            <div className="mt-6 space-y-3">
              <Link to="/login" className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30">
                <MdArrowBack className="mr-2" />
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                }}
                className="w-full px-6 py-3 rounded-lg dark:bg-dark-card light:bg-light-card dark:text-dark-text light:text-light-text dark:border-dark-border light:border-light-border hover:dark:bg-dark-surface hover:light:bg-gray-100 transition-colors"
              >
                Send to Different Email
              </button>
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
            <Logo size="xl" showText={false} animated={true} />
          </div>
          <h2 className="text-4xl font-heading font-bold dark:text-dark-text light:text-light-text">
            Forgot Password?
          </h2>
          <p className="mt-2 dark:text-dark-muted light:text-light-muted">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6 card shadow-xl animate-slide-up"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none dark:text-dark-muted light:text-light-muted">
                <MdEmail size={20} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleChange}
                disabled={loading}
                className={`input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.email}</p>
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
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors inline-flex items-center"
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

export default ForgotPassword
