import api from './api.js';

export const getWebhookConfig = () => api.get('/settings/webhook');
