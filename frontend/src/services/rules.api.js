import api from './api.js';

export const getSpecialRules = () => api.get('/special-rules');
export const createSpecialRule = (data) => api.post('/special-rules', data);
export const updateSpecialRule = (id, data) => api.patch(`/special-rules/${id}`, data);
export const deleteSpecialRule = (id) => api.delete(`/special-rules/${id}`);
