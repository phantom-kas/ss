import { Card } from "@/components/ui/card";
import { Send, User } from "lucide-react";
import { useRecipientsInfinite } from "@/hooks/useMomoNetworks";
import { InfiniteScrollList } from "./InifiteScrollCont";
import { Link } from "@tanstack/react-router";

export function RecentRecipientsHome({
  deliveryMethod,
  onSelect,
  onClickAdd = ()=>{},
  onClickSend = ()=>{}
}: {
  deliveryMethod?: "bank" | "mobile_money" | "crypto";
  onSelect: (r: any) => void;
  onClickAdd?:()=>void
  onClickSend?:(e:any)=>void
}) {
  const query = useRecipientsInfinite(deliveryMethod);

  const recipients =
    query.data?.pages.flatMap((page) => page) ?? [];

  if (!recipients.length) return null;

  return (
    <Card className="p-3 sm:p-4 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
  <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Send Again
            </h3>
            <button    
              onClick={() => onClickAdd()}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              New Recipient
            </button>
          </div>
 <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        Select from your recent transfers
      </p>
      <InfiniteScrollList
        items={recipients}
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        renderItem={(recipient) => (
          <button
            key={recipient.id}
            onClick={() => onSelect(recipient)}
                 className="shrink-0 w-35 sm:w-40 p-3 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all group active:scale-95"
              >
           <div className="flex flex-col items-center text-center gap-2">
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
                <div className="w-full">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate mb-0.5">{recipient.name}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mb-1">{recipient.type}</p>
                    <div onClick={()=>onClickSend(recipient)} className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </div>
                  </div>
              </div>
            </div>
          </button>
        )}
      />
    </Card>
  );
}
