/**
 * components/verify/BankLinkFlow.tsx
 *
 * Drop-in replacement for CybridBankLink.
 * Same props interface — swap <CybridBankLink> → <BankLinkFlow>.
 *
 * Uses:
 *   GET  /cybrid/bank-accounts         → load existing accounts from DB
 *   POST /kyc/plaid/link-token         → get plaid_link_token via Cybrid workflow
 *   POST /kyc/plaid/exchange           → exchange public_token → external bank account
 *   POST /cybrid/verify-bank-account   → kick off bank IDV
 *   POST /cybrid/sync-bank-accounts    → sync Cybrid → local DB
 *   GET  /cybrid/status                → poll hasVerifiedBankAccount
 *
 * Mirrors CybridBankLink behaviour exactly:
 *   - On mount: loads accounts + auto-triggers verify if unverified accounts exist
 *   - Add account: opens Plaid Link JS (not Cybrid SDK)
 *   - After Plaid onSuccess: exchanges token, runs verification + sync
 *   - User selects verified account → Continue → onContinue(guid, account)
 */

import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, Building2, Loader2,
  CheckCircle2, PlusCircle, XCircle, Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { StatusBanner } from './shared';
import api from '@/lib/axios';

// ── Types ─────────────────────────────────────────────────────

interface BankAccount {
  guid:        string;
  institution: string | null;
  name:        string | null;
  subtype:     string | null;
  mask:        string | null;
  isVerified:  boolean;
  createdAt:   string;
}

// ── Props — identical to CybridBankLink ───────────────────────

interface Props {
  initialSelectedGuid?: string | null;
  onContinue:          (guid: string, account: BankAccount) => void;
  onError?:            (message: string) => void;
  errorMessage?:       string;
  onDismissError?:     () => void;
}

const PLAID_CDN = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
const POLL_MAX  = 5 * 60_000;

export function BankLinkFlow({
  initialSelectedGuid,
  onContinue,
  onError,
  errorMessage,
  onDismissError,
}: Props) {
  const [accounts, setAccounts]       = useState<BankAccount[]>([]);
  const [selected, setSelected]       = useState<string | null>(initialSelectedGuid ?? null);
  const [loadingAccounts, setLoading] = useState(true);
  const [starting, setStarting]       = useState(false);
  const [verifying, setVerifying]     = useState(false);

  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRunRef    = useRef(false);
  const verifyingRef = useRef(false);

  // ── Mount — mirrors CybridBankLink exactly ────────────────────

  useEffect(() => {
    if (initialSelectedGuid && !selected) setSelected(initialSelectedGuid);
  }, [initialSelectedGuid]);

  // Load accounts on mount — no auto-verification, user must select explicitly
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    fetchAccounts();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Fetch accounts from local DB ──────────────────────────────

  async function fetchAccounts(): Promise<BankAccount[]> {
    setLoading(true);
    try {
      const { data } = await api.get('/cybrid/bank-accounts');
      const list: BankAccount[] = data.data?.bankAccounts ?? [];
      setAccounts(list);
      setSelected(null); // user must pick explicitly
      return list;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }

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
      // 1. Get plaid_link_token via your backend → Cybrid workflow
      const { data } = await api.post('/kyc/plaid/link-token', {});
      const { plaidLinkToken } = data.data;

      await loadPlaid();
      const Plaid = (window as any).Plaid;

      const handler = Plaid.create({
        token: plaidLinkToken,

        onSuccess: async (publicToken: string, metadata: any) => {
          const account     = metadata?.accounts?.[0];
          const accountId   = account?.id;
          const accountName = account?.name || metadata?.institution?.name || 'Bank Account';

          try {
            // 2. Exchange token → creates external bank account on Cybrid + upserts to DB
            await api.post('/kyc/plaid/exchange', { publicToken, accountId, accountName });
            setStarting(false);
            // 3. Refresh list — user sees the new account and selects it manually
            await fetchAccounts();
          } catch (err: any) {
            setStarting(false);
            const msg = err.response?.data?.message || 'Failed to link account. Please try again.';
            onError?.(msg);
          }
        },

        onExit: (err: any) => {
          setStarting(false);
          if (err && err.error_code !== 'USER_EXITED') {
            onError?.('Bank connection interrupted. Please try again.');
          }
        },

        onEvent: (eventName: string) => {
          console.log('Plaid event:', eventName);
        },
      });

      handler.open();
    } catch (err: any) {
      setStarting(false);
      onError?.('Failed to start bank linking. Please try again.');
    }
  }

  // ── Verify + sync — mirrors CybridBankLink.runVerificationAndSync ──

  async function runVerificationAndSync() {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);

    try {
      // 1. Kick off Cybrid bank IDV (non-fatal)
      await api.post('/cybrid/verify-bank-account', {}).catch(() => {});

      // 2. Poll until verified or timeout — same 90s max as CybridBankLink
      const verifyStart = Date.now();
      await new Promise<void>((resolve) => {
        const poll = setInterval(async () => {
          try {
            const { data: latest } = await api.get('/cybrid/status');
            if (latest.data.hasVerifiedBankAccount || Date.now() - verifyStart > 90_000) {
              clearInterval(poll);
              resolve();
            }
          } catch { /* keep polling */ }
        }, 3_000);
      });

      // 3. Sync Cybrid → local DB
      await api.post('/cybrid/sync-bank-accounts');

      // 4. Refresh list from DB
      await fetchAccounts();
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────

  const verifiedAccounts   = accounts.filter((a) => a.isVerified);
  const unverifiedAccounts = accounts.filter((a) => !a.isVerified);
  const selectedAccount    = accounts.find((a) => a.guid === selected) ?? null;
  const canContinue        = !!selected && !!selectedAccount?.isVerified && !verifying;

  // ── Verifying spinner — same as CybridBankLink ────────────────

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

  // ── Main render ───────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* External error banner (from parent / send failure) */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div key="ext-error" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
            <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <StatusBanner variant="warning" title={errorMessage} />
                {onDismissError && (
                  <button onClick={onDismissError} className="text-amber-600 hover:text-amber-800 flex-shrink-0 ml-auto">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account list */}
      {loadingAccounts ? (
        <div className="flex items-center gap-2 py-3 text-slate-400">
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
                const isSelected = selected === account.guid;
                return (
                  <motion.button key={account.guid} type="button"
                    onClick={() => setSelected(account.guid)}
                    initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
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
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Verified
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Unverified — informational, not selectable */}
          {unverifiedAccounts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
                Pending verification
              </p>
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

      {/* Add account — dashed button, same as CybridBankLink */}
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
            {starting
              ? 'Connecting…'
              : accounts.length > 0 ? 'Add another account' : 'Link a bank account'
            }
          </p>
          <p className="text-xs mt-0.5 opacity-70">Secured via Plaid · credentials never stored</p>
        </div>
      </button>

      {/* Continue — only when verified accounts exist */}
      {verifiedAccounts.length > 0 && (
        <Button
          className="w-full h-12 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-semibold"
          disabled={!canContinue}
          onClick={() => {
            if (selected && selectedAccount) onContinue(selected, selectedAccount);
          }}
        >
          Continue <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      )}
    </div>
  );
}