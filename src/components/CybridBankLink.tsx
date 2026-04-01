/**
 * components/CybridBankLink.tsx
 *
 * Bank account picker using data from cybrid_bank_accounts table.
 * - Loads accounts from GET /cybrid/bank-accounts (local DB, fast)
 * - After new Plaid link: verifies then calls POST /cybrid/sync-bank-accounts
 * - User explicitly picks one account, Continue passes guid to parent
 * - Accounts ordered: verified first, then newest
 */

import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, Building2, Loader2, AlertCircle,
  CheckCircle2, PlusCircle, XCircle, Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

// Matches formatDbAccount() in the controller
interface BankAccount {
  guid:        string;
  institution: string | null;
  name:        string | null;
  subtype:     string | null;  // 'checking' | 'savings' | null
  mask:        string | null;
  isVerified:  boolean;
  createdAt:   string;
   
}

interface Props {
   onContinue:      (guid: string, account: BankAccount) => void;
  onError?:        (message: string) => void;
  errorMessage?:   string;
  initialSelectedGuid?: string | null;
  onDismissError?: () => void;
}

export function CybridBankLink({ initialSelectedGuid,onContinue, onError, errorMessage, onDismissError }: Props) {
  const [accounts, setAccounts]       = useState<BankAccount[]>([]);
 const [selected, setSelected]       = useState<string | null>(initialSelectedGuid ?? null);
  const [loadingAccounts, setLoading] = useState(true);
  const [sdkMounted, setSdkMounted]   = useState(false);
  const [starting, setStarting]       = useState(false);
  const [verifying, setVerifying]     = useState(false);

  const sdkContainerRef = useRef<HTMLDivElement>(null);
  const pollRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef    = useRef<number | null>(null);

  const POLL_INTERVAL = 5_000;
  const POLL_MAX      = 5 * 60_000;

  // useEffect(() => {
  //   fetchAccounts();
  //   return () => {
  //     if (pollRef.current) clearInterval(pollRef.current);
  //     unmount();
  //   };
  // }, []);
const hasRunRef = useRef(false);
const verifyingRef = useRef(false);



useEffect(() => {
    if (initialSelectedGuid && !selected) {
      setSelected(initialSelectedGuid);
    }
  }, [initialSelectedGuid]);


  useEffect(() => {
  if (hasRunRef.current) return;
  hasRunRef.current = true;

  (async () => {
    const list = await fetchAccounts();

    const hasUnverified = list.some((a) => !a.isVerified);

    if (hasUnverified) {
      await runVerificationAndSync();
      return;
    }

    try {
      const { data } = await api.get('/cybrid/status');

      if (data.data.hasBankAccount && !data.data.hasVerifiedBankAccount) {
        await runVerificationAndSync();
      }
    } catch {}
  })();

  return () => {
    if (pollRef.current) clearInterval(pollRef.current);
    unmount();
  };
}, []);


  async function fetchAccounts() {
    setLoading(true);
    try {
      const { data } = await api.get('/cybrid/bank-accounts');
      const list: BankAccount[] = data.data?.bankAccounts ?? [];
      setAccounts(list);
      // No auto-select — user must pick explicitly
      setSelected(null);
      return list
    } catch {
      return []
      // non-fatal — user can still add a new account
    } finally {
      setLoading(false);
    }
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
      const tokenData = data.data;

      await loadScripts();
      unmount();
      if (!sdkContainerRef.current) return;

      const el = document.createElement('cybrid-app');
      (el as any).auth      = tokenData.token;
      (el as any).config    = {
        refreshInterval: 10000,
        routing:         false,
        locale:          'en-US',
        theme:           document.documentElement.classList.contains('dark') ? 'DARK' : 'LIGHT',
        customer:        tokenData.customerGuid,
        fiat:            'USD',
        features:        ['kyc_identity_verifications'],
        environment:     tokenData.environment,
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

      // Poll until Cybrid detects the new account
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
            // if(hasUnverified)
            await runVerificationAndSync();
          }
        } catch { /* keep polling */ }
      }, POLL_INTERVAL);
    } catch {
      setStarting(false);
      onError?.('Failed to start bank linking. Please try again.');
    }
  }

  async function runVerificationAndSync() {
    if (verifyingRef.current) return; // ✅ prevent duplicate runs
  verifyingRef.current = true;
    setVerifying(true);
    try {
      // 1. Kick off Cybrid's bank account identity verification
      await api.post('/cybrid/verify-bank-account', {}).catch(() => { /* non-fatal */ });

      // 2. Poll until at least one verified account exists
      const verifyStart = Date.now();
      const verifyMax   = 90_000;
      let l = 0
      await new Promise<void>((resolve) => {
        const poll = setInterval(async () => {
          try {
            l++
            console.log('polling ',l)
            const { data: latest } = await api.get('/cybrid/status');
            if (latest.data.hasVerifiedBankAccount || Date.now() - verifyStart > verifyMax) {
              clearInterval(poll);
              resolve();
            }
          } catch { /* keep polling */ }
        }, 3000);
      });

      // 3. Sync Cybrid accounts into local cybrid_bank_accounts table
      await api.post('/cybrid/sync-bank-accounts');

      // 4. Refresh list from DB
      await fetchAccounts();
    } finally {
      
  verifyingRef.current = false;
      setVerifying(false);
    }
  }

 
  const verifiedAccounts   = accounts.filter((a) => a.isVerified);
  const unverifiedAccounts = accounts.filter((a) => !a.isVerified);
  const selectedAccount    = accounts.find((a) => a.guid === selected) ?? null;
  const canContinue        = !!selected && !!selectedAccount?.isVerified && !verifying && !sdkMounted;
 
  if (verifying) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-14">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Verifying your bank account</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">This usually takes just a moment...</p>
      </motion.div>
    );
  }
 
  return (
    <div className="space-y-3">
      {/* External error banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div key="ext-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-sm text-amber-900 dark:text-amber-200">{errorMessage}</p>
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
 
      {/* SDK container */}
      <AnimatePresence>
        {sdkMounted && (
          <motion.div key="sdk" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            <div ref={sdkContainerRef} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 min-h-[420px]" />
          </motion.div>
        )}
        {!sdkMounted && <div ref={sdkContainerRef} className="hidden" />}
      </AnimatePresence>
 
      {!sdkMounted && (
        <>
          {loadingAccounts ? (
            <div className="flex items-center gap-2 py-3 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Loading your accounts...</span>
            </div>
          ) : (
            <>
              {/* Verified accounts */}
              {verifiedAccounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
                    Select account to use
                  </p>
                  {verifiedAccounts.map((account) => {
                    const isSelected = selected === account.guid;
                    return (
                      <motion.button key={account.guid} type="button"
                        onClick={() => setSelected(account.guid)}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'w-full text-left rounded-xl border-2 p-4 transition-all duration-150',
                          isSelected
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isSelected
                              ? <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>
                              : <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                            }
                          </div>
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {account.institution ?? account.name ?? 'Bank account'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {account.subtype && <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{account.subtype}</span>}
                              {account.mask && <span className="text-xs text-slate-500 dark:text-slate-400">••••{account.mask}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Verified</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
 
              {/* Unverified — informational */}
              {unverifiedAccounts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">Pending verification</p>
                  {unverifiedAccounts.map((account) => (
                    <Card key={account.guid} className="p-4 opacity-60 dark:bg-slate-800 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {account.institution ?? account.name ?? 'Bank account'}
                          </p>
                          {account.mask && <p className="text-xs text-slate-400">••••{account.mask}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">Verifying</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
 
          {/* Add account */}
          <button type="button" onClick={startBankLink} disabled={starting}
            className={cn(
              'w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all duration-150',
              'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400',
              'hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400',
              starting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {starting ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" /> : <PlusCircle className="w-5 h-5 flex-shrink-0" />}
            <div className="text-left">
              <p className="text-sm font-semibold">{accounts.length > 0 ? 'Add another account' : 'Link a bank account'}</p>
              <p className="text-xs mt-0.5 opacity-70">Secured via Plaid · credentials never stored</p>
            </div>
          </button>
 
          {/* Continue */}
          {verifiedAccounts.length > 0 && (
            <Button
              className="w-full h-12 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-semibold"
              disabled={!canContinue}
              onClick={() => {
                if (selected && selectedAccount) {
                  onContinue(selected, selectedAccount);
                }
              }}
            >
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}