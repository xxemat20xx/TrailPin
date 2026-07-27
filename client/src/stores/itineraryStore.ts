import { create } from 'zustand';
import type { Destination } from '../api/destination';

export interface Stop {
    id: string;
    destination: Destination;
}

interface ItineraryState {
    name: string;
    stops: Stop[];
    setName: (name: string) => void;
    addStop: (destination: Destination) => void;
    removeStop: (stopId: string) => void;
    reorderStops: (newStops: Stop[]) => void;
    clear: () => void;
}

export const useItineraryStore = create<ItineraryState>((set) => ({
    name: '',
    stops: [],
    setName: (name) => set({ name }),
    addStop: (destination) =>
        set((state) => ({
            stops: [...state.stops, { id: crypto.randomUUID(), destination }],
        })),
    removeStop: (stopId) =>
        set((state) => ({
            stops: state.stops.filter((s) => s.id !== stopId),
        })),
    reorderStops: (newStops) => set({ stops: newStops }),
    clear: () => set({ name: '', stops: [] }),
}));