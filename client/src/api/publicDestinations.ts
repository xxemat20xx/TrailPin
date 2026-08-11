import apiClient from './client'; // still uses the same Axios instance (cookies sent, but optional)

export const getAllStopPhotos = () => apiClient.get('/public/itineraries/photos/stops');

export const getPublicItineraries = () => apiClient.get('/public/itineraries');

export const getPublicItinerary = (id: string) =>
  apiClient.get(`/public/itineraries/${id}`);