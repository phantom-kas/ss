import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { useRecipientsInfinite } from "@/hooks/useMomoNetworks";
import { InfiniteScrollList } from "./InifiteScrollCont";

export function RecentRecipientsVertical({
  deliveryMethod,
  onSelect,
}: {
  deliveryMethod: "bank" | "mobile_money" | "crypto";
  onSelect: (r: any) => void;
}) {
  const query = useRecipientsInfinite(deliveryMethod);

  const recipients =
    query.data?.pages.flatMap((page) => page) ?? [];

  if (!recipients.length) return null;

  return (
    <Card className="p-3 sm:p-4 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
        <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
         Recent Recipients
      </h3>
 <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        Select from your recent transfers
      </p>
      <InfiniteScrollList
        items={recipients}
        className="space-y-2"
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        renderItem={(recipient) => (
          <button
            key={recipient.id}
            onClick={() => onSelect(recipient)}
            className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all text-left group"
          >
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {recipient.avatar || recipient.full_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                  {recipient.full_name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {recipient.method === "mobile_money"
                    ? recipient.momo_number
                    : `${recipient.bank_name} • ${recipient.account_number}`}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {recipient.lastSent || ""}
                </p>
                <div className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Select →
                </div>
              </div>
            </div>
          </button>
        )}
      />
    </Card>
  );
}
