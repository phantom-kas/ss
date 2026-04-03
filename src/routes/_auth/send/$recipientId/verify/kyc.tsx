import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KycFlow } from '@/components/verify/KycFlow';      // ← was CybridKyc
import { VerifyHeader, VerifyLoader, VerifyError } from '@/components/verify/shared';
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
        const { data } = await api.get('/cybrid/status');
        const s = data?.data;
        if (!s) throw new Error('Invalid response');

        if (s.kycStatus === 'verified') {
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

  if (loading) return <VerifyLoader />;
  if (error)   return <VerifyError message={error} onRetry={() => window.location.reload()} />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="kyc-page"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
      >
        <VerifyHeader
          title="Verify Your Identity"
          subtitle="One-time verification — takes about 2 minutes"
        />

        {/* KycFlow is a drop-in for CybridKyc — same props */}
        <KycFlow
          kycStatus={kycStatus}
          onVerified={onKycVerified}
          onError={(msg) => setError(msg)}
        />
      </motion.div>
    </AnimatePresence>
  );
}