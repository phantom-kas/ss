import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { CybridKyc } from '@/components/CybridKyc';
import api from '@/lib/axios';

export const Route = createFileRoute('/_auth/send/$recipientId/verify/kyc')({
  component: RouteComponent,
});

function RouteComponent() {
  const { recipientId } = useParams({ from: '/_auth/send/$recipientId/verify/kyc' });
  const navigate        = useNavigate();

  const [kycStatus, setKycStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    (async () => {
      try {
        console.log('kyc -- --')
        const { data } = await api.get('/cybrid/status');
        const s = data?.data;
        if (!s) throw new Error('Invalid response');

        // // Already fully set up — skip straight to amount
        // if (s.kycStatus === 'verified' && s.hasBankAccount && s.bankAccounts.length > 0) {
        //   navigate({ to: '/send/$recipientId/amount', params: { recipientId } });
        //   return;
        // }
        // // KYC already done but no bank — go to bank page
        // if (s.kycStatus === 'verified' && !s.hasBankAccount) {
        //   navigate({ to: '/send/$recipientId/verify/bank', params: { recipientId } });
        //   return;
        // }

         if (s.kycStatus === 'verified' ) {
          navigate({ to: '/send/$recipientId/verify/bank', params: { recipientId } });
          return;
        }
        setKycStatus(s.kycStatus);
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

  function onKycVerified() {
    navigate({ to: '/send/$recipientId/verify/bank', params: { recipientId } });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Checking your account status...</p>
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
        key="kyc-page"
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
          kycStatus={kycStatus}
          onVerified={onKycVerified}
          onError={(msg) => setError(msg)}
        />
      </motion.div>
    </AnimatePresence>
  );
}