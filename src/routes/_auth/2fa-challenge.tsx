import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/2fa-challenge')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TwoFactorChallenge/>
}


// routes/auth/2fa-challenge.tsx
// Navigate here after login when backend returns { requires2fa: true, tempToken }
// Store tempToken in your auth store before navigating.

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, ShieldAlert, Loader2, LogIn } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { OtpInput } from '@/components/OtpInput';
import { setup2faApi } from '@/api/twoFactor.api';

export function TwoFactorChallenge() {
  const navigate = useNavigate();

  // Replace with your auth store values
  // const { tempToken, setAccessToken } = useAuthStore()
  const tempToken = '';
  const setAccessToken = (_token: string) => {};

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-submit on 6 digits
  useEffect(() => {
    if (code.length === 6) handleSubmit();
  }, [code]);

  const handleSubmit = async () => {
    if (loading || code.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const data = await setup2faApi.verifyLogin(code, tempToken);
      setAccessToken(data.accessToken);
      navigate({ to: '/dashboard' });
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.error ?? 'Invalid code')
        : 'Invalid code';
      setError(msg);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Two-Factor Auth</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-center text-muted-foreground">
              Verification Code
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <OtpInput
              value={code}
              onChange={setCode}
              disabled={loading}
              hasError={!!error}
            />

            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={code.length < 6 || loading}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
                : <><LogIn className="w-4 h-4 mr-2" />Continue</>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => navigate({ to: '/login' })}
            >
              ← Back to login
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Lost access to your app?{' '}
          <a href="/support" className="text-primary hover:underline underline-offset-4">
            Contact support
          </a>
        </p>

      </div>
    </div>
  );
}

// ─── TanStack Router wiring ───────────────────────────────────────────────────
// const twoFaChallengeRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: '/2fa/challenge',
//   component: TwoFactorChallenge,
// })