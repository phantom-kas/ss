import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Settings } from '../../../components/Settings';

export const Route = createFileRoute('/_auth/settings/')({
  component: SettingsRoute,
});

function SettingsRoute() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') {
      navigate({ to: '/dashboard' });
    } else if (page === 'personal-info') {
      navigate({ to: '/settings/personal-info' });
    } else if (page === 'security') {
      navigate({ to: '/settings/security' });
    } else if (page === 'payment-methods') {
      navigate({ to: '/settings/payment-methods' });
    } else if (page === 'notifications') {
      navigate({ to: '/notifications' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return <Settings navigateTo={handleNavigate} onLogout={handleLogout} />;
}
