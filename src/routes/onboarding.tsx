import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Onboarding } from '../components/Onboarding';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoute,
});

function OnboardingRoute() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate({ to: '/dashboard' });
  };

  return <Onboarding onComplete={handleComplete} />;
}
