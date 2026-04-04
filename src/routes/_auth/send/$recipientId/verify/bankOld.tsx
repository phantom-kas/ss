/**
 * Updated _auth.send.$recipientId.verify.bank.tsx
 * Uses useSendStore to persist the selected bank account and amount
 * across page navigation so it's available on /payment and /review.
 */

import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { CybridBankLink } from '@/components/CybridBankLink';
import { useSendStore } from '@/stores/useSendStore';
import api from '@/lib/axios';

export const Route = createFileRoute('/_auth/send/$recipientId/verify/bankOld')({
  component: RouteComponent,
});

function RouteComponent() {
  const { recipientId } = useParams({ from: '/_auth/send/$recipientId/verify/bank' });
  const navigate        = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Store actions
  const setSelectedBankAccount = useSendStore((s) => s.setSelectedBankAccount);
  const setRecipientId         = useSendStore((s) => s.setRecipientId);
  const storedAccount          = useSendStore((s) => s.selectedBankAccount);

  // Persist recipientId to store when we land here
  useEffect(() => {
    setRecipientId(recipientId);
  }, [recipientId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/cybrid/status');
        const s = data?.data;
        if (!s) throw new Error('Invalid response');
        if (s.kycStatus !== 'verified') {
          navigate({ to: '/send/$recipientId/verify/kyc', params: { recipientId } });
          return;
        }
      } catch (err: any) {
        const code = err.response?.status;
        const msg  = err.response?.data?.message;
        setError(
          code === 401 || code === 403
            ? 'Session expired. Please sign in again.'
            : msg || 'Failed to check account status.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onContinue(guid: string, account: any) {
    // Persist to store — survives page navigation
    setSelectedBankAccount(account);
    navigate({
      to:     '/send/$recipientId/amount',
      params: { recipientId },
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading your accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">{error}</p>
        <Button onClick={() => window.location.reload()}
          className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-8">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="bank-page"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Choose Payment Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Select which bank account to fund this transfer from
          </p>
        </div>

        <CybridBankLink
          // Pass stored selection so the picker pre-highlights it
          initialSelectedGuid={storedAccount?.guid ?? null}
          onContinue={onContinue}
          onError={(msg) => setError(msg)}
        />
      </motion.div>
    </AnimatePresence>
  );
}