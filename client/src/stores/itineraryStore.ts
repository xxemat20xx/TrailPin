import { create } from 'zustand';

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  arrivalNotes?: string;
  estimatedStay?: string;
}

type NewStop = Omit<Stop, "id">;
interface ItineraryState {
  name: string;
  description: string;
  coverPhoto: string;
  estimatedTime: string;
  totalDistance: number | undefined;
  difficulty: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  stops: Stop[];

  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  setCoverPhoto: (url: string) => void;
  setEstimatedTime: (time: string) => void;
  setTotalDistance: (dist: number) => void;
  setDifficulty: (diff: string) => void;
  setTags: (tags: string[]) => void;
  setVisibility: (vis: 'public' | 'private' | 'unlisted') => void;

  addStop: (stop: NewStop) => void;
  removeStop: (stopId: string) => void;
  reorderStops: (stops: Stop[]) => void;
  clear: () => void;
}

export const useItineraryStore = create<ItineraryState>((set) => ({
  name: '',
  description: '',
  coverPhoto: '',
  estimatedTime: '',
  totalDistance: undefined,
  difficulty: 'Easy',
  tags: [],
  visibility: 'public',
  stops: [],

  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setCoverPhoto: (coverPhoto) => set({ coverPhoto }),
  setEstimatedTime: (estimatedTime) => set({ estimatedTime }),
  setTotalDistance: (totalDistance) => set({ totalDistance }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setTags: (tags) => set({ tags }),
  setVisibility: (visibility) => set({ visibility }),

  addStop: (stop) =>
    set((state) => ({
      stops: [...state.stops, { ...stop, id: crypto.randomUUID() }],
    })),

  removeStop: (stopId) =>
    set((state) => ({
      stops: state.stops.filter((s) => s.id !== stopId),
    })),

  reorderStops: (stops) => set({ stops }),
  clear: () =>
    set({
      name: '',
      description: '',
      coverPhoto: '',
      estimatedTime: '',
      totalDistance: undefined,
      difficulty: 'Easy',
      tags: [],
      visibility: 'public',
      stops: [],
    }),
}));