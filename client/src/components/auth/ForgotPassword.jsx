import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as authService from '../../services/auth'
import { MdEmail, MdSchool, MdArrowBack } from 'react-icons/md'
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
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MdEmail className="text-white text-4xl" />
              </div>
            </div>
            <h2 className="text-4xl font-heading font-bold dark:text-white light:text-light-text">
              Check Your Email
            </h2>
            <p className="mt-4 dark:text-dark-muted light:text-light-muted">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm dark:text-dark-muted light:text-light-muted">
              Click the link in the email to reset your password. The link will expire in 10 minutes.
            </p>
            <div className="mt-6 space-y-3">
              <Link to="/login" className="btn-primary inline-flex items-center justify-center">
                <MdArrowBack className="mr-2" />
                Back to Login
              </Link>
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                }}
                className="btn-secondary w-full"
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
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <MdSchool className="text-white text-4xl" />
            </div>
          </div>
          <h2 className="text-4xl font-heading font-bold dark:text-white light:text-light-text">
            Forgot Password?
          </h2>
          <p className="mt-2 dark:text-dark-muted light:text-light-muted">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 card animate-slide-up" onSubmit={handleSubmit} noValidate>
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
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ForgotPassword
