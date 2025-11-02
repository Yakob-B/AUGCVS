import React, { useState, useEffect } from 'react'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as graduateService from '../../services/graduates'
import { 
  MdClose,
  MdSchool,
  MdPerson,
  MdCalendarToday,
  MdDescription,
  MdUpload,
  MdNumbers,
  MdStar
} from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const GraduateForm = ({ graduateId, onClose, onSuccess }) => {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!graduateId)
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'male',
    program: '',
    department: '',
    college: '',
    graduationYear: new Date().getFullYear(),
    graduationDate: '',
    degreeType: '',
    gpa: '',
    certificateNumber: '',
    certificateFile: null,
    status: 'active',
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
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  useEffect(() => {
    if (graduateId) {
      loadGraduate()
    }
  }, [graduateId])

  const loadGraduate = async () => {
    try {
      setFetching(true)
      const response = await graduateService.getGraduate(graduateId)
      const graduate = response.data
      
      // Format dates for input fields
      const formatDate = (date) => {
        if (!date) return ''
        const d = new Date(date)
        return d.toISOString().split('T')[0]
      }

      setFormData({
        studentId: graduate.studentId || '',
        firstName: graduate.firstName || '',
        lastName: graduate.lastName || '',
        middleName: graduate.middleName || '',
        dateOfBirth: formatDate(graduate.dateOfBirth),
        gender: graduate.gender || 'male',
        program: graduate.program || '',
        department: graduate.department || '',
        college: graduate.college || '',
        graduationYear: graduate.graduationYear || currentYear,
        graduationDate: formatDate(graduate.graduationDate),
        degreeType: graduate.degreeType || '',
        gpa: graduate.gpa?.toString() || '',
        certificateNumber: graduate.certificateNumber || '',
        certificateFile: null, // Don't preload file
        status: graduate.status || 'active',
      })
    } catch (error) {
      showNotification('error', 'Error loading graduate', error.message)
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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          certificateFile: 'Only PDF, JPG, JPEG, and PNG files are allowed',
        }))
        return
      }

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
      formIsValid = false
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
      formIsValid = false
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
      formIsValid = false
    }

    if (!formData.program.trim()) {
      newErrors.program = 'Program is required'
      formIsValid = false
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required'
      formIsValid = false
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College is required'
      formIsValid = false
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Graduation year is required'
      formIsValid = false
    }

    if (!formData.graduationDate) {
      newErrors.graduationDate = 'Graduation date is required'
      formIsValid = false
    }

    if (!formData.degreeType) {
      newErrors.degreeType = 'Degree type is required'
      formIsValid = false
    }

    if (!formData.gpa || parseFloat(formData.gpa) < 0 || parseFloat(formData.gpa) > 4.0) {
      newErrors.gpa = 'GPA must be between 0 and 4.0'
      formIsValid = false
    }

    if (!formData.certificateNumber.trim()) {
      newErrors.certificateNumber = 'Certificate number is required'
      formIsValid = false
    }

    // Certificate file only required for new graduates
    if (!graduateId && !formData.certificateFile) {
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
      submitData.append('firstName', formData.firstName.trim())
      submitData.append('lastName', formData.lastName.trim())
      if (formData.middleName.trim()) {
        submitData.append('middleName', formData.middleName.trim())
      }
      submitData.append('dateOfBirth', formData.dateOfBirth)
      submitData.append('gender', formData.gender)
      submitData.append('program', formData.program.trim())
      submitData.append('department', formData.department.trim())
      submitData.append('college', formData.college.trim())
      submitData.append('graduationYear', formData.graduationYear)
      submitData.append('graduationDate', formData.graduationDate)
      submitData.append('degreeType', formData.degreeType)
      submitData.append('gpa', parseFloat(formData.gpa))
      submitData.append('certificateNumber', formData.certificateNumber.trim())
      submitData.append('status', formData.status)
      
      if (formData.certificateFile) {
        submitData.append('certificateFile', formData.certificateFile)
      }

      let response
      if (graduateId) {
        response = await graduateService.updateGraduate(graduateId, submitData)
        showNotification('success', 'Graduate Updated', 'Graduate record has been updated successfully.')
      } else {
        response = await graduateService.createGraduate(submitData)
        showNotification('success', 'Graduate Added', 'New graduate record has been added successfully.')
      }

      if (onSuccess) {
        onSuccess(response.data)
      }
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          error.message || 
                          'Failed to save graduate'
      showNotification('error', 'Save Failed', errorMessage)
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

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-primary-500 text-2xl" />
            <p className="text-white">Loading graduate details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl w-full max-w-4xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <MdSchool className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-white">
                {graduateId ? 'Edit Graduate' : 'Add New Graduate'}
              </h2>
              <p className="text-sm text-dark-muted">
                {graduateId ? 'Update graduate information' : 'Create a new graduate record'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MdPerson className="mr-2 text-primary-500" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student ID */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Student ID <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MdNumbers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={loading || !!graduateId}
                    className={`input pl-10 ${errors.studentId ? 'border-red-500' : ''} ${graduateId ? 'bg-dark-surface' : ''}`}
                  />
                </div>
                {errors.studentId && <p className="mt-1 text-sm text-red-400">{errors.studentId}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  disabled={loading}
                  className="input"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                    className={`input pl-10 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Gender <span className="text-red-400">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className="input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MdSchool className="mr-2 text-primary-500" />
              Academic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Program */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Program <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.program ? 'border-red-500' : ''}`}
                />
                {errors.program && <p className="mt-1 text-sm text-red-400">{errors.program}</p>}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Department <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.department ? 'border-red-500' : ''}`}
                />
                {errors.department && <p className="mt-1 text-sm text-red-400">{errors.department}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* College */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  College <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.college ? 'border-red-500' : ''}`}
                />
                {errors.college && <p className="mt-1 text-sm text-red-400">{errors.college}</p>}
              </div>

              {/* Degree Type */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Degree Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="degreeType"
                  value={formData.degreeType}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.degreeType ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Degree Type</option>
                  {degreeTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.degreeType && <p className="mt-1 text-sm text-red-400">{errors.degreeType}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Graduation Year */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Graduation Year <span className="text-red-400">*</span>
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input ${errors.graduationYear ? 'border-red-500' : ''}`}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.graduationYear && <p className="mt-1 text-sm text-red-400">{errors.graduationYear}</p>}
              </div>

              {/* Graduation Date */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Graduation Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                  <input
                    type="date"
                    name="graduationDate"
                    value={formData.graduationDate}
                    onChange={handleChange}
                    disabled={loading}
                    className={`input pl-10 ${errors.graduationDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.graduationDate && <p className="mt-1 text-sm text-red-400">{errors.graduationDate}</p>}
              </div>

              {/* GPA */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  GPA <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MdStar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="0.00 - 4.00"
                    className={`input pl-10 ${errors.gpa ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.gpa && <p className="mt-1 text-sm text-red-400">{errors.gpa}</p>}
              </div>
            </div>
          </div>

          {/* Certificate Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MdDescription className="mr-2 text-primary-500" />
              Certificate Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Certificate Number */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Certificate Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MdNumbers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted" size={20} />
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={handleChange}
                    disabled={loading}
                    className={`input pl-10 ${errors.certificateNumber ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.certificateNumber && <p className="mt-1 text-sm text-red-400">{errors.certificateNumber}</p>}
              </div>

              {/* Certificate File */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Certificate File {!graduateId && <span className="text-red-400">*</span>}
                </label>
                {!formData.certificateFile ? (
                  <div className="border-2 border-dashed border-dark-border rounded-lg p-4 text-center hover:border-primary-500/50 transition-colors">
                    <input
                      type="file"
                      id="certificateFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                    <label
                      htmlFor="certificateFile"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <MdUpload className="text-primary-500 text-3xl mb-2" />
                      <p className="text-dark-text text-sm">Click to upload</p>
                      <p className="text-xs text-dark-muted">PDF, JPG, JPEG, PNG (Max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="border border-dark-border rounded-lg p-4 bg-dark-surface">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <MdDescription className="text-primary-500 text-2xl" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-dark-text text-sm truncate">{formData.certificateFile.name}</p>
                          <p className="text-xs text-dark-muted">
                            {(formData.certificateFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-dark-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <MdClose size={20} />
                      </button>
                    </div>
                  </div>
                )}
                {errors.certificateFile && <p className="mt-1 text-sm text-red-400">{errors.certificateFile}</p>}
                {graduateId && (
                  <p className="mt-1 text-xs text-dark-muted">Leave empty to keep existing certificate</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
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
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  {graduateId ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                graduateId ? 'Update Graduate' : 'Create Graduate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GraduateForm
