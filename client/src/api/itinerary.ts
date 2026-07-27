import apiClient from './client';

export const getItinerary = (id: string) => apiClient.get(`/itineraries/${id}`);

export const createItinerary = (data: { name: string; stops: { destinationId: string; order: number }[] }) =>
    apiClient.post('/itineraries', data);

export const updateItinerary = (id: string, data: { name: string; stops: { destinationId: string; order: number }[] }) =>
    apiClient.put(`/itineraries/${id}`, data);

export const calculateRoute = (coordinates: { lat: number; lng: number }[]) =>
    apiClient.post('/itineraries/calculate-route', { coordinates });