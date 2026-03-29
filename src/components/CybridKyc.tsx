/**
 * components/CybridKyc.tsx
 *
 * Drop-in KYC step. The "Start Verification" card is shown first.
 * When the user clicks it, the Cybrid SDK mounts directly below
 * and the card collapses so the SDK feels inline.
 *
 * Props:
 *   kycStatus   — current status string from /cybrid/status
 *   onVerified  — called when KYC reaches "verified"
 *   onError     — called with a message on unrecoverable failure
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import api from '@/lib/axios';
import { addListener } from 'process';
import { cn } from '@/lib/utils';

interface SdkTokenData {
  token: string;
  customerGuid: string;
  environment: string;
}

interface Props {
  kycStatus: string | undefined;
  onVerified: () => void;
  onError?: (message: string) => void;
}

export function CybridKyc({ kycStatus, onVerified, onError }: Props) {
  const [sdkMounted, setSdkMounted]   = useState(false);
  const [starting, setStarting]       = useState(false);
  const sdkContainerRef               = useRef<HTMLDivElement>(null);
  const pollRef                       = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef                  = useRef<number | null>(null);

  const POLL_INTERVAL = 5_000;
  const POLL_MAX      = 5 * 60_000;

  // If already verified on mount, skip immediately
  useEffect(() => {
    if (kycStatus === 'verified') onVerified();
  }, [kycStatus]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      unmount();
    };
  }, []);

  function unmount() {
    if (sdkContainerRef.current) sdkContainerRef.current.innerHTML = '';
  }

  function loadScripts(): Promise<void> {
    const add = (id: string, src: string, type?: string) => {
      if (document.getElementById(id)) return Promise.resolve();
      return new Promise<void>((res, rej) => {
        const s = document.createElement('script');
        s.id = id; s.src = src;
        if (type) s.type = type;
        s.onload = () => res();
        s.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });
    };
    return add('cybrid-polyfills', '/cybrid-sdk-ui.polyfills.js').then(() =>
      add('cybrid-sdk', '/cybrid-sdk-ui.min.js', 'module')
    );
  }

  async function startKyc() {
    setStarting(true);
    try {
      await api.post('/cybrid/ensure-customer');
      const { data } = await api.get('/cybrid/sdk-token');
      const tokenData: SdkTokenData = data.data;

      await loadScripts();
      unmount();
      if (!sdkContainerRef.current) {
        alert()
        return};

      const el = document.createElement('cybrid-app');
      (el as any).auth      = tokenData.token;
      (el as any).config    = {
        refreshInterval: 10000,
        routing: false,
        locale: 'en-US',
        theme: document.documentElement.classList.contains('dark') ? 'DARK' : 'LIGHT',
        customer: tokenData.customerGuid,
        fiat: 'USD',
        features: ['kyc_identity_verifications'],
        environment: tokenData.environment,
      };
      (el as any).component = 'identity-verification';

      el.addEventListener('eventLog', ((e: CustomEvent) => {
        const code = (e.detail as any)?.code;
        if (code === 'ROUTING_REQUEST' || code === 'ROUTING_DENIED') {
          if (pollRef.current) clearInterval(pollRef.current);
          unmount();
          setSdkMounted(false);
          onVerified();
        }
      }) as EventListener);

      sdkContainerRef.current.appendChild(el);
      setSdkMounted(true);

      // Backup poll in case the SDK event doesn't fire
      pollStartRef.current = Date.now();
      pollRef.current = setInterval(async () => {
        if (pollStartRef.current && Date.now() - pollStartRef.current > POLL_MAX) {
          clearInterval(pollRef.current!);
          return;
        }
        try {
    // alert('s')

          const { data: kycData } = await api.get('/cybrid/kyc/status');
          if (kycData.data.kycStatus === 'verified') {
            clearInterval(pollRef.current!);
            unmount();
            setSdkMounted(false);
            onVerified();
          }
        } catch { /* keep polling */ }
      }, POLL_INTERVAL);
    } catch {
      setStarting(false);
      onError?.('Failed to start identity verification. Please try again.');
    }
  }

  const showStartCard =
    !sdkMounted &&
    (kycStatus === 'unverified' ||
    kycStatus === 'pending' ||
      kycStatus === 'not_started' ||
      kycStatus === 'failed' ||
      !kycStatus);

  return (
    <div className="space-y-4">
      {/* Status banners */}
      <AnimatePresence>
        {kycStatus === 'pending' && !sdkMounted && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Verification in progress
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Your identity is being reviewed. This usually takes a few minutes.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {kycStatus === 'failed' && !sdkMounted && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                    Verification failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Please try again. Make sure your ID is clear and your selfie matches.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start card — shown BEFORE SDK mounts */}
      <AnimatePresence>
        {showStartCard && (
          <motion.div
            key="start-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-5 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Identity Verification Required
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Government-issued ID + selfie. Takes about 2 minutes.
                  </p>
                </div>
                <Button
                  onClick={startKyc}
                  disabled={starting}
                  className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 px-4 flex-shrink-0"
                >
                  {starting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Start <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SDK container — appears right after the card collapses */}
      <AnimatePresence>
        { (
          <motion.div
            key="sdk"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              ref={sdkContainerRef}
              className={cn("rounded-xl overflow-hidden ",sdkMounted ?'min-h-[420px]  border border-slate-200 dark:border-slate-700':'')}
            />
          </motion.div>
        )}

        {/* Hidden ref container when SDK is not visible
        {!sdkMounted && (
          <div ref={sdkContainerRef} className="hidden" />
        )} */}
      </AnimatePresence>
    </div>
  );
}