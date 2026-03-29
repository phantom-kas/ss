import {
  createFileRoute,
  useNavigate,
  useLocation,
  Outlet,
} from '@tanstack/react-router';
import { AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, Building2, DollarSign, CreditCard, ClipboardCheck } from 'lucide-react';

export const Route = createFileRoute('/_auth/send')({
  component: SendRoute,
});

const STEPS = [
  { label: 'Identity',  icon: ShieldCheck,    segments: ['kyc'] },
  { label: 'Bank',      icon: Building2,       segments: ['bank'] },
  { label: 'Amount',    icon: DollarSign,      segments: ['amount'] },
  { label: 'Payment',   icon: CreditCard,      segments: ['payment'] },
  { label: 'Review',    icon: ClipboardCheck,  segments: ['review'] },
];

export function SendRoute() {
  const location  = useNavigate();
  const { pathname } = useLocation();

  // Derive active step index from the last meaningful path segment
  const segments  = pathname.split('/').filter(Boolean);
  const lastSeg   = segments[segments.length - 1];

  // Map segment → step index (0-based)
  const stepIndex = STEPS.findIndex((s) => s.segments.includes(lastSeg));
  const currentStep = stepIndex === -1 ? -1 : stepIndex;

  // Hide progress bar on loading/error states (no segment match)
  const showProgress = currentStep >= 0;

  return (
    <>
      {showProgress && (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {STEPS.map((s, idx) => {
                const isDone   = idx < currentStep;
                const isActive = idx === currentStep;
                const Icon     = s.icon;

                return (
                  <div key={s.label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-400/30'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      }`}>
                        {isDone
                          ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        }
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium mt-1 whitespace-nowrap ${
                        isActive ? 'text-blue-600 dark:text-blue-400'
                        : isDone  ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-8 sm:w-12 h-0.5 mx-1 ${
                        isDone ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-6 pb-20 md:pb-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </>
  );
}