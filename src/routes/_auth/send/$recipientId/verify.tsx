import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Building2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "motion/react";
import api from "@/lib/axios";

export const Route = createFileRoute("/_auth/send/$recipientId/verify")({
  component: RouteComponent,
});

type VerifyStep =
  | "loading"
  | "kyc"
  | "bank"
  | "verifying-bank"
  | "done"
  | "error";

interface CybridStatus {
  hasCustomer: boolean;
  customerGuid: string | null;
  kycStatus: string;
  hasBankAccount: boolean;
  hasVerifiedBankAccount?: boolean;
  hasFiatAccount: boolean;
}

interface SdkTokenData {
  token: string;
  customerGuid: string;
  environment: string;
}

function RouteComponent() {
  const { recipientId } = useParams({ from: "/_auth/send/$recipientId/verify" });
  const navigate = useNavigate();

  const [step, setStep] = useState<VerifyStep>("loading");
  const [status, setStatus] = useState<CybridStatus | null>(null);
  const [sdkToken, setSdkToken] = useState<SdkTokenData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [unverifiedAccountDetails, setUnverifiedAccountDetails] = useState<{
    name?: string;
    mask?: string | null;
  } | null>(null);

  const sdkContainerRef = useRef<HTMLDivElement>(null);
  const kycPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const kycStatusPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number | null>(null);
  const bankStepFromSendFailureRef = useRef(false);

  const KYC_POLL_INTERVAL_MS = 5000;
  const KYC_POLL_MAX_MS = 5 * 60 * 1000;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (kycPollRef.current) clearInterval(kycPollRef.current);
      if (kycStatusPollRef.current) clearInterval(kycStatusPollRef.current);
    };
  }, []);

  // Poll KYC status while pending
  useEffect(() => {
    // alert(step)
    if (step !== "kyc" || status?.kycStatus !== "pending") {
      if (kycStatusPollRef.current) {
        clearInterval(kycStatusPollRef.current);
        kycStatusPollRef.current = null;
      }
      return;
    }
    const tick = () => fetchStatus(true, false);
    tick();
    kycStatusPollRef.current = setInterval(tick, 5000);
    return () => {
      if (kycStatusPollRef.current) {
        clearInterval(kycStatusPollRef.current);
        kycStatusPollRef.current = null;
      }
    };
  }, [step, status?.kycStatus]);

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, []);

  // Re-check bank when on bank step
  useEffect(() => {
    if (step !== "bank") return;
    let cancelled = false;
    (async () => {
      const s = await fetchStatus(true, true);
      if (cancelled || !s) return;
      if (s.hasBankAccount && !bankStepFromSendFailureRef.current) {
        goToAmount();
      }
    })();
    return () => { cancelled = true; };
  }, [step]);

  function goToAmount() {
    navigate({ to: "/send/$recipientId/amount", params: { recipientId } });
  }

  async function fetchStatus(
    silent = false,
    skipDetermineStep = false
  ): Promise<CybridStatus | null> {
    try {
      const { data } = await api.get("/cybrid/status");
      const s: CybridStatus | undefined = data?.data;
      if (!s || typeof s !== "object") {
        if (!silent) {
          setErrorMessage("Invalid response from server. Please try again.");
          setStep("error");
        }
        return null;
      }
      setStatus(s);
      if (!skipDetermineStep) determineStep(s);
      return s;
    } catch (err: any) {
      if (!silent) {
        const status = err.response?.status;
        const msg = err.response?.data?.message;
        if (status === 401 || status === 403) {
          setErrorMessage(msg || "Session may have expired. Please sign in again.");
        } else {
          setErrorMessage(msg || "Failed to check account status. Please try again.");
        }
        setStep("error");
      }
      return null;
    }
  }

  function determineStep(s: CybridStatus) {
    if (!s.hasCustomer || s.kycStatus === "unverified" || s.kycStatus === "failed") {
      setStep("kyc");
    } else if (s.kycStatus === "pending") {
      setStep("kyc");
    } else if (s.kycStatus === "verified" && !s.hasBankAccount) {
      setStep("bank");
    } else if (s.kycStatus === "verified" && s.hasBankAccount) {
      // Everything is already set up — skip straight to amount
      goToAmount();
    } else {
      setStep("kyc");
    }
  }

  // ── SDK helpers ──

  function loadCybridSdk(): Promise<void> {
    const CYBRID_POLYFILLS_ID = "cybrid-sdk-polyfills-script";
    const CYBRID_SDK_ID = "cybrid-sdk-ui-script";

    function addScript(id: string, src: string, type?: string): Promise<void> {
      const existing = document.getElementById(id);
      if (existing) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        if (type) script.type = type;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
      });
    }

    return addScript(CYBRID_POLYFILLS_ID, "/cybrid-sdk-ui.polyfills.js").then(() =>
      addScript(CYBRID_SDK_ID, "/cybrid-sdk-ui.min.js", "module")
    );
  }

  function unmountSdk() {
    if (sdkContainerRef.current) {
      sdkContainerRef.current.innerHTML = "";
    }
  }

  async function mountSdk(
    component: string,
    tokenData: SdkTokenData,
    onComplete?: () => void
  ) {
    await loadCybridSdk();
    unmountSdk();
    if (!sdkContainerRef.current) return;

    const el = document.createElement("cybrid-app");
    (el as any).auth = tokenData.token;
    (el as any).config = {
      refreshInterval: 10000,
      routing: false,
      locale: "en-US",
      theme: document.documentElement.classList.contains("dark") ? "DARK" : "LIGHT",
      customer: tokenData.customerGuid,
      fiat: "USD",
      features: ["kyc_identity_verifications"],
      environment: tokenData.environment,
    };
    (el as any).component = component;

    el.addEventListener("eventLog", ((event: CustomEvent) => {
      const detail = event.detail as { code?: string; message?: string };
      if (
        (detail?.code === "ROUTING_REQUEST" || detail?.code === "ROUTING_DENIED") &&
        typeof onComplete === "function"
      ) {
        onComplete();
      }
    }) as EventListener);

    el.addEventListener("errorLog", ((event: CustomEvent) => {
      console.error("Cybrid SDK error:", JSON.stringify(event.detail));
    }) as EventListener);

    sdkContainerRef.current.appendChild(el);
  }

  async function handleSdkFlowComplete() {
    if (kycPollRef.current) {
      clearInterval(kycPollRef.current);
      kycPollRef.current = null;
    }
    unmountSdk();
    setStep("loading");
    setErrorMessage("");
    const maxAttempts = 6;
    const delayMs = 2000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const isLast = attempt === maxAttempts;
      const ok = await fetchStatus(!isLast);
      if (ok) return;
      if (!isLast) await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  // ── KYC ──

  async function startKyc() {
    try {
      await api.post("/cybrid/ensure-customer");
      const { data } = await api.get("/cybrid/sdk-token");
      const tokenData: SdkTokenData = data.data;
      setSdkToken(tokenData);

      await mountSdk("identity-verification", tokenData, handleSdkFlowComplete);

      pollStartRef.current = Date.now();
      kycPollRef.current = setInterval(async () => {
        if (pollStartRef.current && Date.now() - pollStartRef.current > KYC_POLL_MAX_MS) {
          if (kycPollRef.current) clearInterval(kycPollRef.current);
          kycPollRef.current = null;
          return;
        }
        try {
          const { data: kycData } = await api.get("/cybrid/kyc/status");
          if (kycData.data.kycStatus === "verified") {
            if (kycPollRef.current) clearInterval(kycPollRef.current);
            kycPollRef.current = null;
            unmountSdk();
            fetchStatus();
          }
        } catch {
          // Keep polling
        }
      }, KYC_POLL_INTERVAL_MS);
    } catch {
      setErrorMessage("Failed to start identity verification. Please try again.");
      setStep("error");
    }
  }

  // ── Bank Link ──

  async function startBankLink() {
    bankStepFromSendFailureRef.current = false;
    try {
      let tokenData = sdkToken;
      if (!tokenData) {
        const { data } = await api.get("/cybrid/sdk-token");
        tokenData = data.data;
        setSdkToken(tokenData);
      }

      await mountSdk("bank-account-connect", tokenData!, handleSdkFlowComplete);

      pollStartRef.current = Date.now();
      kycPollRef.current = setInterval(async () => {
        if (pollStartRef.current && Date.now() - pollStartRef.current > KYC_POLL_MAX_MS) {
          if (kycPollRef.current) clearInterval(kycPollRef.current);
          kycPollRef.current = null;
          return;
        }
        try {
          const { data: statusData } = await api.get("/cybrid/status");
          if (statusData.data.hasBankAccount) {
            if (kycPollRef.current) clearInterval(kycPollRef.current);
            kycPollRef.current = null;
            unmountSdk();
            setStep("verifying-bank");

            try {
              await api.post("/cybrid/verify-bank-account", {});
            } catch {
              // Non-fatal
            }

            const verifyStart = Date.now();
            const verifyMaxMs = 90_000;
            const verifyPoll = setInterval(async () => {
              try {
                const { data: latest } = await api.get("/cybrid/status");
                const s: CybridStatus = latest?.data;
                if (s?.hasVerifiedBankAccount) {
                  clearInterval(verifyPoll);
                  setStatus(s);
                  goToAmount();
                } else if (Date.now() - verifyStart > verifyMaxMs) {
                  clearInterval(verifyPoll);
                  goToAmount();
                }
              } catch {
                // Keep polling
              }
            }, 3000);
          }
        } catch {
          // Keep polling
        }
      }, KYC_POLL_INTERVAL_MS);
    } catch {
      setErrorMessage("Failed to start bank linking. Please try again.");
      setStep("error");
    }
  }

  return (
    <AnimatePresence mode="wait">
      {/* Loading */}
      {step === "loading" && (
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

      {/* KYC */}
      {step === "kyc" && (
        <motion.div
          key="kyc"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Verify Your Identity
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              One-time verification required before your first send
            </p>
          </div>

          {status?.kycStatus === "pending" && (
            <Card className="p-4 mb-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Verification in progress
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Your identity is being reviewed. This usually takes a few minutes.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {status?.kycStatus === "failed" && (
            <Card className="p-4 mb-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                    Verification failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Please try again. Make sure your ID is clear and your selfie matches.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* SDK mount point */}
          <div ref={sdkContainerRef} className="min-h-[400px] mb-4 rounded-xl overflow-hidden" />

          {(status?.kycStatus === 'pending' || status?.kycStatus === 'not_started' || status?.kycStatus === "unverified" ||
            status?.kycStatus === "failed" ||
            !status?.hasCustomer) && (
            <Card className="p-5 dark:bg-slate-800 dark:border-slate-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-blue-700 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Identity Verification Required
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  We need to verify your identity to comply with regulations. You will need a
                  government-issued ID and a selfie.
                </p>
                <Button
                  onClick={startKyc}
                  className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-8"
                >
                  Start Verification <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Bank Link */}
      {step === "bank" && (
        <motion.div
          key="bank"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
              Link Your Bank Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Connect your US bank account to fund transfers
            </p>
          </div>

          {errorMessage && (
            <Card className="p-4 mb-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-amber-900 dark:text-amber-200">{errorMessage}</p>
                  {unverifiedAccountDetails &&
                    (unverifiedAccountDetails.name || unverifiedAccountDetails.mask) && (
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-2 font-medium">
                        Account:{" "}
                        {[
                          unverifiedAccountDetails.name,
                          unverifiedAccountDetails.mask
                            ? `••••${unverifiedAccountDetails.mask}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => {
                    setErrorMessage("");
                    setUnverifiedAccountDetails(null);
                  }}
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          )}

          {/* SDK mount point */}
          <div ref={sdkContainerRef} className="min-h-[400px] mb-4 rounded-xl overflow-hidden" />

          <Card className="p-5 dark:bg-slate-800 dark:border-slate-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Connect Your Bank
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Securely link your bank account using Plaid. Your credentials are never stored.
              </p>
              <Button
                onClick={() => {
                  setErrorMessage("");
                  setUnverifiedAccountDetails(null);
                  startBankLink();
                }}
                className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-8"
              >
                Link Bank Account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Verifying bank transition */}
      {step === "verifying-bank" && (
        <motion.div
          key="verifying-bank"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Verifying Your Bank Account
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-sm">
            Confirming your bank account with our payment provider. This usually takes just a
            moment...
          </p>
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
            Something went wrong
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">
            {errorMessage}
          </p>
          <Button
            onClick={() => {
              setErrorMessage("");
              fetchStatus();
            }}
            className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-8"
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}