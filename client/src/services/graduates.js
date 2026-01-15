import api from './api'

export const getGraduates = async (params = {}) => {
  const response = await api.get('/graduates', { params })
  return response.data
}

export const getGraduate = async (id) => {
  const response = await api.get(`/graduates/${id}`)
  return response.data
}

export const createGraduate = async (formData) => {
  const response = await api.post('/graduates', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const updateGraduate = async (id, formData) => {
  const response = await api.put(`/graduates/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteGraduate = async (id) => {
  const response = await api.delete(`/graduates/${id}`)
  return response.data
}

export const searchGraduates = async (query) => {
  const response = await api.get('/graduates/search', { params: { query } })
  return response.data
}

export const getFilters = async () => {
  const response = await api.get('/graduates/filters')
  return response.data
}

export const bulkUploadGraduates = async (formData) => {
  const response = await api.post('/graduates/bulk', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000 // 5 minutes timeout for large files
  })
  return response.data
}
