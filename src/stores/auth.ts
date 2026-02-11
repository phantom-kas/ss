import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: number;
  name: string;
  email: string;
    done_onboarding?: boolean;
  selected_currency?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
 updateUser: (data: Partial<User>) => void; 
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : state.user,
        })),
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      isLoggedIn: () => {
        return get().isAuthenticated && !!get().token;
      },
    }),
    {
      name: "auth-store", // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
