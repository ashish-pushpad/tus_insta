import api from './api.js';

export const getConversations = () => api.get('/conversations');
export const getConversationMessages = (id) => api.get(`/conversations/${id}/messages`);
