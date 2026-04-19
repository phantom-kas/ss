import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useSendStore } from "@/stores/useSendStore";

export const Route = createFileRoute("/_auth/send/$recipientId/payment")({
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search.amount ?? 0),
  }),
  component: RouteComponent,
});

interface BankAccount {
  name: string;
  mask: string | null;
  institution?: string;
}

interface CybridStatus {
  hasCustomer: boolean;
  kycStatus: string;
  hasBankAccount: boolean;
  hasVerifiedBankAccount?: boolean;
  bankAccount?: BankAccount;
}

function RouteComponent() {
  const { recipientId } = useParams({ from: "/_auth/send/$recipientId/payment" });
  // const { amount } = useSearch({ from: "/_auth/send/$recipientId/payment" });
  const amount          = useSendStore((s) => s.amount);

  const navigate = useNavigate();

  const [status, setStatus] = useState<CybridStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cybrid/status");
        const s: CybridStatus = data?.data;
        if (!s || s.kycStatus !== "verified") {
          toast.error('Your KYC is not done verifying')

          navigate({ to: "/send/$recipientId/verify/kyc", params: { recipientId } });
          return;
        }

        if( !s.hasBankAccount)
        {
          toast.error('Your bank account is not done verifying')
          navigate({ to: "/send/$recipientId/verify/bank", params: { recipientId } });
          return;
        }
        if (!amount || amount <= 0) {
          navigate({ to: "/send/$recipientId/amount", params: { recipientId } });
          return;
        }
        setStatus(s);
      } catch {
        setError("Failed to load account details. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function goBack() {
    navigate({
      to: "/send/$recipientId/amount",
      params: { recipientId },
    });
  }

  function goToReview() {
    navigate({
      to: "/send/$recipientId/review",
      params: { recipientId },
      search: { amount },
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading payment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">
          {error}
        </p>
        <Button onClick={() => window.location.reload()} className="bg-blue-700 hover:bg-blue-800 h-11 px-8">
          Try Again
        </Button>
      </div>
    );
  }

  const bank = status?.bankAccount;

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="mb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Payment Method
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Funds will be pulled via ACH from your linked bank
        </p>
      </div>

      {/* Amount summary pill */}
      <div className="flex items-center border-slate-300 justify-between bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 mb-5 border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Sending
        </span>
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          ${amount.toFixed(2)}
        </span>
      </div>

      {/* Bank account card */}
      <div className="mb-5">
        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">
          Payment Source
        </Label>

        <Card className="p-4 sm:p-5 dark:bg-slate-800 dark:border-slate-700 border-2 border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {bank?.institution ?? bank?.name ?? "Linked Bank Account"}
              </p>
              {bank?.name && bank.institution && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {bank.name}
                </p>
              )}
              {bank?.mask && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Account ending in <span className="font-semibold">••••{bank.mask}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {status?.hasVerifiedBankAccount ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Verified
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Linked
                  </span>
                </>
              )}
            </div>
          </div>
        </Card>

        <button
          type="button"
          onClick={() =>
            navigate({ to: "/send/$recipientId/verify/bank", params: { recipientId } })
          }
          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Use a different bank account
        </button>
      </div>

      {/* Transfer method info */}
      <Card className="p-4 mb-5 bg-slate-50 dark:bg-slate-800/60 dark:border-slate-700 border-slate-300">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
          Transfer Details
        </h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Method</span>
            <span className="font-semibold text-slate-900 dark:text-white">ACH Bank Transfer</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Fee</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Settlement</span>
            <span className="font-semibold text-slate-900 dark:text-white">1–3 business days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Total charged</span>
            <span className="font-bold text-slate-900 dark:text-white">${amount.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Security badge */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-5 justify-center">
        <Lock className="w-3.5 h-3.5" />
        <span>Secured by Cybrid · 256-bit encryption</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={goBack}
          className="h-12 px-5 dark:border-slate-700 dark:hover:bg-slate-800 border-2 border-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          className="flex-1 h-12 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-semibold shadow-lg"
          onClick={goToReview}
        >
          Review Transfer <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// Small helper used inline — avoids importing from a separate file
function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}