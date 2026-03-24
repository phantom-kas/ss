import {
  createFileRoute,
  useNavigate,
  useLocation,
  Outlet,
} from "@tanstack/react-router";
import { SendMoney } from "../../components/SendMoney";
import { AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_auth/send")({
  component: SendRoute,
});

export function SendRoute() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const location = useLocation();
  const prefilledRecipient =
    (location.state as any)?.prefilledRecipient || null;

  const handleNavigate = (page: string) => {
    if (page === "dashboard") {
      navigate({ to: "/dashboard" });
    } else if (page === "transactions") {
      navigate({ to: "/transactions" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate({ to: "/" });
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                      s < step
                        ? "bg-emerald-600 text-white"
                        : s === step
                          ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-400/30"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {s < step ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      s
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium mt-1 sm:mt-1.5 whitespace-nowrap ${
                      step === idx + 1
                        ? "text-blue-600 dark:text-blue-400"
                        : step > idx + 1
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {["Recipient", "Amount", "Payment", "Review"][idx]}
                  </span>
                </div>

                {s < 4 && (
                  <div
                    className={`w-10 sm:w-16 h-0.5 mx-1 sm:mx-1.5 ${
                      s < step
                        ? "bg-emerald-600"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-6 pb-20 md:pb-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>
    </>
  );
}
