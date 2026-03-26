import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { CybridKyc } from '@/components/CybridKyc';
import { CybridBankLink } from '@/components/CybridBankLink';
import api from '@/lib/axios';

export const Route = createFileRoute('/_auth/send/$recipientId/verify')({
  component: RouteComponent,
});

type VerifyStep = 'loading' | 'kyc' | 'bank' | 'error';

interface CybridStatus {
  hasCustomer: boolean;
  customerGuid: string | null;
  kycStatus: string;
  hasBankAccount: boolean;
  hasVerifiedBankAccount?: boolean;
  hasFiatAccount: boolean;
}

function RouteComponent() {
  const { recipientId } = useParams({ from: '/_auth/send/$recipientId/verify' });
  const navigate        = useNavigate();

  const [step, setStep]     = useState<VerifyStep>('loading');
  const [status, setStatus] = useState<CybridStatus | null>(null);
  const [error, setError]   = useState('');

  useEffect(() => { fetchStatus(); }, []);

  async function fetchStatus(silent = false) {
    try {
      const { data } = await api.get('/cybrid/status');
      const s: CybridStatus = data?.data;
      if (!s) throw new Error('Invalid response');
      setStatus(s);
      determineStep(s);
      return s;
    } catch (err: any) {
      if (!silent) {
        const msg = err.response?.data?.message;
        const code = err.response?.status;
        setError(
          code === 401 || code === 403
            ? 'Session expired. Please sign in again.'
            : msg || 'Failed to check account status. Please try again.'
        );
        setStep('error');
      }
      return null;
    }
  }

  function determineStep(s: CybridStatus) {
    const kyc = s.kycStatus;
    if (!s.hasCustomer || kyc === 'unverified' || kyc === 'not_started' || kyc === 'failed' || kyc === 'pending') {
      setStep('kyc');
    } else if (kyc === 'verified' && !s.hasBankAccount) {
      setStep('bank');
    } else if (kyc === 'verified' && s.hasBankAccount) {
      goToAmount();
    } else {
      setStep('kyc');
    }
  }

  function goToAmount() {
    navigate({ to: '/send/$recipientId/amount', params: { recipientId } });
  }

  return (
    <AnimatePresence mode="wait">

      {/* Loading */}
      {step === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Checking your account status...
          </p>
        </motion.div>
      )}

      {/* KYC step */}
      {step === 'kyc' && (
        <motion.div
          key="kyc"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-4">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Verify Your Identity
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              One-time verification — takes about 2 minutes
            </p>
          </div>

          <CybridKyc
            kycStatus={status?.kycStatus}
            onVerified={() => {
              // Re-fetch status to confirm, then move to bank step
              fetchStatus(true).then((s) => {
                if (s?.kycStatus === 'verified') {
                  setStep(s.hasBankAccount ? 'loading' : 'bank');
                  if (s.hasBankAccount) goToAmount();
                }
              });
            }}
            onError={(msg) => { setError(msg); setStep('error'); }}
          />
        </motion.div>
      )}

      {/* Bank step */}
      {step === 'bank' && (
        <motion.div
          key="bank"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-4">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Link Your Bank Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Connect a US bank account to fund your transfers
            </p>
          </div>

          <CybridBankLink
            onVerified={goToAmount}
            onError={(msg) => { setError(msg); setStep('error'); }}
          />
        </motion.div>
      )}

      {/* Error */}
      {step === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">
            {error}
          </p>
          <Button
            onClick={() => { setError(''); fetchStatus(); }}
            className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-8"
          >
            Try Again
          </Button>
        </motion.div>
      )}

    </AnimatePresence>
  );
}