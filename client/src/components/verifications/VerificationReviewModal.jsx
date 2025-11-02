import React, { useState, useEffect } from 'react'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as verificationService from '../../services/verifications'
import { 
  MdClose,
  MdVerifiedUser,
  MdPerson,
  MdSchool,
  MdDescription,
  MdCheckCircle,
  MdCancel,
  MdVisibility,
  MdDownload
} from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const VerificationReviewModal = ({ verificationId, onClose, onSuccess }) => {
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [verification, setVerification] = useState(null)
  const [formData, setFormData] = useState({
    status: 'approved',
    verificationResult: 'authentic',
    comments: '',
  })
  const [errors, setErrors] = useState({})
  const [showCertificate, setShowCertificate] = useState(false)

  useEffect(() => {
    loadVerification()
  }, [verificationId])

  const loadVerification = async () => {
    try {
      setFetching(true)
      const response = await verificationService.getVerification(verificationId)
      setVerification(response.data)
      if (response.data.status !== 'pending') {
        setFormData({
          status: response.data.status,
          verificationResult: response.data.verificationResult,
          comments: response.data.comments || '',
        })
      }
    } catch (error) {
      showNotification('error', 'Error loading verification', error.message)
      onClose()
    } finally {
      setFetching(false)
    }
  }

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

    if (!formData.status) {
      newErrors.status = 'Status is required'
      formIsValid = false
    }

    if (!formData.verificationResult) {
      newErrors.verificationResult = 'Verification result is required'
      formIsValid = false
    }

    if (!formData.comments.trim()) {
      newErrors.comments = 'Comments are required'
      formIsValid = false
    } else if (formData.comments.trim().length < 10) {
      newErrors.comments = 'Comments must be at least 10 characters'
      formIsValid = false
    }

    setErrors(newErrors)
    return formIsValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      showNotification('error', 'Validation Error', 'Please fix the errors in the form')
      return
    }

    if (verification.status !== 'pending') {
      showNotification('error', 'Already Processed', 'This verification has already been processed')
      return
    }

    setLoading(true)
    try {
      await verificationService.processVerification(verificationId, formData)
      showNotification(
        'success',
        'Verification Processed',
        `Verification request #${verification.requestNumber} has been ${formData.status}.`
      )
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process verification'
      showNotification('error', 'Processing Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getCertificateUrl = () => {
    if (!verification?.certificateFile) return null
    // If it's already a full URL, return as is
    if (verification.certificateFile.startsWith('http')) {
      return verification.certificateFile
    }
    // Otherwise construct the API URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    return `${baseUrl}${verification.certificateFile}`
  }

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-primary-500 text-2xl" />
            <p className="text-white">Loading verification details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!verification) {
    return null
  }

  const isProcessed = verification.status !== 'pending'
  const certificateUrl = getCertificateUrl()

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <MdVerifiedUser className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Review Verification Request
              </h2>
              <p className="text-sm text-dark-muted">
                Request #{verification.requestNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dark-muted hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Verification Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graduate Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MdPerson className="mr-2 text-primary-500" />
                Graduate Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-dark-muted">Name</p>
                  <p className="text-white font-medium">
                    {verification.graduate?.firstName} {verification.graduate?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Student ID</p>
                  <p className="text-white font-medium">{verification.graduate?.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Certificate Number</p>
                  <p className="text-white font-medium">{verification.certificateNumber}</p>
                </div>
              </div>
            </div>

            {/* Requester Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MdPerson className="mr-2 text-primary-500" />
                Requester Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-dark-muted">Name</p>
                  <p className="text-white font-medium">
                    {verification.requester?.firstName} {verification.requester?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Email</p>
                  <p className="text-white font-medium">{verification.requester?.email}</p>
                </div>
                {verification.requester?.organization && (
                  <div>
                    <p className="text-sm text-dark-muted">Organization</p>
                    <p className="text-white font-medium">{verification.requester.organization}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate File */}
          {certificateUrl && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MdSchool className="mr-2 text-primary-500" />
                  Certificate File
                </h3>
                <div className="flex items-center space-x-2">
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-sm inline-flex items-center"
                  >
                    <MdVisibility className="mr-2" />
                    View
                  </a>
                  <a
                    href={certificateUrl}
                    download
                    className="btn-secondary text-sm inline-flex items-center"
                  >
                    <MdDownload className="mr-2" />
                    Download
                  </a>
                </div>
              </div>
              {verification.certificateFile.endsWith('.pdf') ? (
                <div className="bg-dark-surface rounded-lg p-4 border border-dark-border">
                  <p className="text-dark-muted text-sm mb-2">PDF Certificate</p>
                  <iframe
                    src={certificateUrl}
                    className="w-full h-96 rounded-lg"
                    title="Certificate"
                  />
                </div>
              ) : (
                <div className="bg-dark-surface rounded-lg p-4 border border-dark-border">
                  <img
                    src={certificateUrl}
                    alt="Certificate"
                    className="w-full h-auto rounded-lg max-h-96 object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* Processing Form (only if pending and user is registrar/admin) */}
          {!isProcessed && (user.role === 'registrar' || user.role === 'admin') && (
            <form onSubmit={handleSubmit} className="card space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MdDescription className="mr-2 text-primary-500" />
                Process Verification
              </h3>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-dark-text mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'approved' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.status === 'approved'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                    }`}
                  >
                    <MdCheckCircle className={`text-2xl mx-auto mb-2 ${
                      formData.status === 'approved' ? 'text-green-500' : 'text-dark-muted'
                    }`} />
                    <p className={`font-medium ${
                      formData.status === 'approved' ? 'text-green-400' : 'text-dark-text'
                    }`}>
                      Approve
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'rejected' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.status === 'rejected'
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                    }`}
                  >
                    <MdCancel className={`text-2xl mx-auto mb-2 ${
                      formData.status === 'rejected' ? 'text-red-500' : 'text-dark-muted'
                    }`} />
                    <p className={`font-medium ${
                      formData.status === 'rejected' ? 'text-red-400' : 'text-dark-text'
                    }`}>
                      Reject
                    </p>
                  </button>
                </div>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-400">{errors.status}</p>
                )}
              </div>

              {/* Verification Result */}
              <div>
                <label htmlFor="verificationResult" className="block text-sm font-medium text-dark-text mb-2">
                  Verification Result <span className="text-red-400">*</span>
                </label>
                <select
                  id="verificationResult"
                  name="verificationResult"
                  value={formData.verificationResult}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.verificationResult ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="authentic">Authentic</option>
                  <option value="forged">Forged</option>
                  <option value="invalid">Invalid</option>
                </select>
                {errors.verificationResult && (
                  <p className="mt-1 text-sm text-red-400">{errors.verificationResult}</p>
                )}
              </div>

              {/* Comments */}
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-dark-text mb-2">
                  Comments <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows={4}
                  value={formData.comments}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your comments about this verification..."
                  className={`input ${errors.comments ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.comments && (
                  <p className="mt-1 text-sm text-red-400">{errors.comments}</p>
                )}
                <p className="mt-1 text-xs text-dark-muted">
                  Minimum 10 characters required
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    `Process as ${formData.status === 'approved' ? 'Approved' : 'Rejected'}`
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Already Processed Info */}
          {isProcessed && (
            <div className="card bg-dark-surface">
              <h3 className="text-lg font-semibold text-white mb-4">Processing Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-dark-muted">Status</p>
                  <p className={`font-semibold ${
                    verification.status === 'approved' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Result</p>
                  <p className="text-white font-medium capitalize">{verification.verificationResult}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-muted">Comments</p>
                  <p className="text-white">{verification.comments || 'No comments'}</p>
                </div>
                {verification.processedBy && (
                  <div>
                    <p className="text-sm text-dark-muted">Processed By</p>
                    <p className="text-white">
                      {verification.processedBy.firstName} {verification.processedBy.lastName}
                    </p>
                  </div>
                )}
                {verification.processedAt && (
                  <div>
                    <p className="text-sm text-dark-muted">Processed At</p>
                    <p className="text-white">
                      {new Date(verification.processedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerificationReviewModal
