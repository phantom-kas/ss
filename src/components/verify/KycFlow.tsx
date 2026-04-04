/**
 * components/verify/KycFlow.tsx
 *
 * Drop-in replacement for CybridKyc.
 * Same props interface — swap <CybridKyc> → <KycFlow> in your pages.
 *
 * Uses:
 *   POST /kyc/start              → create/resume identity verification
 *   GET  /kyc/verification/:guid → poll for persona_inquiry_id + outcome
 *   POST /kyc/session            → resume incomplete inquiry
 *   Persona SDK CDN              → camera / ID capture UI
 *
 * Flow:
 *   1. On mount: check /cybrid/kyc/status once — if verified, call onVerified().
 *      No background polling on mount (fixes the production premature-nav bug).
 *   2. User clicks Start → POST /kyc/start → get identityVerificationGuid.
 *   3. Poll GET /kyc/verification/:guid every 2s until persona_inquiry_id populated.
 *   4. Init Persona SDK with inquiryId → SDK opens in overlay.
 *   5. Persona onComplete → poll /kyc/verification/:guid until state=completed.
 *   6. outcome=passed → onVerified().
 */

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { StatusBanner } from './shared';
import api from '@/lib/axios';

// ── Props — identical to CybridKyc so it's a drop-in ─────────

interface Props {
  kycStatus:  string | undefined;
  onVerified: () => void;
  onError?:   (msg: string) => void;
}

// ── Internal step machine ─────────────────────────────────────

type Step =
  | 'idle'             // show Start card
  | 'creating'         // POST /kyc/start in flight
  | 'waiting_inquiry'  // polling for persona_inquiry_id
  | 'sdk_active'       // Persona SDK is open
  | 'polling_result'   // Persona onComplete, polling Cybrid for outcome
  | 'reviewing'        // sent to compliance team
  | 'failed';          // outcome: failed — show retry

const PERSONA_CDN = 'https://cdn.withpersona.com/dist/persona-v5.5.0.js';

