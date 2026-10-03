import api from './api.js';

export const getActivityLogs = (filter = 'ALL') => api.get(`/activity?filter=${filter}`);
export const getDashboardStats = () => api.get('/activity/stats');
