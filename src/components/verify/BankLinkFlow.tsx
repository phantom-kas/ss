/**
 * components/verify/BankLinkFlow.tsx
 *
 * Drop-in replacement for CybridBankLink.
 *
 * Key behaviour:
 *   - On mount: loads accounts. If ANY is unverified, starts background
 *     polling every 5s — list refreshes automatically as accounts verify.
 *     User can select any already-verified account and Continue immediately.
 *   - Add account: Plaid Link JS (not Cybrid SDK).
 *   - After Plaid onSuccess: exchanges token, refreshes list, starts polling.
 *   - User selects verified account → Continue → onContinue(guid, account).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowRight, Building2, Loader2,
  CheckCircle2, PlusCircle, XCircle, Circle, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

interface BankAccount {
  guid:        string;
  institution: string | null;
  name:        string | null;
  subtype:     string | null;
  mask:        string | null;
  isVerified:  boolean;
  createdAt:   string;
}

interface Props {
  initialSelectedGuid?: string | null;
  onContinue:          (guid: string, account: BankAccount) => void;
  onError?:            (message: string) => void;
  errorMessage?:       string;
  onDismissError?:     () => void;
}

const PLAID_CDN      = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
const POLL_INTERVAL  = 5_000;
const POLL_MAX       = 10 * 60_000;

export function BankLinkFlow({
  initialSelectedGuid,
  onContinue,
  onError,
  errorMessage,
  onDismissError,
}: Props) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selected, setSelected] = useState<string | null>(initialSelectedGuid ?? null);
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);
  const [polling, setPolling]   = useState(false);

  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);
  const hasRunRef    = useRef(false);

  // ── Sync and refresh accounts ─────────────────────────────────

  const syncAndFetch = useCallback(async (): Promise<BankAccount[]> => {
    await api.post('/cybrid/sync-bank-accounts').catch(() => {});
    const { data } = await api.get('/cybrid/bank-accounts');
    const list: BankAccount[] = data.data?.bankAccounts ?? [];
    setAccounts(list);
    return list;
  }, []);

  // ── Background poll ───────────────────────────────────────────
  // Runs while any account is unverified.
  // Does NOT block the user — they can Continue with any verified account.

  function startPoll() {
    if (pollRef.current) return;
    pollStartRef.current = Date.now();
    setPolling(true);

    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > POLL_MAX) {
        stopPoll(); return;
      }
      try {
        const list = await syncAndFetch();
        if (list.length > 0 && list.every((a) => a.isVerified)) stopPoll();
      } catch { /* keep polling */ }
    }, POLL_INTERVAL);
  }

  function stopPoll() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setPolling(false);
  }

  // ── Mount ─────────────────────────────────────────────────────

  useEffect(() => {
    if (initialSelectedGuid && !selected) setSelected(initialSelectedGuid);
  }, [initialSelectedGuid]);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    (async () => {
      setLoading(true);
      try {
        const list = await syncAndFetch();
        const hasUnverified = list.some((a) => !a.isVerified);
        if (hasUnverified) {
          api.post('/cybrid/verify-bank-account', {}).catch(() => {});
          startPoll();
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => stopPoll();
  }, []);

  // ── Plaid Link ────────────────────────────────────────────────

  async function loadPlaid(): Promise<void> {
    if ((window as any).Plaid) return;
    return new Promise((res, rej) => {
      const s   = document.createElement('script');
      s.src     = PLAID_CDN;
      s.onload  = () => res();
      s.onerror = () => rej(new Error('Failed to load Plaid'));
      document.head.appendChild(s);
    });
  }

  async function startBankLink() {
    setStarting(true);
    try {
      const { data } = await api.post('/kyc/plaid/link-token', {});
      const { plaidLinkToken } = data.data;
      await loadPlaid();
      const handler = (window as any).Plaid.create({
        token: plaidLinkToken,
        onSuccess: async (publicToken: string, metadata: any) => {
          const acc         = metadata?.accounts?.[0];
          const accountId   = acc?.id;
          const accountName = acc?.name || metadata?.institution?.name || 'Bank Account';
          try {
            await api.post('/kyc/plaid/exchange', { publicToken, accountId, accountName });
            setStarting(false);
            const list = await syncAndFetch();
            api.post('/cybrid/verify-bank-account', {}).catch(() => {});
            if (list.some((a) => !a.isVerified)) startPoll();
          } catch (err: any) {
            setStarting(false);
            onError?.(err.response?.data?.message || 'Failed to link account. Please try again.');
          }
        },
        onExit: (err: any) => {
          setStarting(false);
          if (err && err.error_code !== 'USER_EXITED') {
            onError?.('Bank connection interrupted. Please try again.');
          }
        },
        onEvent: (e: string) => console.log('Plaid event:', e),
      });
      handler.open();
    } catch {
      setStarting(false);
      onError?.('Failed to start bank linking. Please try again.');
    }
  }

  // ── Derived ───────────────────────────────────────────────────

  const verifiedAccounts   = accounts.filter((a) => a.isVerified);
  const unverifiedAccounts = accounts.filter((a) => !a.isVerified);
  const selectedAccount    = accounts.find((a) => a.guid === selected) ?? null;
  const canContinue        = !!selected && !!selectedAccount?.isVerified;

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* Error banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div key="err"
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
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

      {/* Background verifying banner */}
      <AnimatePresence>
        {polling && unverifiedAccounts.length > 0 && (
          <motion.div key="poll-banner"
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
            <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2.5">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    Verifying {unverifiedAccounts.length === 1 ? 'account' : `${unverifiedAccounts.length} accounts`} in the background
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    You can select a verified account and continue now, or wait for all to finish.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account list */}
      {loading ? (
        <div className="flex items-center gap-2 py-4 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Loading your accounts...</span>
        </div>
      ) : (
        <>
          {/* Verified — selectable */}
          {verifiedAccounts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
                Select account to use
              </p>
              {verifiedAccounts.map((account) => {
                const isSel = selected === account.guid;
                return (
                  <motion.button key={account.guid} type="button"
                    onClick={() => setSelected(account.guid)}
                    initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                    className={cn(
                      'w-full text-left rounded-xl border-2 p-4 transition-all duration-150',
                      isSel
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {isSel
                          ? <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
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
                          {account.subtype && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                              {account.subtype}
                            </span>
                          )}
                          {account.mask && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ••••{account.mask}
                            </span>
                          )}
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

          {/* Unverified — informational, auto-refreshing */}
          {unverifiedAccounts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
                Pending verification
              </p>
              {unverifiedAccounts.map((account) => (
                <Card key={account.guid}
                  className="p-4 dark:bg-slate-800 dark:border-slate-700 border-dashed opacity-75">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {account.institution ?? account.name ?? 'Bank account'}
                      </p>
                      {account.mask && <p className="text-xs text-slate-400">••••{account.mask}</p>}
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Usually under a minute</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Verifying</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {accounts.length === 0 && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No bank accounts linked
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link your US bank account below to get started
              </p>
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
        {starting
          ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          : <PlusCircle className="w-5 h-5 flex-shrink-0" />
        }
        <div className="text-left">
          <p className="text-sm font-semibold">
            {starting ? 'Connecting…' : accounts.length > 0 ? 'Add another account' : 'Link a bank account'}
          </p>
          <p className="text-xs mt-0.5 opacity-70">Secured via Plaid · credentials never stored</p>
        </div>
      </button>

      {/* Continue */}
      <AnimatePresence>
        {verifiedAccounts.length > 0 && (
          <motion.div key="continue" initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}>
            <Button
              className="w-full h-12 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-semibold"
              disabled={!canContinue}
              onClick={() => { if (selected && selectedAccount) onContinue(selected, selectedAccount); }}
            >
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {!selected && (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
                Select an account above to continue
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}