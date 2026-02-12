import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  hasHydrated: boolean; // 👈 add this

  updateUser: (data: Partial<User>) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  setHasHydrated: (state: boolean) => void; // 👈 add this
};
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

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

      isLoggedIn: () => get().isAuthenticated && !!get().token,
    }),
    {
      name: "auth-store",

      // ✅ THIS is what you were missing
      storage: createJSONStorage(() => localStorage),

      // ✅ hydration flag (your part was correct)
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
