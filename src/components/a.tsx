import { useAuthStore } from "@/stores/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return null; // or splash screen
  }

  return <>{children}</>;
}