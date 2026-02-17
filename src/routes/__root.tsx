import { AuthGate } from '@/components/a';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {

const queryClient = new QueryClient()

  return  <QueryClientProvider client={queryClient}><AuthGate><Outlet /></AuthGate></QueryClientProvider> ;
}
