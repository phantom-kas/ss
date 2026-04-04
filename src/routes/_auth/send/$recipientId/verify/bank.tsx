import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BankLinkFlow } from '@/components/verify/BankLinkFlow';  // ← was CybridBankLink
import { VerifyHeader, VerifyLoader, VerifyError, VerifyingSpinner } from '@/components/verify/shared';
import { useSendStore } from '@/stores/useSendStore';
import api from '@/lib/axios';

export const Route = createFileRoute('/_auth/send/$recipientId/verify/bank')({
  component: RouteComponent,
});

function RouteComponent() {
  const { recipientId } = useParams({ from: '/_auth/send/$recipientId/verify/bank' });
  const navigate        = useNavigate();

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [verifyingBank, setVerifying] = useState(false);
  const [bankError, setBankError]     = useState('');

  // Store
  const setSelectedBankAccount = useSendStore((s) => s.setSelectedBankAccount);
  const setRecipientId         = useSendStore((s) => s.setRecipientId);
  const storedAccount          = useSendStore((s) => s.selectedBankAccount);

  useEffect(() => {
    setRecipientId(recipientId);

    (async () => {
      try {
        const { data } = await api.get('/cybrid/status');
        const s = data?.data;
        if (!s) throw new Error('Invalid response');

        if (s.kycStatus !== 'verified') {
          navigate({ to: '/send/$recipientId/verify/kyc', params: { recipientId } });
          return;
        }

        // Already has verified bank — skip to amount
        // if (s.hasVerifiedBankAccount) {
        //   navigate({ to: '/send/$recipientId/amount', params: { recipientId } });
        //   return;
        // }
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

  // Called by BankLinkFlow when user selects an account and clicks Continue
  function handleBankContinue(guid: string, account: any) {
    setSelectedBankAccount(account);
    setVerifying(true);

    // Kick off verification non-blocking (BankLinkFlow already did it,
    // but call again in case it was skipped for an already-verified account)
    api.post('/cybrid/verify-bank-account', {}).catch(() => {});

    // Poll until verified then navigate
    const start = Date.now();
    const poll  = setInterval(async () => {
      try {
        const { data } = await api.get('/cybrid/status');
        const s = data?.data;
        if (s?.hasVerifiedBankAccount || Date.now() - start > 90_000) {
          clearInterval(poll);
          setVerifying(false);
          navigate({ to: '/send/$recipientId/amount', params: { recipientId } });
        }
      } catch { /* keep polling */ }
    }, 3_000);
  }

  if (loading)      return <VerifyLoader />;
  if (error)        return <VerifyError message={error} onRetry={() => window.location.reload()} />;
  if (verifyingBank) return <VerifyingSpinner />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="bank-page"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
      >
        <VerifyHeader
          title="Link Your Bank Account"
          subtitle="Connect your US bank account to fund transfers"
        />

        {/* BankLinkFlow is a drop-in for CybridBankLink — same props */}
        <BankLinkFlow
          initialSelectedGuid={storedAccount?.guid ?? null}
          onContinue={handleBankContinue}
          onError={(msg) => setBankError(msg)}
          errorMessage={bankError}
          onDismissError={() => setBankError('')}
        />
      </motion.div>
    </AnimatePresence>
  );
}