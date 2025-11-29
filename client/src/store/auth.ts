'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        if (token) {
          Cookies.set('token', token, { expires: 7 });
        } else {
          Cookies.remove('token');
        }
        set({ token });
      },

      login: async (email, password) => {
        const response = await authApi.login({ email, password });
        const { token, user } = response;
        
        get().setToken(token);
        set({ user, isAuthenticated: true, isLoading: false });
      },

      register: async (email, password, name) => {
        const response = await authApi.register({ email, password, name });
        const { token, user } = response;
        
        get().setToken(token);
        set({ user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        get().setToken(null);
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = Cookies.get('token');
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          const response = await authApi.getMe();
          set({ 
            user: response.user, 
            token,
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch {
          get().setToken(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
