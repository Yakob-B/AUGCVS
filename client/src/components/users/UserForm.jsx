import React, { useState, useEffect } from 'react'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as userService from '../../services/users'
import { MdClose } from 'react-icons/md'
import { FaSpinner } from 'react-icons/fa'

const UserForm = ({ userId, onClose, onSuccess }) => {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!userId)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'external',
    organization: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (userId) {
      loadUser()
    }
  }, [userId])

  const loadUser = async () => {
    try {
      setFetching(true)
      const response = await userService.getUsers()
      const user = response.data.find(u => u._id === userId)
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'external',
          organization: user.organization || '',
        })
      }
    } catch (error) {
      showNotification('error', 'Error loading user', error.message)
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
      formIsValid = false
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
      formIsValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      formIsValid = false
    } else if (!/\S+@\S+\.\S/.test(formData.email)) {
      newErrors.email = 'Email address is invalid'
      formIsValid = false
    }

    // Password only required for new users
    if (!userId) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
        formIsValid = false
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
        formIsValid = false
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
        formIsValid = false
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      formIsValid = false
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      formIsValid = false
    }

    if (formData.role === 'external' && !formData.organization.trim()) {
      newErrors.organization = 'Organization is required for external users'
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
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        role: formData.role,
        organization: formData.organization.trim() || undefined,
      }

      // Only include password if provided
      if (formData.password) {
        submitData.password = formData.password
      }

      let response
      if (userId) {
        response = await userService.updateUser(userId, submitData)
        showNotification('success', 'User Updated', 'User has been updated successfully.')
      } else {
        response = await userService.addUser(submitData)
        showNotification('success', 'User Added', 'New user has been added successfully.')
      }

      if (onSuccess) {
        onSuccess(response.data)
      }
      onClose()
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to save user'
      showNotification('error', 'Save Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            <p className="text-gray-700">Loading user details...</p>
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
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">

        {/* Header */}
        <div className="p-5 md:p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">
              {userId ? 'Edit User' : 'User Registration'}
            </h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {userId ? 'Update user account details.' : 'Create a new user account.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 rounded-lg hover:bg-gray-100 active:scale-95"
            aria-label="Close"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 md:space-y-8 overflow-y-auto custom-scrollbar">

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Personal Details</h3>

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

            {/* Email */}
            <div>
              <label className={inputLabelClass}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${inputClass} ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>
          </div>

          {/* Security */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Security</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label className={inputLabelClass}>
                  Password {!userId && <span className="text-red-500">*</span>}
                  {userId && <span className="text-gray-400 font-normal ml-1">(Optional)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={userId ? 'New password' : 'Enter password'}
                    className={`${inputClass} pr-16 ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className={errorClass}>{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={inputLabelClass}>
                  Confirm Password {!userId && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`${inputClass} pr-16 ${errors.confirmPassword ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Role & Organization */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Role & Permissions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div>
                <label className={inputLabelClass}>User Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="admin">Admin</option>
                  <option value="registrar">Registrar</option>
                  <option value="external">External User</option>
                </select>
              </div>

              {/* Organization (Conditional) */}
              {formData.role === 'external' && (
                <div>
                  <label className={inputLabelClass}>Organization</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className={`${inputClass} ${errors.organization ? 'border-red-500 bg-red-50' : ''}`}
                  />
                  {errors.organization && <p className={errorClass}>{errors.organization}</p>}
                </div>
              )}
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
                userId ? 'Update User' : 'Create User'
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

export default UserForm
