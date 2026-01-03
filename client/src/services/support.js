import api from './api'

export const getSupportRequests = async () => {
    const response = await api.get('/support')
    return response.data
}

export const resolveSupportRequest = async (id) => {
    const response = await api.patch(`/support/${id}/resolve`)
    return response.data
}

export const deleteSupportRequest = async (id) => {
    const response = await api.delete(`/support/${id}`)
    return response.data
}
