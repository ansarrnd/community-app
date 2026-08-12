import { create } from 'zustand';
import { User, UserRole } from '../../domain/models/User';

interface AuthState {
  user: User;
  setRole: (newRole: UserRole) => void;
  setUser: (user: User) => void;
}

const DEFAULT_DEMO_USER: User = {
  uid: 'demo-user-admin',
  phoneNumber: '+15550192836',
  displayName: 'Arun Administrator',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_DEMO_USER,
  setRole: (newRole: UserRole) =>
    set((state) => ({
      user: { ...state.user, role: newRole },
    })),
  setUser: (user: User) => set({ user }),
}));
