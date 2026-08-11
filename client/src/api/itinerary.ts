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



export const likeItinerary = (id: string) => apiClient.post(`/itineraries/${id}/like`);

export const uploadStopPhoto = (itineraryId: string, stopId: string, formData: FormData) =>
  apiClient.post(`/itineraries/${itineraryId}/stops/${stopId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  export const getComments = (itineraryId: string) =>
  apiClient.get(`/public/itineraries/${itineraryId}/comments`);

export const addComment = (itineraryId: string, text: string) =>
  apiClient.post(`/itineraries/${itineraryId}/comments`, { text });

export const deleteComment = (itineraryId: string, commentId: string) =>
  apiClient.delete(`/itineraries/${itineraryId}/comments/${commentId}`);

