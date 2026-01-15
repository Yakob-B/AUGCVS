import api from './api'

export const getAuditLogs = async (page = 1, limit = 20, action = '') => {
    try {
        const params = new URLSearchParams({
            page,
            limit,
            ...(action && { action })
        })

        const response = await api.get(`/audit-logs?${params}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}
