import { User } from "@/types/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { usePusherStore } from "./pusher";

type AuthState = {
  user: User | null;
  token: string | null;
  partialToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  updateUser: (data: Partial<User>) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  setHasHydrated: (state: boolean) => void;
  setPartialToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      partialToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      setPartialToken: (token) => set({ partialToken: token }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : state.user,
        })),

      login: (user, token) =>
        set({
          user,
          token,
          partialToken: null, // clear partial token on full login
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          partialToken: null,
          isAuthenticated: false,
        }),

      isLoggedIn: () => get().isAuthenticated && !!get().token,
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Separate actions object so you can call them outside components
// without useAuthStore.getState() every time
export const authActions = {
  login: (user: User, token: string) =>
    useAuthStore.setState((state) => ({
      ...state,
      user,
      token,
      partialToken: null,
      isAuthenticated: true,
    })),

  logout: () =>
    {
      usePusherStore.getState().disconnect()
    useAuthStore.setState((state) => ({
      ...state,
      user: null,
      token: null,
      partialToken: null,
      isAuthenticated: false,
    }))
  },

  updateUser: (data: Partial<User>) =>
    useAuthStore.setState((state) => ({
      ...state,
      user: state.user ? { ...state.user, ...data } : state.user,
    })),

  setPartialToken: (token: string | null) =>
    useAuthStore.setState((state) => ({ ...state, partialToken: token })),

  setHasHydrated: (value: boolean) =>
    useAuthStore.setState((state) => ({ ...state, hasHydrated: value })),

  isLoggedIn: () => {
    const { isAuthenticated, token } = useAuthStore.getState();
    return isAuthenticated && !!token;
  },
};