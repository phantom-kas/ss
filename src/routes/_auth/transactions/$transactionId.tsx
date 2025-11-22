import { createFileRoute, useNavigate, useLocation } from '@tanstack/react-router';
import { TransactionDetail } from '../../../components/TransactionDetail';

export const Route = createFileRoute('/_auth/transactions/$transactionId')({
  component: TransactionDetailRoute,
});

function TransactionDetailRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const transaction = (location.state as any)?.transaction || null;

  const handleNavigate = (page: string) => {
    if (page === 'transactions') {
      navigate({ to: '/transactions' });
    } else if (page === 'dashboard') {
      navigate({ to: '/dashboard' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return (
    <TransactionDetail
      navigateTo={handleNavigate}
      onLogout={handleLogout}
      transaction={transaction}
    />
  );
}
