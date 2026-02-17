import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card"; // adjust path
import { User } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
// import axios from "axios";
import api from "@/lib/axios";

interface Recipient {
  id: string;
  full_name: string;
  method: "bank" | "mobile_money" | "crypto";
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
  momo_provider?: string;
  momo_number?: string;
  crypto_address?: string;
  lastSent?: string;
  avatar?: string;
  seq_id:string
}

interface RecentRecipientsProps {
  deliveryMethod: "bank" | "mobile_money" | "crypto";
  selected:string,
  onSelect: (recipient: Recipient) => void;
}

const fetchRecipients = async ({
  pageParam = 10,
  method,
}: {
  pageParam?: number;
  method: string | number;
}) => {
  const res = await api.get("/recipients/raw", {
    params: {
      lastId: pageParam,
      limit: 20,
      method,
    },
  });
  // console.log(res.data.data)
  return res.data.data; // assume standardResponse format: { data: [...], meta: {...} }
};

export const RecentRecipients: React.FC<RecentRecipientsProps> = ({
  deliveryMethod,
  onSelect,
  selected
}) => {
  const observerElem = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["recipients", deliveryMethod],
      queryFn: ({ pageParam }) =>
        fetchRecipients({ pageParam, method: deliveryMethod }),
      initialPageParam: null,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        // console.log(allPages[lastPage])
        console.log(lastPage[lastPage.length -1]['seq_id'])
        return lastPage[lastPage.length -1]['seq_id'];
      },
      getPreviousPageParam: (firstPage, allPages, firstPageParam) => {
        if (firstPageParam <= 1) {
          return undefined;
        }
        // console.log(firstPageParam)
        console.log('firstPageParam')

        return firstPageParam - 1;
      },
    });

  const recipients = data?.pages.flatMap((page) => page) || [];

  // Intersection Observer to fetch next page
  useEffect(() => {
    if (!observerElem.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "0px", threshold: 1.0 },
    );

    observer.observe(observerElem.current);

    return () => {
      observer.disconnect();
    };
  }, [observerElem, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (recipients.length === 0) return null;

  return (
    <Card className="p-3 sm:p-4 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
        <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
        Recent Recipients
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        Select from your recent transfers
      </p>
      <div className="space-y-2">
        {recipients.map((recipient) => (
          <button
            key={recipient.id}
            type="button"
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
        ))}
        <div ref={observerElem} />
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Or enter new recipient details below
        </p>
      </div>
    </Card>
  );
};
