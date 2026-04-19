/**
 * components/TotpGate.tsx
 *
 * Drop-in wrapper for any action that needs a TOTP challenge when
 * the user has 2FA enabled.
 *
 * Usage on the review page:
 *
 *   <TotpGate onConfirm={(code) => handleSend(code)}>
 *     {(trigger) => (
 *       <Button onClick={trigger}>Confirm & Send</Button>
 *     )}
 *   </TotpGate>
 *
 * If the user has totp_enabled === false, trigger() calls onConfirm(undefined)
 * immediately — no modal shown.
 *
 * If totp_enabled === true, trigger() opens the modal.
 * When the user enters the 6-digit code, onConfirm(code) is called.
 */

import * as React from 'react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { Loader2, ShieldCheck, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuthStore } from '@/stores/auth'   // adjust path to your user auth store

interface TotpGateProps {
  /** Called with the TOTP code (or undefined if 2FA is off) */
  onConfirm:    (code: string | undefined) => Promise<void>
  isLoading?:   boolean
  /** Render prop: receives the trigger function */
  children:     (trigger: () => void) => React.ReactNode
}

export function TotpGate({ onConfirm, isLoading = false, children }: TotpGateProps) {
  const [open, setOpen]         = React.useState(false)
  const [code, setCode]         = React.useState('')
  const [error, setError]       = React.useState('')
  const [submitting, setSubmit] = React.useState(false)

  // Read totp_enabled from your auth store — adjust selector to match your store shape
  const totpEnabled = useAuthStore((s) => s.user?.totp_enabled ?? false)

  function trigger() {
    if (!totpEnabled) {
      // No 2FA — proceed immediately
      onConfirm(undefined)
      return
    }
    // 2FA on — open modal
    setCode('')
    setError('')
    setOpen(true)
  }

  // Auto-submit when 6 digits entered
  React.useEffect(() => {
    if (code.length === 6 && open) {
      handleSubmit()
    }
  }, [code])

  async function handleSubmit() {
    if (code.length !== 6) { setError('Enter the full 6-digit code.'); return }
    setError('')
    setSubmit(true)
    try {
      await onConfirm(code)
      setOpen(false)
    } catch (err: any) {
      // If the backend returns 401 with 'Invalid 2FA code', show it here
      const msg = err?.response?.data?.message
      if (msg?.toLowerCase().includes('2fa') || msg?.toLowerCase().includes('code')) {
        setError(msg)
        setCode('')   // clear so user can re-type
      } else {
        // Non-2FA error — close modal and let parent handle it
        setOpen(false)
      }
    } finally {
      setSubmit(false)
    }
  }

  return (
    <>
      {children(trigger)}

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => !submitting && setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Confirm with 2FA
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Enter your authenticator code to authorise this transfer
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => !submitting && setOpen(false)}
                    disabled={submitting}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-40 flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* OTP input */}
                <div className="flex justify-center mb-4">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(val) => { setCode(val); setError('') }}
                    disabled={submitting}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-500 text-center mb-3">{error}</p>
                )}

                {/* Confirm button */}
                <Button
                  onClick={handleSubmit}
                  disabled={code.length !== 6 || submitting}
                  className="w-full h-11 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying…</>
                    : 'Authorise Transfer'
                  }
                </Button>

                <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3">
                  Open your authenticator app for the 6-digit code
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}