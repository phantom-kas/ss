import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Building, Smartphone } from "lucide-react";
import { DeliveryMethod } from "./recipientForm";
interface Props {
  value?: DeliveryMethod;                     // what to render
  onChange: (method: DeliveryMethod) => void; // notify parent
  label?: string;
}




  const deliveryMethods = [
    { id: 'mobile', name: 'Mobile Money', desc: 'MTN, Vodafone, AirtelTigo', icon: Smartphone, time: 'Instant', fee: 0.5 },
    { id: 'bank',disabled:true, name: 'Bank Transfer', desc: 'Any Ghanaian bank', icon: Building, time: '2-4 hours', fee: 0.5 },
  ];


export function DeliveryMethodSelector({
  value,

  onChange,
  label = "Delivery Method",
}: Props) {
  return (
    <div className="mb-3 sm:mb-5">
      <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 block">
        {label}
      </Label>

      <div className="space-y-2 sm:space-y-3">
        {deliveryMethods.map((method) => {
          const active = value === method.id;

          return (
            <button
              type="button"
              key={method.id}
              disabled={method.disabled}
              onClick={() => onChange(method.id as DeliveryMethod)}
              className={cn(
                "w-full p-3 sm:p-5 rounded-xl border-2 transition-all text-left",
                active
                  ? "border-blue-700 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                  : "border-slate-200 dark:border-slate-700 dark:bg-slate-800",
                method.disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98]"
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={cn(
                    "w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    active ? "bg-blue-700" : "bg-slate-100 dark:bg-slate-700"
                  )}
                >
                  <method.icon
                    className={cn(
                      "w-6 h-6 sm:w-7 sm:h-7",
                      active
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-300"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1">
                    {method.name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {method.desc}
                  </p>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                    {method.time}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {method.fee}% fee
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}