import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../pages/contexts/NotificationContext';
import { register as registerAPI } from '../../services/auth';
import { MdPerson, MdEmail, MdLock, MdBusiness } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin', // Default to admin
    organization: '', // Only for external users
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevState) => ({
      ...prevState,
      [name]: '',
    }));
  };

  const validateForm = () => {
    let formIsValid = true;
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First Name is required';
      formIsValid = false;
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last Name is required';
      formIsValid = false;
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
      formIsValid = false;
    } else if (!/\S+@\S+\.\S/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
      formIsValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      formIsValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      formIsValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      formIsValid = false;
    }
    if (formData.role === 'external' && !formData.organization) {
      newErrors.organization = 'Organization is required for external users';
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await registerAPI(formData);
      showNotification('success', 'Registration successful!', response.message);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already be in use.');
      showNotification('error', 'Registration failed', err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center">
          <img src={process.env.PUBLIC_URL + '/au-logo.png'} alt="AU Logo" className="w-20 h-20 mb-2 animate-spin-slow hover:animate-none" />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white font-heading">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 font-sans">
            Ambo University Graduation Verification System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            {/* First Name */}
            <div className="mb-2 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <MdPerson />
              </span>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans`}
              />
              {errors.firstName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="mb-2 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <MdPerson />
              </span>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans`}
              />
              {errors.lastName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.lastName}</p>}
            </div>

            {/* Email */}
            <div className="mb-2 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <MdEmail />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans`}
              />
              {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-2 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <MdLock />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="mb-2 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                <MdLock />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
              {errors.confirmPassword && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Role */}
            <div className="mb-2">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans"
              >
                <option value="admin">Admin</option>
                <option value="registrar">Registrar</option>
                <option value="external">External User</option>
              </select>
            </div>

            {/* Organization (only for external) */}
            {formData.role === 'external' && (
              <div className="mb-2 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <MdBusiness />
                </span>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={loading}
                  className={`appearance-none relative block w-full pl-10 px-3 py-2 border ${errors.organization ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-sans`}
                />
                {errors.organization && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.organization}</p>}
              </div>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-sans transition"
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 