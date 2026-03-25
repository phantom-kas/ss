import {
  createFileRoute,
  useNavigate,
  useLocation,
  Outlet,
} from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldCheck, DollarSign, CreditCard, ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_auth/send")({
  component: SendRoute,
});

/** Map URL segments to step indices (1-based) */
const STEP_MAP: Record<string, number> = {
  verify: 1,
  amount: 2,
  payment: 3,
  review: 4,
};

const STEPS = [
  { label: "Verify",   icon: ShieldCheck },
  { label: "Amount",   icon: DollarSign },
  { label: "Payment",  icon: CreditCard },
  { label: "Review",   icon: ClipboardCheck },
];

export function SendRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active step from the current pathname segment
  // e.g. /send/abc123/amount  →  "amount"  →  step 2
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const currentStep = STEP_MAP[lastSegment] ?? 0;

  return (
    <>
      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {STEPS.map((s, idx) => {
              const stepNum = idx + 1;
              const isDone   = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              const Icon = s.icon;

              return (
                <div key={s.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : isActive
                            ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-400/30"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-medium mt-1 sm:mt-1.5 whitespace-nowrap ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : isDone
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div
                      className={`w-10 sm:w-16 h-0.5 mx-1 sm:mx-1.5 ${
                        isDone ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-6 pb-20 md:pb-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </>
  );
}