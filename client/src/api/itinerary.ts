import apiClient from './client';

//Itinerary CRUD
export const createItinerary = (data: FormData | any) => {
  if (data instanceof FormData) {
    return apiClient.post('/itineraries', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return apiClient.post('/itineraries', data);
};
export const getItineraries = () => apiClient.get('/itineraries');
export const getItinerary = (id: string) => apiClient.get(`/itineraries/${id}`);
export const updateItinerary = (id: string, data: FormData | any) => {
  if (data instanceof FormData) {
    return apiClient.put(`/itineraries/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return apiClient.put(`/itineraries/${id}`, data);
};
export const deleteItinerary = (id: string) => apiClient.delete(`/itineraries/${id}`);

// Route calculation
export const calculateRoute = (coordinates: { lat: number; lng: number }[]) =>
  apiClient.post('/itineraries/calculate-route', { coordinates });

export const getPublicItineraries = () => apiClient.get('/public/itineraries');
export const getPublicItinerary = (id: string) =>
  apiClient.get(`/public/itineraries/${id}`);