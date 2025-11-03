import React, { useState, useEffect } from 'react'
import { useNotification } from '../../pages/contexts/NotificationContext'
import * as userService from '../../services/users'
import { 
  MdClose,
  MdPerson,
  MdEmail,
  MdLock,
  MdBusiness,
  MdAdminPanelSettings
} from 'react-icons/md'
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
        <div className="dark:bg-dark-card light:bg-light-card border dark:border-dark-border light:border-light-border rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <FaSpinner className="animate-spin text-primary-500 text-2xl" />
            <p className="dark:text-white light:text-light-text">Loading user details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="dark:bg-dark-card light:bg-light-card border dark:border-dark-border light:border-light-border rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-dark-border light:border-light-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <MdPerson className="dark:text-white light:text-light-text text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold dark:text-white light:text-light-text">
                {userId ? 'Edit User' : 'Add New User'}
              </h2>
              <p className="text-sm dark:text-dark-muted light:text-light-muted">
                {userId ? 'Update user information' : 'Create a new user account'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                First Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                Last Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                Password {!userId && <span className="text-red-400">*</span>}
                {userId && <span className="dark:text-dark-muted light:text-light-muted text-xs">(Leave empty to keep current)</span>}
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder={userId ? 'Enter new password' : 'Enter password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted hover:dark:text-dark-text light:text-light-text"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                Confirm Password {!userId && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Confirm password"
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted hover:dark:text-dark-text light:text-light-text"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Role and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                Role <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MdAdminPanelSettings className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="input pl-10"
                >
                  <option value="admin">Admin</option>
                  <option value="registrar">Registrar</option>
                  <option value="external">External User</option>
                </select>
              </div>
            </div>

            {/* Organization (only for external) */}
            {formData.role === 'external' && (
              <div>
                <label className="block text-sm font-medium dark:text-dark-text light:text-light-text mb-2">
                  Organization <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MdBusiness className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    disabled={loading}
                    className={`input pl-10 ${errors.organization ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.organization && <p className="mt-1 text-sm text-red-400">{errors.organization}</p>}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
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
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  {userId ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                userId ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
