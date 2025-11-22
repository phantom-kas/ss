import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Dashboard } from '../../components/Dashboard';

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const navigate = useNavigate();

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'send') {
      navigate({ to: '/send', state: { prefilledRecipient: data } });
    } else if (page === 'transactions') {
      navigate({ to: '/transactions' });
    } else if (page === 'settings') {
      navigate({ to: '/settings' });
    } else if (page === 'support') {
      navigate({ to: '/support' });
    } else if (page === 'notifications') {
      navigate({ to: '/notifications' });
    } else if (page === 'transaction-detail') {
      navigate({ to: `/transactions/${data?.id}`, state: { transaction: data } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return <Dashboard navigateTo={handleNavigate} onLogout={handleLogout} />;
}
