import { create } from 'zustand';
import { getAllUsers, getMe, logoutUser } from '../api/auth';

interface User {
    id: string;
    email: string;
    name?: string;
    username?: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    users: User[];
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    users: [],
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
    fetchUsers: async () => {
        try {
            const res = await getAllUsers();
            set({ users: res.data, isLoading: false });
        } catch {
            set({ users: [], isLoading: false });
        }
    },
    setUser: (user) => set({ user, isLoading: false }),
}));