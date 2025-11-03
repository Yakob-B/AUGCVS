import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as authService from '../../services/auth'
import { MdEmail, MdClose, MdCheckCircle } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const EmailVerificationBanner = () => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  if (!user || user.isEmailVerified || dismissed) {
    return null
  }

  const handleResend = async () => {
    setSending(true)
    try {
      await authService.resendVerification()
      showNotification('success', 'Email Sent', 'A new verification email has been sent to your inbox.')
    } catch (error) {
      showNotification('error', 'Error', 'Failed to resend verification email. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6 animate-slide-down">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <MdEmail className="text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold dark:text-white light:text-light-text mb-1">
              Email Verification Required
            </h3>
            <p className="text-sm dark:text-dark-muted light:text-light-muted mb-3">
              Please verify your email address to access all features. Check your inbox ({user.email}) for the verification link.
            </p>
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-sm text-primary-500 hover:text-primary-400 font-medium inline-flex items-center disabled:opacity-50"
            >
              {sending ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <MdEmail className="mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="dark:text-dark-muted light:text-light-muted hover:dark:text-dark-text hover:light:text-light-text transition-colors flex-shrink-0 ml-4"
        >
          <MdClose size={20} />
        </button>
      </div>
    </div>
  )
}

export default EmailVerificationBanner
