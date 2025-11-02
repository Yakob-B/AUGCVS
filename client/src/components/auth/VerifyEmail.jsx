import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as authService from '../../services/auth'
import { MdCheckCircle, MdError, MdSchool, MdEmail } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const VerifyEmail = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    verifyEmailToken()
  }, [token])

  const verifyEmailToken = async () => {
    if (!token) {
      setError('Invalid verification link')
      setLoading(false)
      return
    }

    try {
      const response = await authService.verifyEmail(token)
      setVerified(true)
      showNotification('success', 'Email Verified', 'Your email has been verified successfully!')
      
      // Refresh user data if logged in
      if (isAuthenticated) {
        window.location.reload()
      } else {
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed'
      setError(errorMessage)
      showNotification('error', 'Verification Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                <FaSpinner className="text-white text-4xl animate-spin" />
              </div>
            </div>
            <h2 className="text-4xl font-heading font-bold dark:text-white light:text-light-text">
              Verifying Email...
            </h2>
            <p className="mt-2 dark:text-dark-muted light:text-light-muted">
              Please wait while we verify your email address
            </p>
          </div>
        </div>
      </div>
    )
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
            <h2 className="text-4xl font-heading font-bold dark:text-white light:text-light-text">
              Email Verified!
            </h2>
            <p className="mt-4 dark:text-dark-muted light:text-light-muted">
              Your email address has been successfully verified.
            </p>
            {isAuthenticated ? (
              <div className="mt-6">
                <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'registrar' ? '/registrar' : '/external'} className="btn-primary inline-flex items-center justify-center">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <p className="mt-2 text-sm dark:text-dark-muted light:text-light-muted">
                Redirecting to login...
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-slide-down">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MdError className="text-white text-4xl" />
              </div>
            </div>
            <h2 className="text-4xl font-heading font-bold dark:text-white light:text-light-text">
              Verification Failed
            </h2>
            <p className="mt-4 dark:text-dark-muted light:text-light-muted">
              {error}
            </p>
            <p className="mt-2 text-sm dark:text-dark-muted light:text-light-muted">
              The verification link may be invalid or expired.
            </p>
            <div className="mt-6 space-y-3">
              {isAuthenticated && (
                <button
                  onClick={async () => {
                    try {
                      await authService.resendVerification()
                      showNotification('success', 'Email Sent', 'A new verification email has been sent to your inbox.')
                    } catch (err) {
                      showNotification('error', 'Error', 'Failed to resend verification email.')
                    }
                  }}
                  className="btn-secondary w-full inline-flex items-center justify-center"
                >
                  <MdEmail className="mr-2" />
                  Resend Verification Email
                </button>
              )}
              <Link to="/login" className="btn-primary w-full inline-flex items-center justify-center">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default VerifyEmail
