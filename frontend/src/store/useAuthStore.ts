import { create } from "zustand";
import { type User } from "../types/auth";
import { APP_STORAGE_KEYS } from "../constants";

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem(APP_STORAGE_KEYS.AUTH_TOKEN),
  user: null,
  isAuthenticated: !!localStorage.getItem(APP_STORAGE_KEYS.AUTH_TOKEN),
  isLoading: false,
  login: (token, user) => {
    localStorage.setItem(APP_STORAGE_KEYS.AUTH_TOKEN, token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem(APP_STORAGE_KEYS.AUTH_TOKEN);
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (isLoading) => set({ isLoading }),
}));
