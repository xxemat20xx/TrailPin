import apiClient from './client';

export interface Destination {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    userId?: string;
    createdAt?: Date;
    photos: { id: string; url: string; caption?: string }[];
}

export const getDestinations = () =>
    apiClient.get<Destination[]>('/destinations');

export const getDestination = (id: string) =>
    apiClient.get<Destination>(`/destinations/${id}`);

export const createDestination = (data: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
}) => apiClient.post('/destinations', data);

export const updateDestination = (
    id: string,
    data: Partial<{ name: string; latitude: number; longitude: number; address: string }>
) => apiClient.put(`/destinations/${id}`, data);

export const deleteDestination = (id: string) =>
    apiClient.delete(`/destinations/${id}`);

export const addPhoto = (destinationId: string, formData: FormData) =>
    apiClient.post(`/destinations/${destinationId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const deletePhoto = (destinationId: string, photoId: string) =>
    apiClient.delete(`/destinations/${destinationId}/photos/${photoId}`);