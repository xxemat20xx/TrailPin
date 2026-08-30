import apiClient from './client';

export const getProfile = () => apiClient.get('/profile');
export const updateProfile = (data: { username?: string; name?: string; avatar?: string }) =>
  apiClient.put('/profile', data);