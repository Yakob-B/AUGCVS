import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as verificationService from '../../services/verifications'
import { 
  MdSchool, 
  MdPerson, 
  MdCalendarToday, 
  MdDescription, 
  MdUpload,
  MdClose
} from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const VerificationRequestForm = ({ onClose, onSuccess }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    graduationYear: new Date().getFullYear(),
    degreeType: '',
    certificateFile: null,
  })
  const [errors, setErrors] = useState({})
  const [filePreview, setFilePreview] = useState(null)

  const degreeTypes = [
    'Bachelor of Science',
    'Bachelor of Arts',
    'Bachelor of Engineering',
    'Master of Science',
    'Master of Arts',
    'Master of Engineering',
    'PhD',
    'Doctor of Philosophy',
    'Diploma',
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          certificateFile: 'Only PDF, JPG, JPEG, and PNG files are allowed',
        }))
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          certificateFile: 'File size must be less than 5MB',
        }))
        return
      }

      setFormData((prev) => ({
        ...prev,
        certificateFile: file,
      }))
      setErrors((prev) => ({
        ...prev,
        certificateFile: '',
      }))

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const validateForm = () => {
    let formIsValid = true
    const newErrors = {}

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required'
      formIsValid = false
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
      formIsValid = false
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Please enter first name and last name'
      formIsValid = false
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required'
      formIsValid = false
    } else if (formData.graduationYear < 1950 || formData.graduationYear > currentYear) {
      newErrors.graduationYear = 'Please enter a valid graduation year'
      formIsValid = false
    }

    if (!formData.degreeType) {
      newErrors.degreeType = 'Degree type is required'
      formIsValid = false
    }

    if (!formData.certificateFile) {
      newErrors.certificateFile = 'Certificate file is required'
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

    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('studentId', formData.studentId.trim())
      submitData.append('fullName', formData.fullName.trim())
      submitData.append('graduationYear', formData.graduationYear)
      submitData.append('degreeType', formData.degreeType)
      submitData.append('certificateFile', formData.certificateFile)

      const response = await verificationService.createVerification(submitData)
      
      showNotification(
        'success',
        'Request Submitted!',
        `Verification request #${response.data.requestNumber} has been submitted successfully.`
      )
      
      if (onSuccess) {
        onSuccess(response.data)
      } else {
        navigate('/external/verifications')
      }
      
      if (onClose) {
        onClose()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to submit verification request'
      showNotification('error', 'Submission Failed', errorMessage)
      
      if (error.response?.data?.errors) {
        const apiErrors = {}
        error.response.data.errors.forEach((err) => {
          apiErrors[err.param] = err.msg
        })
        setErrors(apiErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      certificateFile: null,
    }))
    setFilePreview(null)
    setErrors((prev) => ({
      ...prev,
      certificateFile: '',
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <MdSchool className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                Submit Verification Request
              </h2>
              <p className="text-sm text-dark-muted">
                Verify a graduation certificate
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-dark-muted hover:text-white hover:bg-dark-surface rounded-lg transition-colors"
            >
              <MdClose size={24} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student ID */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-dark-text mb-2">
              Student ID <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
                <MdSchool size={20} />
              </span>
              <input
                id="studentId"
                name="studentId"
                type="text"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={handleChange}
                disabled={loading}
                className={`input pl-10 ${errors.studentId ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.studentId && (
              <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.studentId}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-dark-text mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
                <MdPerson size={20} />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter full name (First Name Last Name)"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className={`input pl-10 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.fullName}</p>
            )}
          </div>

          {/* Graduation Year and Degree Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Graduation Year */}
            <div>
              <label htmlFor="graduationYear" className="block text-sm font-medium text-dark-text mb-2">
                Graduation Year <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
                  <MdCalendarToday size={20} />
                </span>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input pl-10 ${errors.graduationYear ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {errors.graduationYear && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.graduationYear}</p>
              )}
            </div>

            {/* Degree Type */}
            <div>
              <label htmlFor="degreeType" className="block text-sm font-medium text-dark-text mb-2">
                Degree Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
                  <MdDescription size={20} />
                </span>
                <select
                  id="degreeType"
                  name="degreeType"
                  value={formData.degreeType}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input pl-10 ${errors.degreeType ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select Degree Type</option>
                  {degreeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errors.degreeType && (
                <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.degreeType}</p>
              )}
            </div>
          </div>

          {/* Certificate File Upload */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Certificate File <span className="text-red-400">*</span>
            </label>
            {!formData.certificateFile ? (
              <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-primary-500/50 transition-colors">
                <input
                  type="file"
                  id="certificateFile"
                  name="certificateFile"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
                <label
                  htmlFor="certificateFile"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-dark-surface rounded-xl flex items-center justify-center mb-4">
                    <MdUpload className="text-primary-500 text-3xl" />
                  </div>
                  <p className="text-dark-text font-medium mb-1">
                    Click to upload certificate
                  </p>
                  <p className="text-sm text-dark-muted">
                    PDF, JPG, JPEG, or PNG (Max 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="border border-dark-border rounded-lg p-4 bg-dark-surface">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Certificate preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-dark-card rounded-lg flex items-center justify-center">
                        <MdDescription className="text-primary-500 text-2xl" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-text font-medium truncate">{formData.certificateFile.name}</p>
                      <p className="text-sm text-dark-muted">
                        {(formData.certificateFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-dark-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              </div>
            )}
            {errors.certificateFile && (
              <p className="mt-1 text-sm text-red-400 animate-slide-down">{errors.certificateFile}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Please ensure the certificate details match the graduate's records. 
              Incorrect information may result in rejection of your verification request.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-dark-border">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </span>
              ) : (
                <>
                  <MdUpload className="mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerificationRequestForm
