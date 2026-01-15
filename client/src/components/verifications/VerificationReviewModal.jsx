import React, { useState, useEffect } from 'react'
import { useNotification } from '../../pages/contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import * as verificationService from '../../services/verifications'
import * as aiService from '../../services/ai.service'
import { FaSpinner, FaRobot, FaBrain, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import {
  MdClose,
  MdVerifiedUser,
  MdPerson,
  MdSchool,
  MdDescription,
  MdCheckCircle,
  MdCancel,
  MdVisibility,
  MdDownload,
  MdAutoFixHigh
} from 'react-icons/md'

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
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)

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

  const handleAiAnalyze = async () => {
    setAiAnalyzing(true)
    setAiAnalysis(null)
    try {
      const response = await aiService.analyzeVerification(verificationId)
      if (response.success && response.analysis) {
        setAiAnalysis(response.analysis)
        showNotification('success', 'AI Analysis Complete', 'Review the findings below')
      } else {
        throw new Error('Invalid response format from AI')
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'AI Analysis failed'
      showNotification('error', 'AI Error', msg)
    } finally {
      setAiAnalyzing(false)
    }
  }

  const applyAiRecommendation = () => {
    if (!aiAnalysis) return

    setFormData({
      status: aiAnalysis.recommendation === 'authentic' ? 'approved' : 'rejected',
      verificationResult: aiAnalysis.recommendation || 'authentic',
      comments: aiAnalysis.explanation || '',
    })

    showNotification('info', 'AI Recommendation Applied', 'Form fields have been updated based on AI findings.')
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
    const baseUrl = (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000').replace(/\/$/, '')
    const filePath = verification.certificateFile.startsWith('/') ? verification.certificateFile : `/${verification.certificateFile}`
    return `${baseUrl}${filePath}`
  }

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="dark:bg-dark-card light:bg-light-card border dark:border-dark-border light:border-light-border rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-primary-500 text-2xl" />
            <p className="dark:text-white light:text-light-text">Loading verification details...</p>
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
      <div className="dark:bg-dark-card light:bg-light-card border dark:border-dark-border light:border-light-border rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-dark-border light:border-light-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <MdVerifiedUser className="dark:text-white light:text-light-text text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold dark:text-white light:text-light-text">
                Review Verification Request
              </h2>
              <p className="text-sm dark:text-dark-muted light:text-light-muted">
                Request #{verification.requestNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 dark:text-dark-muted light:text-light-muted hover:dark:text-white light:text-light-text hover:dark:bg-dark-surface light:bg-light-surface rounded-lg transition-colors"
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
              <h3 className="text-lg font-semibold dark:text-white light:text-light-text mb-4 flex items-center">
                <MdPerson className="mr-2 text-primary-500" />
                Graduate Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Name</p>
                  <p className="dark:text-white light:text-light-text font-medium">
                    {verification.graduate?.firstName} {verification.graduate?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Student ID</p>
                  <p className="dark:text-white light:text-light-text font-medium">{verification.graduate?.studentId}</p>
                </div>
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Certificate Number</p>
                  <p className="dark:text-white light:text-light-text font-medium">{verification.certificateNumber}</p>
                </div>
              </div>
            </div>

            {/* Requester Information */}
            <div className="card">
              <h3 className="text-lg font-semibold dark:text-white light:text-light-text mb-4 flex items-center">
                <MdPerson className="mr-2 text-primary-500" />
                Requester Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Name</p>
                  <p className="dark:text-white light:text-light-text font-medium">
                    {verification.requester?.firstName} {verification.requester?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Email</p>
                  <p className="dark:text-white light:text-light-text font-medium">{verification.requester?.email}</p>
                </div>
                {verification.requester?.organization && (
                  <div>
                    <p className="text-sm dark:text-dark-muted light:text-light-muted">Organization</p>
                    <p className="dark:text-white light:text-light-text font-medium">{verification.requester.organization}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate File */}
          {certificateUrl && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-white light:text-light-text flex items-center">
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
                <div className="dark:bg-dark-surface light:bg-light-surface rounded-lg p-4 border dark:border-dark-border light:border-light-border">
                  <p className="dark:text-dark-muted light:text-light-muted text-sm mb-2">PDF Certificate</p>
                  <iframe
                    src={certificateUrl}
                    className="w-full h-96 rounded-lg"
                    title="Certificate"
                  />
                </div>
              ) : (
                <div className="dark:bg-dark-surface light:bg-light-surface rounded-lg p-4 border dark:border-dark-border light:border-light-border">
                  <img
                    src={certificateUrl}
                    alt="Certificate"
                    className="w-full h-auto rounded-lg max-h-96 object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* AI Assistance Section (Registrar Only) */}
          {user.role === 'registrar' && (
            <div className="card border-2 border-primary-500/30 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500/10 to-transparent p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaRobot className="text-primary-500 text-xl" />
                  <h3 className="text-lg font-bold dark:text-white light:text-light-text">AI Verification Assistant</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={aiAnalyzing || isProcessed}
                  className={`btn-primary text-sm flex items-center space-x-2 ${aiAnalyzing ? 'animate-pulse' : ''}`}
                >
                  {aiAnalyzing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <MdAutoFixHigh />
                      <span>Run AI Analysis</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5">
                {!aiAnalysis && !aiAnalyzing && (
                  <p className="text-sm dark:text-dark-muted light:text-light-muted text-center italic">
                    Run AI Analysis to automatically extract text and check for discrepancies.
                  </p>
                )}

                {aiAnalysis && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Match Confidence:</span>
                        <div className="w-48 h-2 bg-gray-200 dark:bg-dark-surface rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${aiAnalysis.matchPercentage > 80 ? 'bg-green-500' : aiAnalysis.matchPercentage > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${aiAnalysis.matchPercentage}%` }}
                          ></div>
                        </div>
                        <span className="font-bold">{aiAnalysis.matchPercentage}%</span>
                      </div>
                      <button
                        onClick={applyAiRecommendation}
                        className="text-xs btn-secondary py-1"
                      >
                        Apply Results to Form
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase text-primary-500">Extracted Data</h4>
                        <ul className="text-sm space-y-1">
                          {Object.entries(aiAnalysis.extractedData || {}).map(([key, val]) => (
                            <li key={key} className="flex justify-between">
                              <span className="capitalize dark:text-dark-muted">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-medium">{val || 'N/A'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase text-red-500">Insights</h4>
                        {aiAnalysis.discrepancies?.length > 0 ? (
                          <ul className="text-sm space-y-1">
                            {aiAnalysis.discrepancies.map((d, i) => (
                              <li key={i} className="flex items-start text-red-400">
                                <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-green-400 flex items-center">
                            <FaCheckCircle className="mr-2" /> No discrepancies found.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-primary-500/5 rounded-lg border border-primary-500/20">
                      <div className="flex items-center space-x-2 mb-1">
                        <FaBrain className="text-primary-500" />
                        <span className="text-xs font-bold uppercase">AI Explanation</span>
                      </div>
                      <p className="text-sm dark:text-gray-300 italic">{aiAnalysis.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Form (only if pending and user is registrar/admin) */}
          {!isProcessed && (user.role === 'registrar' || user.role === 'admin') && (
            <form onSubmit={handleSubmit} className="card space-y-6">
              <h3 className="text-lg font-semibold dark:text-white light:text-light-text flex items-center">
                <MdDescription className="mr-2 text-primary-500" />
                Process Verification
              </h3>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'approved' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.status === 'approved'
                      ? 'border-green-500 bg-green-500/10'
                      : 'dark:border-dark-border light:border-light-border dark:bg-dark-surface light:bg-light-surface hover:border-primary-500/50'
                      }`}
                  >
                    <MdCheckCircle className={`text-2xl mx-auto mb-2 ${formData.status === 'approved' ? 'text-green-500' : 'dark:text-dark-muted light:text-light-muted'
                      }`} />
                    <p className={`font-medium ${formData.status === 'approved' ? 'text-green-400' : 'dark:text-dark-text light:text-light-text'
                      }`}>
                      Approve
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'rejected' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.status === 'rejected'
                      ? 'border-red-500 bg-red-500/10'
                      : 'dark:border-dark-border light:border-light-border dark:bg-dark-surface light:bg-light-surface hover:border-primary-500/50'
                      }`}
                  >
                    <MdCancel className={`text-2xl mx-auto mb-2 ${formData.status === 'rejected' ? 'text-red-500' : 'dark:text-dark-muted light:text-light-muted'
                      }`} />
                    <p className={`font-medium ${formData.status === 'rejected' ? 'text-red-400' : 'dark:text-dark-text light:text-light-text'
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
                <label htmlFor="verificationResult" className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
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
                <label htmlFor="comments" className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
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
                <p className="mt-1 text-xs dark:text-dark-muted light:text-light-muted">
                  Minimum 10 characters required
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4 border-t dark:border-dark-border light:border-light-border">
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
                  className={`btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed ${formData.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
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
            <div className="card dark:bg-dark-surface light:bg-light-surface">
              <h3 className="text-lg font-semibold dark:text-white light:text-light-text mb-4">Processing Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Status</p>
                  <p className={`font-semibold ${verification.status === 'approved' ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Result</p>
                  <p className="dark:text-white light:text-light-text font-medium capitalize">{verification.verificationResult}</p>
                </div>
                <div>
                  <p className="text-sm dark:text-dark-muted light:text-light-muted">Comments</p>
                  <p className="dark:text-white light:text-light-text">{verification.comments || 'No comments'}</p>
                </div>
                {verification.processedBy && (
                  <div>
                    <p className="text-sm dark:text-dark-muted light:text-light-muted">Processed By</p>
                    <p className="dark:text-white light:text-light-text">
                      {verification.processedBy.firstName} {verification.processedBy.lastName}
                    </p>
                  </div>
                )}
                {verification.processedAt && (
                  <div>
                    <p className="text-sm dark:text-dark-muted light:text-light-muted">Processed At</p>
                    <p className="dark:text-white light:text-light-text">
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
