import apiClient from './client'; // still uses the same Axios instance (cookies sent, but optional)
import type { Destination } from './destination'; // reuse interface

export const getPublicDestinations = () =>
    apiClient.get<Destination[]>('/public/destinations');

export const getPublicDestination = (id: string) =>
    apiClient.get<Destination>(`/public/destinations/${id}`);