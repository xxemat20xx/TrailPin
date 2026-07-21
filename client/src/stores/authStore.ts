import { create } from 'zustand';
import { getMe, logoutUser } from '../api/auth';

interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    checkAuth: async () => {
        try {
            const res = await getMe();
            set({ user: res.data, isLoading: false });
        } catch {
            set({ user: null, isLoading: false });
        }
    },
    logout: async () => {
        await logoutUser();
        set({ user: null });
    },
    setUser: (user) => set({ user, isLoading: false }),
}));