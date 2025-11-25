import React, { useState, useEffect } from 'react'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as graduateService from '../../services/graduates'
import { MdClose, MdCloudUpload, MdDelete } from 'react-icons/md'
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
      console.error('Graduate submission error:', error)
      console.error('Error response:', error.response?.data)

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
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            <p className="text-gray-700">Loading graduate details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Shared Input Styles
  const inputLabelClass = "block text-sm font-semibold text-gray-600 mb-2"
  const inputClass = "block w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 transition-colors text-gray-700 placeholder-gray-400"
  const errorClass = "mt-1 text-xs text-red-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">

        {/* Header */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-heading font-bold text-gray-800">
              {graduateId ? 'Edit Graduate' : 'Registration Form'}
            </h2>
            <p className="text-gray-500 mt-1">
              {graduateId ? 'Update the graduate\'s information below.' : 'Enter the graduate\'s details to create a new record.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

          {/* Section: Personal Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Personal Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student ID */}
              <div>
                <label className={inputLabelClass}>Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. UGR/1234/12"
                  className={`${inputClass} ${errors.studentId ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.studentId && <p className={errorClass}>{errors.studentId}</p>}
              </div>

              {/* Status */}
              <div>
                <label className={inputLabelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className={inputLabelClass}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.firstName ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className={inputLabelClass}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.lastName ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Middle Name */}
              <div>
                <label className={inputLabelClass}>Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className={inputLabelClass}>Birthday</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`${inputClass} ${errors.dateOfBirth ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth}</p>}
              </div>
            </div>

            {/* Gender - Radio Buttons */}
            <div>
              <label className={inputLabelClass}>Gender</label>
              <div className="flex items-center space-x-6 mt-2">
                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${formData.gender === 'male' ? 'border-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                    {formData.gender === 'male' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                  </div>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-gray-700">Male</span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-2 transition-colors ${formData.gender === 'female' ? 'border-pink-500' : 'border-gray-300 group-hover:border-pink-400'}`}>
                    {formData.gender === 'female' && <div className="w-3 h-3 rounded-full bg-pink-500" />}
                  </div>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="text-gray-700">Female</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section: Academic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Academic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Program */}
              <div>
                <label className={inputLabelClass}>Program</label>
                <input
                  type="text"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.program ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.program && <p className={errorClass}>{errors.program}</p>}
              </div>

              {/* Department */}
              <div>
                <label className={inputLabelClass}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.department ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.department && <p className={errorClass}>{errors.department}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* College */}
              <div>
                <label className={inputLabelClass}>College</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.college ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.college && <p className={errorClass}>{errors.college}</p>}
              </div>

              {/* Degree Type */}
              <div>
                <label className={inputLabelClass}>Degree Type</label>
                <select
                  name="degreeType"
                  value={formData.degreeType}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.degreeType ? 'border-red-500 bg-red-50' : ''}`}
                >
                  <option value="">Select Option</option>
                  {degreeTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.degreeType && <p className={errorClass}>{errors.degreeType}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Graduation Year */}
              <div>
                <label className={inputLabelClass}>Graduation Year</label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.graduationYear ? 'border-red-500 bg-red-50' : ''}`}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Graduation Date */}
              <div>
                <label className={inputLabelClass}>Graduation Date</label>
                <input
                  type="date"
                  name="graduationDate"
                  value={formData.graduationDate}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.graduationDate ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.graduationDate && <p className={errorClass}>{errors.graduationDate}</p>}
              </div>

              {/* GPA */}
              <div>
                <label className={inputLabelClass}>GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${inputClass} ${errors.gpa ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.gpa && <p className={errorClass}>{errors.gpa}</p>}
              </div>
            </div>
          </div>

          {/* Section: Certificate */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Certificate Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certificate Number */}
              <div>
                <label className={inputLabelClass}>Certificate Number</label>
                <input
                  type="text"
                  name="certificateNumber"
                  value={formData.certificateNumber}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.certificateNumber ? 'border-red-500 bg-red-50' : ''}`}
                />
                {errors.certificateNumber && <p className={errorClass}>{errors.certificateNumber}</p>}
              </div>

              {/* File Upload */}
              <div>
                <label className={inputLabelClass}>Certificate File</label>
                {!formData.certificateFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                    <input
                      type="file"
                      id="certificateFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="certificateFile" className="cursor-pointer">
                      <MdCloudUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Click to upload certificate</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold">
                          PDF
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-700 truncate">{formData.certificateFile.name}</p>
                        <p className="text-xs text-gray-500">{(formData.certificateFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                )}
                {errors.certificateFile && <p className={errorClass}>{errors.certificateFile}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default GraduateForm
