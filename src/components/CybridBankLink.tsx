/**
 * components/CybridBankLink.tsx
 *
 * Drop-in bank linking step. Supports multiple accounts — shows all
 * linked accounts and lets the user add another at any time.
 *
 * Props:
 *   onVerified          — called once at least one bank account is verified
 *   onError             — called with message on failure
 *   errorMessage        — optional external error (e.g. from a failed send)
 *   unverifiedAccount   — optional account details to show alongside error
 *   onDismissError      — called when user dismisses the error banner
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Building2, Loader2, AlertCircle, CheckCircle2, PlusCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import api from '@/lib/axios';

interface SdkTokenData {
  token: string;
  customerGuid: string;
  environment: string;
}

interface BankAccount {
  guid: string;
  name: string;
  mask: string | null;
  institution: string | null;
  state: string;
  isTransferable: boolean;
}

interface Props {
  onVerified: () => void;
  onError?: (message: string) => void;
  errorMessage?: string;
  unverifiedAccount?: { name?: string; mask?: string | null } | null;
  onDismissError?: () => void;
}

export function CybridBankLink({
  onVerified,
  onError,
  errorMessage,
  unverifiedAccount,
  onDismissError,
}: Props) {
  const [accounts, setAccounts]       = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoading] = useState(true);
  const [sdkMounted, setSdkMounted]   = useState(false);
  const [starting, setStarting]       = useState(false);
  const [verifying, setVerifying]     = useState(false);

  const sdkContainerRef = useRef<HTMLDivElement>(null);
  const pollRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef    = useRef<number | null>(null);

  const POLL_INTERVAL = 5_000;
  const POLL_MAX      = 5 * 60_000;

  // Load existing accounts on mount
  useEffect(() => {
    fetchAccounts();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      unmount();
    };
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const { data } = await api.get('/cybrid/bank-accounts');
      setAccounts(data.data.bankAccounts ?? []);
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  }

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

  async function startBankLink() {
    setStarting(true);
    try {
      const { data } = await api.get('/cybrid/sdk-token');
      const tokenData: SdkTokenData = data.data;

      await loadScripts();
      unmount();
      if (!sdkContainerRef.current) return;

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
      (el as any).component = 'bank-account-connect';

      el.addEventListener('eventLog', ((e: CustomEvent) => {
        const code = (e.detail as any)?.code;
        if (code === 'ROUTING_REQUEST' || code === 'ROUTING_DENIED') {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }) as EventListener);

      sdkContainerRef.current.appendChild(el);
      setSdkMounted(true);
      setStarting(false);

      // Poll for the new account to appear
      pollStartRef.current = Date.now();
      pollRef.current = setInterval(async () => {
        if (pollStartRef.current && Date.now() - pollStartRef.current > POLL_MAX) {
          clearInterval(pollRef.current!);
          return;
        }
        try {
          const { data: statusData } = await api.get('/cybrid/status');
          if (statusData.data.hasBankAccount) {
            clearInterval(pollRef.current!);
            unmount();
            setSdkMounted(false);
            await runVerification();
          }
        } catch { /* keep polling */ }
      }, POLL_INTERVAL);
    } catch {
      setStarting(false);
      onError?.('Failed to start bank linking. Please try again.');
    }
  }

  async function runVerification() {
    setVerifying(true);
    try {
      await api.post('/cybrid/verify-bank-account', {});
    } catch { /* non-fatal */ }

    const verifyStart = Date.now();
    const verifyMax   = 90_000;
    const verifyPoll  = setInterval(async () => {
      try {
        const { data: latest } = await api.get('/cybrid/status');
        const s = latest.data;
        // Refresh the accounts list so the UI updates
        await fetchAccounts();
        if (s.hasVerifiedBankAccount || Date.now() - verifyStart > verifyMax) {
          clearInterval(verifyPoll);
          setVerifying(false);
          onVerified();
        }
      } catch { /* keep polling */ }
    }, 3000);
  }

  // ── Render ──────────────────────────────────────────────────

  if (verifying) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-14"
      >
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          Verifying your bank account
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
          This usually takes just a moment...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* External error banner (from failed send) */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            key="ext-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-900 dark:text-amber-200">{errorMessage}</p>
                  {unverifiedAccount && (unverifiedAccount.name || unverifiedAccount.mask) && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 font-medium">
                      Account:{' '}
                      {[
                        unverifiedAccount.name,
                        unverifiedAccount.mask ? `••••${unverifiedAccount.mask}` : null,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  )}
                </div>
                {onDismissError && (
                  <button onClick={onDismissError} className="text-amber-600 hover:text-amber-800 flex-shrink-0">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Add account" card — shown before SDK mounts */}
      <AnimatePresence>
        {!sdkMounted && (
          <motion.div
            key="add-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {accounts.length > 0 ? 'Add another bank account' : 'Connect your bank'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Secured via Plaid · credentials never stored
                  </p>
                </div>
                <Button
                  onClick={startBankLink}
                  disabled={starting}
                  className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 px-4 flex-shrink-0"
                >
                  {starting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>{accounts.length > 0
                      ? <><PlusCircle className="w-3.5 h-3.5 mr-1.5" />Add</>
                      : <>Link <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                    }</>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SDK container */}
      <AnimatePresence>
        {sdkMounted && (
          <motion.div
            key="sdk"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              ref={sdkContainerRef}
              className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 min-h-[420px]"
            />
          </motion.div>
        )}
        {!sdkMounted && <div ref={sdkContainerRef} className="hidden" />}
      </AnimatePresence>

      {/* Existing linked accounts list */}
      {!sdkMounted && (
        <div className="space-y-2">
          {loadingAccounts && (
            <div className="flex items-center gap-2 py-2 px-1 text-slate-400 dark:text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading accounts...</span>
            </div>
          )}

          <AnimatePresence>
            {accounts.map((account) => (
              <motion.div
                key={account.guid}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-3.5 dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {account.institution ?? account.name}
                      </p>
                      {account.mask && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          ••••{account.mask}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {account.isTransferable ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            Verifying
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}