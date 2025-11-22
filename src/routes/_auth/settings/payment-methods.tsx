import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PaymentMethods } from '../../../components/PaymentMethods';

export const Route = createFileRoute('/_auth/settings/payment-methods')({
  component: PaymentMethodsRoute,
});

function PaymentMethodsRoute() {
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

  return <PaymentMethods navigateTo={handleNavigate} onLogout={handleLogout} />;
}
