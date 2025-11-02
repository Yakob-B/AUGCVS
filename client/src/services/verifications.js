import api from './api'

export const createVerification = async (formData) => {
  const response = await api.post('/verifications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getVerifications = async (params = {}) => {
  const response = await api.get('/verifications', { params })
  return response.data
}

export const getVerification = async (id) => {
  const response = await api.get(`/verifications/${id}`)
  return response.data
}

export const processVerification = async (id, data) => {
  const response = await api.put(`/verifications/${id}/process`, data)
  return response.data
}

export const getMyVerifications = async () => {
  const response = await api.get('/verifications/my-requests')
  return response.data
}
