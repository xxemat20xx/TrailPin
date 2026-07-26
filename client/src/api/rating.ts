import apiClient from './client';

export const rateDestination = (destinationId: string, data: { score: number; review?: string }) =>
    apiClient.post(`/destinations/${destinationId}/rating`, data);

export const getRatings = () =>
    apiClient.get(`/public/destinations`); //rating.score