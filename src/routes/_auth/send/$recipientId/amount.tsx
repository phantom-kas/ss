import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Zap,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import api from "@/lib/axios";
import { showError } from "@/lib/error";
import { useSendStore } from "@/stores/useSendStore";

export const Route = createFileRoute("/_auth/send/$recipientId/amount")({
  component: RouteComponent,
});

interface CybridStatus {
  hasCustomer: boolean;
  kycStatus: string;
  hasBankAccount: boolean;
  hasVerifiedBankAccount?: boolean;
  hasFiatAccount: boolean;
}

const quickAmounts = [25, 50, 100, 250, 500, 1000];

function RouteComponent() {
  const { recipientId } = useParams({ from: "/_auth/send/$recipientId/amount" });
  const navigate = useNavigate();

  // const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // On mount: confirm KYC + bank are still good, redirect to verify if not
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cybrid/status");
        const s: CybridStatus = data?.data;
        if (!s || s.kycStatus !== "verified" || !s.hasBankAccount) {
          navigate({
            to: "/send/$recipientId/verify/kyc",
            params: { recipientId },
          });
          return;
        }
      } catch {
        setError("Failed to load account status.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch live exchange rate
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/exchange-rate"); // adjust endpoint as needed
        setExchangeRate(data?.data?.rate ?? data?.data ?? null);
      } catch {
        // Non-fatal; rate simply won't show
      }
    })();
  }, []);
  const setAmount = useSendStore((s) => s.setAmount);
  const amount          = useSendStore((s) => s.amount);

  // const setAmount = useSendStore((s) => amo);

  const parsedAmount = parseFloat(amount+'');
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0;
  const cedisAmount =
    isValid && exchangeRate ? (parsedAmount * exchangeRate).toFixed(2) : null;

  function handleContinue() {
    if (!isValid) return;
    navigate({
      to: "/send/$recipientId/payment",
      params: { recipientId },
      search: { amount: parsedAmount },
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
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
        <Button
          onClick={() => window.location.reload()}
          className="bg-blue-700 hover:bg-blue-800 h-11 px-8"
        >
          Try Again
        </Button>
      </div>
    );
  }



  return (
    <motion.div
      key="amount"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="mb-3 sm:mb-5">
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          How much to send?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Enter the USD amount to send
        </p>
      </div>

      {/* Exchange rate banner */}
      {exchangeRate && (
        <Card className="p-2.5 sm:p-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white mb-3 sm:mb-5 border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span className="text-xs sm:text-sm font-semibold">Live Rate</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-2xl font-bold">₵{exchangeRate}</span>
              <span className="text-[10px] sm:text-xs text-emerald-100">per USD</span>
            </div>
          </div>
        </Card>
      )}

      {/* Amount input */}
      <Card className="p-4 sm:p-6 mb-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="mb-6">
          <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">
            You Send
          </Label>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl sm:text-4xl md:text-5xl text-slate-900 dark:text-white font-bold">
              $
            </span>
            <Input
              type="number"
              placeholder="0"
              className="border-0 bg-transparent p-0 h-auto text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
              value={amount}
              onChange={(e) => {setAmount(Number(e.target.value))}}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium">USD</span>
            <span>&middot;</span>
            <span className="text-xs">United States Dollar</span>
          </div>
        </div>

        {isValid && (
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Amount
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                ${parsedAmount.toFixed(2)}
              </span>
            </div>
            {cedisAmount && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Recipient gets (est.)
                </span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  ₵{cedisAmount}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" />
              <span className="font-medium">Funds sent directly to recipient</span>
            </div>
          </div>
        )}
      </Card>

      {/* Quick select */}
      <div className="mb-4">
        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">
          Quick Select
        </Label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              type="button"
              onClick={() => setAmount(Number(qa))}
              className={`p-3 sm:p-4 border-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                amount === Number(qa.toString())
                  ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              }`}
            >
              <div className="text-sm sm:text-base">${qa}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sandbox notice */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-0.5">
              Sandbox Limit
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              In sandbox mode, deposits are limited to $100 per transaction.
            </p>
          </div>
        </div>
      </div>

      <Button
        className="w-full h-12 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-semibold shadow-lg"
        onClick={handleContinue}
        disabled={!isValid}
      >
        Continue <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );
}