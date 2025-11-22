import { createFileRoute, useNavigate, useLocation } from '@tanstack/react-router';
import { SendMoney } from '../../components/SendMoney';

export const Route = createFileRoute('/_auth/send')({
  component: SendRoute,
});

function SendRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledRecipient = (location.state as any)?.prefilledRecipient || null;

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') {
      navigate({ to: '/dashboard' });
    } else if (page === 'transactions') {
      navigate({ to: '/transactions' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return (
    <SendMoney
      navigateTo={handleNavigate}
      onLogout={handleLogout}
      prefilledRecipient={prefilledRecipient}
    />
  );
}
