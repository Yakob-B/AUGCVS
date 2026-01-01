import api from './api';

export const chatWithAI = (message, history = [], userContext = {}) => {
    return api.post('/ai/chat', {
        message,
        history,
        userContext
    });
};
