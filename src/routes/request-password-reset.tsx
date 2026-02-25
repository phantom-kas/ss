import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SignIn } from '../components/SignIn';
import { RequestPasswordReset } from '@/components/forms/request_password_reset';

export const Route = createFileRoute('/request-password-reset')({
  component: SignInRoute,
});

function SignInRoute() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Set authentication state and navigate to onboarding
    // localStorage.setItem('isAuthenticated', 'true');
    navigate({ to: '/onboarding' });
  };

  return <RequestPasswordReset />;
}
