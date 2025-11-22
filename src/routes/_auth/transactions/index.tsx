import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Transactions } from '../../../components/Transactions';

export const Route = createFileRoute('/_auth/transactions/')({
  component: TransactionsRoute,
});

function TransactionsRoute() {
  const navigate = useNavigate();

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'dashboard') {
      navigate({ to: '/dashboard' });
    } else if (page === 'send') {
      navigate({ to: '/send' });
    } else if (page === 'transaction-detail') {
      navigate({ to: `/transactions/${data?.id}`, state: { transaction: data } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate({ to: '/' });
  };

  return <Transactions navigateTo={handleNavigate} onLogout={handleLogout} />;
}
