import api from './api'

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export const getMe = async () => {
  const response = await api.get('/auth/me')
  return response.data.data
}

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`)
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export const resetPassword = async (token, password) => {
  const response = await api.put(`/auth/reset-password/${token}`, { password })
  return response.data
}

export const resendVerification = async () => {
  const response = await api.post('/auth/resend-verification')
  return response.data
}

export const contactAdmin = async (contactData) => {
  const response = await api.post('/auth/contact-admin', contactData)
  return response.data
}