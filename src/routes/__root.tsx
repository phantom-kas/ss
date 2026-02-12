import { AuthGate } from '@/components/a';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return<AuthGate><Outlet /></AuthGate> ;
}
