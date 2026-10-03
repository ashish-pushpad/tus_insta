import api from './api.js';

export const getAutomations = () => api.get('/automations');
export const updateAutomation = (data) => api.patch('/automations', data);
