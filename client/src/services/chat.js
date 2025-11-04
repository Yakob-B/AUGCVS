import api from './api';

export const getOrCreateChat = async (verificationId) => {
  const response = await api.get(`/chat/verification/${verificationId}`);
  return response.data;
};

export const sendMessage = async (verificationId, message) => {
  const response = await api.post(`/chat/verification/${verificationId}/message`, { message });
  return response.data;
};

export const getMyChats = async () => {
  const response = await api.get('/chat/my-chats');
  return response.data;
};

export const markAsRead = async (verificationId) => {
  const response = await api.put(`/chat/verification/${verificationId}/read`);
  return response.data;
};

