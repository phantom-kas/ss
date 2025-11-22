import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Notifications } from '../../components/Notifications';

export const Route = createFileRoute('/_auth/notifications')({
  component: NotificationsRoute,
});

function NotificationsRoute() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') {
      navigate({ to: '/dashboard' });
    } else if (page === 'settings') {
      navigate({ to: '/settings' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return <Notifications navigateTo={handleNavigate} onLogout={handleLogout} />;
}
