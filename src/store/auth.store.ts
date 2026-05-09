import { create } from 'zustand';
import type { AuthTokens, AuthProvider } from '../types/auth.types';
import type { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  provider: AuthProvider | null;

  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setProvider: (provider: AuthProvider) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  provider: null,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setTokens: (tokens) => set({ tokens }),

  setProvider: (provider) => set({ provider }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      provider: null,
    }),
}));
