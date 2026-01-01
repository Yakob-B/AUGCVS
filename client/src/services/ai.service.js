import api from './api';

export const chatWithAI = async (message, history = [], userContext = {}) => {
    const response = await api.post('/ai/chat', {
        message,
        history,
        userContext
    });
    return response.data;
};

export const analyzeVerification = async (id) => {
    const response = await api.post(`/ai/analyze/${id}`);
    return response.data;
};
