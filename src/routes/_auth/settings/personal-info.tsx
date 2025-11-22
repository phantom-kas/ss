import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PersonalInfo } from '../../../components/PersonalInfo';

export const Route = createFileRoute('/_auth/settings/personal-info')({
  component: PersonalInfoRoute,
});

function PersonalInfoRoute() {
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

  return <PersonalInfo navigateTo={handleNavigate} onLogout={handleLogout} />;
}
