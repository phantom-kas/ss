import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Support } from '../../components/Support';

export const Route = createFileRoute('/_auth/support')({
  component: SupportRoute,
});

function SupportRoute() {
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

  return <Support navigateTo={handleNavigate} onLogout={handleLogout} />;
}
