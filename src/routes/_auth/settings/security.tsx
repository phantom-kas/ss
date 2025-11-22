import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Security } from '../../../components/Security';

export const Route = createFileRoute('/_auth/settings/security')({
  component: SecurityRoute,
});

function SecurityRoute() {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    if (page === 'settings') {
      navigate({ to: '/settings' });
    } else if (page === 'dashboard') {
      navigate({ to: '/dashboard' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return <Security navigateTo={handleNavigate} onLogout={handleLogout} />;
}
