import api from './api.js';

export const getConnectUrl = () => api.get('/instagram/connect');
export const getAccount = () => api.get('/instagram/account');
export const getMedia = (accountId) => api.get(`/instagram/media${accountId ? `?accountId=${accountId}` : ''}`);
