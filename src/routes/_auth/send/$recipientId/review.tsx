import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import api from "@/lib/axios";
import { useSendStore } from "@/stores/useSendStore";

export const Route = createFileRoute("/_auth/send/$recipientId/review")({
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search.amount ?? 0),
  }),
  component: RouteComponent,
});

type ReviewStep = "review" | "processing" | "success" | "error";

function RouteComponent() {
  // const { recipientId } = useParams({ from: "/_auth/send/$recipientId/review" });
  // const { amount } = useSearch({ from: "/_auth/send/$recipientId/review" });
  const navigate = useNavigate();

  const [step, setStep] = useState<ReviewStep>("review");
  const [transferStatus, setTransferStatus] = useState("Initiating transfer...");
  const [errorMessage, setErrorMessage] = useState("");

  const transferPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Guard: if no amount, send back
  useEffect(() => {
    if (!amount || amount <= 0) {
      navigate({ to: "/send/$recipientId/amount", params: { recipientId } });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transferPollRef.current) clearInterval(transferPollRef.current);
    };
  }, []);
  const amount = useSendStore((s) => s.amount);
  const selectedBankAccount = useSendStore((s) => s.selectedBankAccount);
  const recipientId = useSendStore((s) => s.recipientId);
  async function handleSend() {
    setStep("processing");
    setTransferStatus("Initiating transfer...");

    try {
      const { data } = await api.post("/cybrid/send", {e
        amount,
        bankAccountGuid:selectedBankAccount?.guid,
        recipientId,
      });



      const tid = data.data.transferId;
      setTransferStatus("Funding in progress...");

      transferPollRef.current = setInterval(async () => {
        try {
          const { data: tData } = await api.get(`/cybrid/transfer/${tid}`);
          const s = tData.data;

          if (s.status === "funding_initiated") {
            setTransferStatus("Pulling funds from your bank...");
          } else if (s.status === "book_initiated") {
            setTransferStatus("Moving funds to StableSend...");
          } else if (s.status === "completed") {
            if (transferPollRef.current) clearInterval(transferPollRef.current);
            setTransferStatus("completed");
            setStep("success");
          } else if (s.status === "failed") {
            if (transferPollRef.current) clearInterval(transferPollRef.current);
            setErrorMessage("Transfer failed. Please try again or contact support.");
            setStep("error");
          }
        } catch {
          // Keep polling
        }
      }, 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to initiate transfer.";
      const isUnverified =
        typeof msg === "string" && msg.toLowerCase().includes("not yet verified");
      const isNoBankAccount =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("no linked bank") ||
          msg.toLowerCase().includes("no linked bank account"));

      if (isUnverified || isNoBankAccount) {
        // Send them back to verify to re-link / re-verify bank
        navigate({ to: "/send/$recipientId/verify/kyc", params: { recipientId } });
      } else {
        setErrorMessage(msg);
        setStep("error");
      }
    }
  }

  function sendAgain() {
    navigate({ to: "/send/$recipientId/amount", params: { recipientId } });
  }

  function goToDashboard() {
    navigate({ to: "/dashboard" });
  }

  return (
    <AnimatePresence mode="wait">
      {/* Review */}
      {step === "review" && (
        <motion.div
          key="review"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="mb-4">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Review &amp; Confirm
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Check the details before sending
            </p>
          </div>

          {/* Hero amount card */}
          <Card className="p-4 sm:p-5 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white mb-4 border-0 shadow-lg">
            <div className="text-center">
              <div className="text-xs text-blue-100 mb-1">You are sending</div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                ${amount.toFixed(2)}
              </div>
              <div className="text-xs text-blue-200">USD via ACH bank transfer</div>
            </div>
          </Card>

          {/* Transfer breakdown */}
          <Card className="p-4 mb-4 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Transfer Details
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">From</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  Your linked bank account
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">To</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  StableSend Wallet
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Amount</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  ${amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Free
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Method</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  ACH Bank Transfer
                </span>
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  to: "/send/$recipientId/payment",
                  params: { recipientId },
                  search: { amount },
                })
              }
              className="h-12 px-5 dark:border-slate-700 dark:hover:bg-slate-800 border-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-base font-semibold shadow-lg"
              onClick={handleSend}
            >
              Confirm &amp; Send <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Processing */}
      {step === "processing" && (
        <motion.div
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Processing Transfer
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">
            {transferStatus}
          </p>

          <Card className="p-4 w-full max-w-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
            <div className="space-y-3">
              <TransferStepIndicator
                label="Initiating transfer"
                done={[
                  "Pulling funds from your bank...",
                  "Moving funds to StableSend...",
                  "completed",
                ].includes(transferStatus)}
                active={transferStatus === "Initiating transfer..."}
              />
              <TransferStepIndicator
                label="Pulling funds from your bank"
                done={[
                  "Moving funds to StableSend...",
                  "completed",
                ].includes(transferStatus)}
                active={transferStatus === "Pulling funds from your bank..."}
              />
              <TransferStepIndicator
                label="Moving funds to StableSend"
                done={transferStatus === "completed"}
                active={transferStatus === "Moving funds to StableSend..."}
              />
            </div>
          </Card>
        </motion.div>
      )}

      {/* Success */}
      {step === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Transfer Complete!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6">
            ${amount.toFixed(2)} has been deposited to your StableSend wallet.
          </p>

          <Card className="p-4 w-full max-w-sm mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <div className="text-center">
              <div className="text-xs text-emerald-100 mb-1">Amount Deposited</div>
              <div className="text-3xl font-bold">${amount.toFixed(2)}</div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button
              onClick={sendAgain}
              className="flex-1 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11"
            >
              Send Again
            </Button>
            <Button
              variant="outline"
              onClick={goToDashboard}
              className="flex-1 h-11 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {step === "error" && (
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
            Transfer Failed
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">
            {errorMessage}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep("review")}
              className="h-11 px-6 dark:border-slate-700 dark:hover:bg-slate-800 border-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              onClick={() => {
                setErrorMessage("");
                setStep("review");
              }}
              className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-8"
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sub-component ──

function TransferStepIndicator({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      ) : active ? (
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
      )}
      <span
        className={`text-sm ${done
            ? "text-emerald-600 dark:text-emerald-400 font-medium"
            : active
              ? "text-blue-600 dark:text-blue-400 font-medium"
              : "text-slate-400 dark:text-slate-500"
          }`}
      >
        {label}
      </span>
    </div>
  );
}