import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/setup-2fa')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Setup2FA/>
}



// routes/settings/setup-2fa.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Shield, ShieldCheck, ShieldAlert, Copy, Check,
  ChevronLeft, Loader2, KeyRound, Smartphone,
} from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// import { useToast } from '@/hooks/use-toast';

import { OtpInput } from '@/components/OtpInput';
import { setup2faApi } from '@/api/twoFactor.api';
import { toast } from 'sonner';

type Step = 'loading' | 'scan' | 'verify' | 'success' | 'error';

export function Setup2FA() {
  const navigate = useNavigate();
  // const { toast } = useToast();

  const [step, setStep] = useState<Step>('loading');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const init = async () => {
    setStep('loading');
    try {
      const data = await setup2faApi.initSetup();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('scan');
    } catch {
      setStep('error');
    }
  };

  useEffect(() => { init(); }, []);

  // Auto-submit on 6 digits
  useEffect(() => {
    if (code.length === 6 && step === 'verify') handleVerify();
  }, [code]);

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Secret key copied to clipboard' );
  };

  const handleVerify = async () => {
    if (verifying || code.length < 6) return;
    setVerifying(true);
    setError('');
    try {
      await setup2faApi.verifySetup(code);
      setStep('success');
    } catch (e) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.error ?? 'Invalid code')
        : 'Invalid code';
      setError(msg);
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  const stepIndex = step === 'verify' ? 1 : 0;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/settings/security' })}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Two-Factor Authentication</h1>
          <p className="text-xs text-muted-foreground">Add TOTP to secure your account</p>
        </div>
      </div>

      {/* Step indicators */}
      {(step === 'scan' || step === 'verify') && (
        <div className="flex items-center gap-2">
          {['Scan QR', 'Verify'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <Badge
                className={
                  i < stepIndex
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-0'
                    : i === stepIndex
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-0'
                    : 'bg-muted text-muted-foreground border-0'
                }
              >
                {i < stepIndex && <Check className="w-3 h-3 mr-1" />}
                {i + 1}. {label}
              </Badge>
              {i === 0 && <Separator className="w-6" />}
            </div>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {step === 'loading' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Generating your 2FA setup…</p>
          </CardContent>
        </Card>
      )}

      {/* ── Scan QR ── */}
      {step === 'scan' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-500" />
              Scan with your authenticator app
            </CardTitle>
            <CardDescription>
              Use Google Authenticator, Authy, or any TOTP-compatible app.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-2xl border shadow-sm">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-lg" />
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Can't scan? Enter this key manually:
              </p>
              <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
                <code className="flex-1 text-xs font-mono break-all tracking-widest">
                  {secret.match(/.{1,4}/g)?.join(' ') ?? secret}
                </code>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-lg" onClick={copySecret}>
                  {copied
                    ? <Check className="w-4 h-4 text-emerald-500" />
                    : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button variant={'blue'} className="w-full" onClick={() => setStep('verify')}>
              I've scanned it — Continue
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ── Verify ── */}
      {step === 'verify' && (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-1">
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-base">Enter the 6-digit code</CardTitle>
            <CardDescription>From your authenticator app to confirm setup</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <OtpInput value={code} onChange={setCode} disabled={verifying} hasError={!!error} />

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
              onClick={handleVerify}
              disabled={code.length < 6 || verifying}
            >
              {verifying
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
                : 'Confirm & Enable 2FA'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => { setStep('scan'); setCode(''); setError(''); }}
            >
              ← Back to QR code
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ── Success ── */}
      {step === 'success' && (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-1">
              <ShieldCheck className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>2FA Enabled!</CardTitle>
            <CardDescription>
              Your account is now protected. You'll be asked for a code on every login.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                💡 Save your secret key somewhere safe. If you lose access to your authenticator app, you'll need it to recover your account.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter>
            <Button className="w-full" onClick={() => navigate({ to: '/settings/security' })}>
              Back to Security Settings
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ── Error ── */}
      {step === 'error' && (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mb-1">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <CardTitle className="text-base">Setup Failed</CardTitle>
            <CardDescription>Couldn't initialize 2FA. Please try again.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={init}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      )}

    </div>
  );
}

// ─── TanStack Router wiring ───────────────────────────────────────────────────
// const setup2faRoute = createRoute({
//   getParentRoute: () => settingsRoute,
//   path: '/2fa/setup',
//   component: Setup2FA,
// })