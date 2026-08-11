// import { create } from 'zustand';
// import type { Destination } from '../api/destination';

// import {
//     createDestination,
//     updateDestination,
//     deleteDestination
// } from '../api/destination';


// interface DestinationState {
//     destinations: Destination[];
//     loading: boolean;
//     error: string | null;

//     // action helper
//     fetchDestinations: () => Promise<void>;
//     addDestination: (data: {
//         name: string;
//         latitude: number;
//         longitude: number;
//         address?: string;
//         description?: string;
//     }) => Promise<Destination>;
//     editDestination: (
//         id: string,
//         data: Partial<{
//             name: string;
//             latitude: number;
//             longitude: number;
//             address: string;
//             description: string;
//         }>
//     ) => Promise<void>;
//     removeDestination: (id: string) => Promise<void>;
// }

// export const useDestinationStore = create<DestinationState>((set, get) => ({
//     destinations: [],
//     loading: false,
//     error: null,

//     // Fetch public destinations
//     fetchDestinations: async () => {
//         set({ loading: true, error: null });
//         try {
//             const res = await getPublicDestinations();
//             set({ destinations: res.data, loading: false });
//         } catch (err: any) {
//             set({
//                 error: err.response?.data?.error || 'Failed to load destinations',
//                 loading: false,
//             });
//         }
//     },

//     // Add a new destination (requires auth)
//     addDestination: async (data) => {
//         set({ error: null });
//         try {
//             const res = await createDestination(data);
//             // Optionally refresh the list, or just add the new one
//             const newDest = res.data;
//             set((state) => ({
//                 destinations: [newDest, ...state.destinations],
//             }));
//             return newDest;
//         } catch (err: any) {
//             set({ error: err.response?.data?.error || 'Failed to add destination' });
//             throw err; // let the calling component handle it
//         }
//     },

//     // Edit a destination (requires auth)
//     editDestination: async (id, data) => {
//         set({ error: null });
//         try {
//             await updateDestination(id, data);
//             // Refresh the whole list to get updated photos etc.
//             await get().fetchDestinations();
//         } catch (err: any) {
//             set({
//                 error: err.response?.data?.error || 'Failed to update destination',
//             });
//             throw err;
//         }
//     },

//     // Delete a destination (requires auth)
//     removeDestination: async (id) => {
//         set({ error: null });
//         try {
//             await deleteDestination(id);
//             set((state) => ({
//                 destinations: state.destinations.filter((d) => d.id !== id),
//             }));
//         } catch (err: any) {
//             set({
//                 error: err.response?.data?.error || 'Failed to delete destination',
//             });
//             throw err;
//         }
//     },
// }));