import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SignUp } from '../components/SignUp';

export const Route = createFileRoute('/signup')({
  component: SignUpRoute,
});

function SignUpRoute() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    // Set authentication state and navigate to onboarding
    localStorage.setItem('isAuthenticated', 'true');
    navigate({ to: '/signin' });
  };

  return <SignUp onSignUp={handleSignUp} />;
}
