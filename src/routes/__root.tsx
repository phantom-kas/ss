import { AuthGate } from '@/components/a';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {

const queryClient = new QueryClient()
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      // setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    checkDarkMode();
    
    // Listen for storage changes (from Settings or other tabs)
    const handleStorageChange = () => checkDarkMode();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // Remove dark mode when leaving authenticated pages (going back to landing/auth pages)
      document.documentElement.classList.remove('dark');
    };
  }, []);
  return  <QueryClientProvider client={queryClient}><AuthGate><Outlet /></AuthGate></QueryClientProvider> ;
}
