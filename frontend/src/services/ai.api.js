import api from './api.js';

export const getAISettings = () => api.get('/ai/settings');
export const updateAISettings = (data) => api.patch('/ai/settings', data);
