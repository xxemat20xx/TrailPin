import apiClient from './client';

export interface Destination {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    description?
    userId?: string;
    user?: { name: string; avatar: string };
    createdAt?: Date;
    photos: { id: string; url: string; caption?: string }[];

    //interaction

    likeCount: number;
    commentCount: number;
    userLiked: boolean;
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

//interactions
export const deletePhoto = (destinationId: string, photoId: string) =>
    apiClient.delete(`/destinations/${destinationId}/photos/${photoId}`);

export const likeDestination = (id: string) =>
    apiClient.post(`/destinations/${id}/like`);

export const addComment = (destinationId: string, text: string) =>
    apiClient.post(`/destinations/${destinationId}/comments`, { text });

export const deleteComment = (destinationId: string, commentId: string) =>
    apiClient.delete(`/destinations/${destinationId}/comments/${commentId}`);

// export const getFeaturedDestinations = () =>
//     apiClient.get<Destination[]>('/public/destinations/featured');