import apiClient from './client';

export const getMe = () => apiClient.get('/auth/me');

export const loginUser = (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data);

export const registerUser = (data: { email: string; password: string; name?: string }) =>
    apiClient.post('/auth/register', data);

export const verifyEmail = (token: string) =>
    apiClient.get(`/auth/verify-email?token=${token}`);

export const logoutUser = () => apiClient.post('/auth/logout');

export const getAllUsers = () => apiClient.get('/auth/users');