export function KycFlow({ kycStatus, onVerified, onError }: Props) {
  const [step, setStep]         = useState<Step>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [failureCodes, setFailureCodes] = useState<string[]>([]);

  // Persisted across steps
  const verificationGuidRef = useRef<string | null>(null);
  const inquiryIdRef        = useRef<string | null>(null);
  const personaClientRef    = useRef<any>(null);
  const pollRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef             = useRef(false);    // prevents double-fire of onVerified
  const hasRunRef           = useRef(false);    // prevents double mount effect

  // ── Mount: single status check, no polling ────────────────────
  // Mirrors the working pattern in CybridKyc.hasRunRef guard

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // If parent already passed verified, skip
    if (kycStatus === 'verified') { finish(); return; }

    (async () => {
      try {
        // 1. Check local kyc_status first (fast)
        const { data } = await api.get('/cybrid/kyc/status');
        const status   = data?.data?.kycStatus as string | undefined;
        if (status === 'verified') { finish(); return; }

        // 2. Check if there's already a completed/passed verification in Cybrid
        //    (covers the case where the local DB is stale or the user just finished)
        const startRes = await api.post('/kyc/start');
        const r        = startRes.data?.data;
        if (!r) return;

        if (r.alreadyVerified) { finish(); return; }

        // Completed + passed but local DB not yet synced
        if (r.state === 'completed') {
          const vRes = await api.get(`/kyc/verification/${r.identityVerificationGuid}`);
          handleResult(vRes.data?.data);
          return;
        }

        // Has an active inquiry — store refs so Resume works if user comes back
        if (r.identityVerificationGuid) {
          verificationGuidRef.current = r.identityVerificationGuid;
          inquiryIdRef.current        = r.personaInquiryId;
        }
        // Otherwise just show the Start card
      } catch { /* show Start card */ }
    })();

    return () => stopPoll();
  }, []);

  // Sync if parent updates kycStatus prop
  useEffect(() => {
    if (kycStatus === 'verified') finish();
  }, [kycStatus]);

  // ── Helpers ───────────────────────────────────────────────────

  function stopPoll() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    stopPoll();
    personaClientRef.current?.exit?.();
    onVerified();
  }

  function setFailed(codes: string[] = []) {
    stopPoll();
    personaClientRef.current?.exit?.();
    setFailureCodes(codes);
    setStep('failed');
    setErrorMsg('Verification did not pass. Check the tips below and try again.');
  }

  // ── Step 1: Start ──────────────────────────────────────────────

  async function handleStart() {
    setStep('creating');
    setErrorMsg('');
    setFailureCodes([]);
    doneRef.current = false;

    try {
      const { data } = await api.post('/kyc/start');
      const r        = data.data;

      if (r.alreadyVerified) { finish(); return; }

      verificationGuidRef.current = r.identityVerificationGuid;
      inquiryIdRef.current        = r.personaInquiryId;

      if (r.personaInquiryId) {
        await launchPersona(r.personaInquiryId, null);
      } else {
        setStep('waiting_inquiry');
        pollForInquiryId(r.identityVerificationGuid);
      }
    } catch (err: any) {
      setStep('idle');
      const msg = err.response?.data?.message || 'Failed to start verification. Please try again.';
      setErrorMsg(msg);
      onError?.(msg);
    }
  }

  // ── Step 2: Poll for inquiry id ────────────────────────────────

  function pollForInquiryId(guid: string) {
    stopPoll();
    const start = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - start > 30_000) {
        stopPoll(); setStep('idle');
        setErrorMsg('Timed out starting verification. Please try again.');
        return;
      }
      try {
        const { data } = await api.get(`/kyc/verification/${guid}`);
        const v        = data.data;
        if (v.personaInquiryId) {
          stopPoll();
          inquiryIdRef.current = v.personaInquiryId;
          await launchPersona(v.personaInquiryId, null);
        } else if (v.state === 'completed') {
          stopPoll(); handleResult(v);
        }
      } catch { /* retry */ }
    }, 2_000);
  }

  // ── Step 3: Launch Persona SDK ─────────────────────────────────

  async function loadPersonaSdk(): Promise<void> {
    if ((window as any).Persona) return;
    return new Promise((res, rej) => {
      const s   = document.createElement('script');
      s.src     = PERSONA_CDN;
      s.onload  = () => res();
      s.onerror = () => rej(new Error('Failed to load Persona SDK'));
      document.head.appendChild(s);
    });
  }

  async function launchPersona(inquiryId: string, sessionToken: string | null) {
    setStep('sdk_active');
    try {
      await loadPersonaSdk();
      const Persona = (window as any).Persona;
      const cfg: any = {
        language: 'en',
        onReady:    () => personaClientRef.current?.open(),
        onComplete: () => {
          setStep('polling_result');
          pollForResult(verificationGuidRef.current!);
        },
        onCancel: () => setStep('idle'),
        onError:  (e: any) => {
          console.error('Persona error', e);
          setStep('idle');
          setErrorMsg('Verification error. Please try again.');
        },
      };
      if (sessionToken) cfg.sessionToken = sessionToken;
      else              cfg.inquiryId    = inquiryId;
      personaClientRef.current = new Persona.Client(cfg);
    } catch {
      setStep('idle');
      setErrorMsg('Failed to load verification SDK. Please try again.');
    }
  }

  // ── Step 4: Poll for final result ──────────────────────────────

  function pollForResult(guid: string) {
    stopPoll();
    const start = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - start > 5 * 60_000) { stopPoll(); setStep('reviewing'); return; }
      try {
        const { data } = await api.get(`/kyc/verification/${guid}`);
        handleResult(data.data);
      } catch { /* retry */ }
    }, 3_000);
  }

  function handleResult(v: any) {
    if (v.state === 'completed' && v.outcome === 'passed') { stopPoll(); finish(); }
    else if (v.state === 'completed' && v.outcome === 'failed') { stopPoll(); setFailed(v.failureCodes ?? []); }
    else if (v.state === 'reviewing') { stopPoll(); setStep('reviewing'); }
    // still in progress — keep polling
  }

  // ── Resume incomplete session ──────────────────────────────────

  async function handleResume() {
    if (!verificationGuidRef.current || !inquiryIdRef.current) { handleStart(); return; }
    setStep('creating');
    try {
      const { data } = await api.post('/kyc/session', {
        personaInquiryId:         inquiryIdRef.current,
        identityVerificationGuid: verificationGuidRef.current,
      });
      await launchPersona(data.data.personaInquiryId, data.data.personaSessionToken);
    } catch {
      await launchPersona(inquiryIdRef.current, null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────

  // Mirrors CybridKyc showStartCard logic exactly
  const showStartCard = step === 'idle' || step === 'failed';

  return (
    <div className="space-y-4">

      {/* Error / failure message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div key="err" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
            <StatusBanner
              variant="error"
              title={step === 'failed' ? 'Verification failed' : 'Error'}
              message={errorMsg}
            />
            {failureCodes.length > 0 && (
              <p className="text-xs text-red-500 mt-1 px-1">Issues: {failureCodes.join(', ')}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KYC pending (passed from parent kycStatus prop) */}
      <AnimatePresence>
        {kycStatus === 'pending' && showStartCard && (
          <motion.div key="pending" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
            <StatusBanner
              variant="warning"
              spinner
              title="Verification in progress"
              message="Your identity is being reviewed. This usually takes a few minutes."
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Under compliance review */}
      {step === 'reviewing' && (
        <StatusBanner
          variant="warning"
          spinner
          title="Under Compliance Review"
          message="Your verification is being reviewed by our team. This usually takes 1–2 business days. You'll receive an email when complete."
        />
      )}

      {/* Start / retry card — same look as CybridKyc */}
      <AnimatePresence>
        {showStartCard && (
          <motion.div key="start-card"
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-8, height:0 }} transition={{ duration: 0.2 }}
          >
            <Card className="p-5 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {step === 'failed' ? 'Try Verification Again' : 'Identity Verification Required'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Government-issued ID + selfie · Takes about 2 minutes
                  </p>
                </div>
                <Button onClick={handleStart}
                  className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 px-4 flex-shrink-0">
                  {step === 'failed'
                    ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry</>
                    : <>Start <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                  }
                </Button>
              </div>
            </Card>

            {/* Retry tips — shown after failure */}
            {step === 'failed' && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Tips for a better result:</p>
                <p>· Place your ID flat on a dark, non-reflective surface</p>
                <p>· All four corners of the ID must be visible</p>
                <p>· Avoid glare on both ID and selfie</p>
                <p>· Use a phone camera, not a laptop webcam</p>
                <p>· Remove glasses, hats or anything covering your face</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading / waiting states */}
      {(step === 'creating' || step === 'waiting_inquiry' || step === 'polling_result') && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {step === 'creating'        && 'Starting verification…'}
            {step === 'waiting_inquiry' && 'Preparing your session…'}
            {step === 'polling_result'  && 'Checking your result…'}
          </p>
        </motion.div>
      )}

      {/* SDK active — Persona opens in its own overlay */}
      {step === 'sdk_active' && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex flex-col items-center py-10 gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">Verification open</p>
          <p className="text-xs text-slate-500 text-center max-w-xs">
            Complete the steps in the verification window.{' '}
            <button onClick={handleResume} className="text-blue-600 underline">
              Didn't open? Click here.
            </button>
          </p>
        </motion.div>
      )}

    </div>
  );
}