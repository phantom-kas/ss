import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router';
import { AppLayout } from '../components/AppLayout';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    // const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    // if (!isAuthenticated) {
    //   throw redirect({
    //     to: '/signin',
    //   });
    // }
  },
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  // Map paths to page names for AppLayout
  const getPageFromPath = (path: string) => {
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/send')) return 'send';
    if (path.includes('/transactions')) return 'transactions';
    if (path.includes('/settings/personal-info')) return 'personal-info';
    if (path.includes('/settings/security')) return 'security';
    if (path.includes('/settings/payment-methods')) return 'payment-methods';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/notifications')) return 'notifications';
    if (path.includes('/support')) return 'support';
    return 'dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return (
    <AppLayout
      navigateTo={(page) => {
        const pathMap: Record<string, string> = {
          'dashboard': '/dashboard',
          'send': '/send',
          'transactions': '/transactions',
          'transaction-detail': '/transactions',
          'settings': '/settings',
          'personal-info': '/settings/personal-info',
          'security': '/settings/security',
          'payment-methods': '/settings/payment-methods',
          'notifications': '/notifications',
          'support': '/support',
        };
        navigate({ to: pathMap[page] || '/dashboard' });
      }}
      currentPage={getPageFromPath(currentPath) as any}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppLayout>
  );
}