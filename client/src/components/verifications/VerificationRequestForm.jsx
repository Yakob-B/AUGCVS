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
  MdClose,
  MdVerified,
  MdSend
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 animate-fade-in overflow-y-auto">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-scale-in border border-white/20 my-4">
        {/* Header with Gradient */}
        <div className="relative p-5 md:p-6 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-white to-teal-50">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-200/50 to-transparent rounded-bl-full"></div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30">
              <MdVerified className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-heading font-bold bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Verification Request
              </h2>
              <p className="text-sm text-gray-500">
                Verify a graduation certificate
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="relative z-10 p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 active:scale-95"
              aria-label="Close"
            >
              <MdClose size={24} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Student ID */}
          <div>
            <label htmlFor="studentId" className="block text-sm font-semibold text-gray-600 mb-2">
              Student ID <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <MdSchool size={20} />
              </span>
              <input
                id="studentId"
                name="studentId"
                type="text"
                placeholder="Enter student ID (e.g., UGR/1234/12)"
                value={formData.studentId}
                onChange={handleChange}
                disabled={loading}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50/80 border-2 ${errors.studentId ? 'border-red-400 bg-red-50/50' : 'border-gray-200/50 hover:border-gray-300'} focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-gray-700 placeholder-gray-400`}
              />
            </div>
            {errors.studentId && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">{errors.studentId}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-600 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
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
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50/80 border-2 ${errors.fullName ? 'border-red-400 bg-red-50/50' : 'border-gray-200/50 hover:border-gray-300'} focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-gray-700 placeholder-gray-400`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">{errors.fullName}</p>
            )}
          </div>

          {/* Graduation Year and Degree Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Graduation Year */}
            <div>
              <label htmlFor="graduationYear" className="block text-sm font-semibold text-gray-600 mb-2">
                Graduation Year <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <MdCalendarToday size={20} />
                </span>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50/80 border-2 ${errors.graduationYear ? 'border-red-400 bg-red-50/50' : 'border-gray-200/50 hover:border-gray-300'} focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-gray-700 cursor-pointer`}
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
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">{errors.graduationYear}</p>
              )}
            </div>

            {/* Degree Type */}
            <div>
              <label htmlFor="degreeType" className="block text-sm font-semibold text-gray-600 mb-2">
                Degree Type <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <MdDescription size={20} />
                </span>
                <select
                  id="degreeType"
                  name="degreeType"
                  value={formData.degreeType}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50/80 border-2 ${errors.degreeType ? 'border-red-400 bg-red-50/50' : 'border-gray-200/50 hover:border-gray-300'} focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-gray-700 cursor-pointer`}
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
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">{errors.degreeType}</p>
              )}
            </div>
          </div>

          {/* Certificate File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Certificate File <span className="text-red-400">*</span>
            </label>
            {!formData.certificateFile ? (
              <div className="group border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
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
                  className="cursor-pointer flex flex-col items-center relative z-10"
                >
                  <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MdUpload className="text-3xl text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">
                    Click to upload certificate
                  </p>
                  <p className="text-sm text-gray-400">
                    PDF, JPG, JPEG, or PNG (Max 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-2 border-gray-200/50">
                <div className="flex items-center space-x-4 flex-1">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Certificate preview"
                      className="w-14 h-14 object-cover rounded-xl shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/30">
                      PDF
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 font-semibold truncate">{formData.certificateFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(formData.certificateFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2.5 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 active:scale-95"
                >
                  <MdClose size={20} />
                </button>
              </div>
            )}
            {errors.certificateFile && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">{errors.certificateFile}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-xl p-4">
            <p className="text-sm text-blue-600">
              <strong>📋 Note:</strong> Please ensure the certificate details match the graduate's records.
              Incorrect information may result in rejection of your verification request.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3.5 px-6 text-gray-600 font-medium rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex-1 py-3.5 px-6 overflow-hidden rounded-xl font-bold shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center
                bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white
                shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/25 before:to-white/0 
                before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </span>
              ) : (
                <>
                  <MdSend className="mr-2 text-lg group-hover:translate-x-1 transition-transform" />
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
