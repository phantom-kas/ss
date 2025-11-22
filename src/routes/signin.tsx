import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SignIn } from '../components/SignIn';

export const Route = createFileRoute('/signin')({
  component: SignInRoute,
});

function SignInRoute() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Set authentication state and navigate to onboarding
    localStorage.setItem('isAuthenticated', 'true');
    navigate({ to: '/onboarding' });
  };

  return <SignIn onSignIn={handleSignIn} />;
}
