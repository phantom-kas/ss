import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { InfiniteList } from '@/components/InfiniteList';
import api from '@/lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

interface Transaction {
  seqId:         number;
  remittanceId:  string;
  status:        string;
  payout: {
    status:   string;
    ref:      string | null;
    provider: string | null;
    at:       string | null;
  };
  amount: {
    usd:           number;
    ghs:           number;
    cents:         number;
    rate:          number;
    finalRate:     number | null;
    spreadPercent: number | null;
  };
  recipient: {
    id:       string;
    name:     string;
    method:   string;
    momo:     string | null;
    provider: string | null;
    bank:     string | null;
    account:  string | null;
    currency: string;
  };
  bankUsed: {
    guid:        string;
    institution: string | null;
    name:        string | null;
    mask:        string | null;
    subtype:     string | null;
  };
  transferId:     string;
  transferStatus: string;
  createdAt:      string;
}

// ── Fetcher ────────────────────────────────────────────────────────────────

function makeFetcher(status: string, search: string) {
  return async ({ lastId }: { lastId: number | string | null }): Promise<Transaction[]> => {
    const params: Record<string, any> = { limit: 20 };
    if (lastId)           params.lastId  = lastId;
    if (status !== 'all') params.status  = status;
    if (search)           params.search  = search;
    const res = await api.get('/transactions', { params });
    return res.data.data ?? [];
  };
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { dot: string; text: string; bg: string }> = {
    completed: {
      dot:  'bg-emerald-500 dark:bg-emerald-400',
      text: 'text-emerald-700 dark:text-emerald-400',
      bg:   'bg-emerald-50 dark:bg-emerald-900/30',
    },
    pending: {
      dot:  'bg-yellow-500 dark:bg-yellow-400',
      text: 'text-yellow-700 dark:text-yellow-400',
      bg:   'bg-yellow-50 dark:bg-yellow-900/30',
    },
    processing: {
      dot:  'bg-blue-500 dark:bg-blue-400',
      text: 'text-blue-700 dark:text-blue-400',
      bg:   'bg-blue-50 dark:bg-blue-900/30',
    },
    failed: {
      dot:  'bg-red-500 dark:bg-red-400',
      text: 'text-red-700 dark:text-red-400',
      bg:   'bg-red-50 dark:bg-red-900/30',
    },
  };

  const s = map[status] ?? map.pending;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 ${s.bg} rounded-full`}>
      <div className={`w-1.5 h-1.5 ${s.dot} rounded-full`} />
      <span className={`text-xs font-medium ${s.text} capitalize`}>{status}</span>
    </div>
  );
}

// ── Transaction card ───────────────────────────────────────────────────────

function TransactionCard({
  tx,
  onClick,
}: {
  tx: Transaction;
  onClick: () => void;
}) {
  const initials = tx.recipient.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const date = new Date(tx.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const methodLabel =
    tx.recipient.method === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer';

  return (
    <Card
      onClick={onClick}
      className="p-4 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-50 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {tx.recipient.name}
            </p>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-slate-900 dark:text-white">
                -${tx.amount.usd.toFixed(2)}
              </p>
              {tx.status === 'completed' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  +₵{tx.amount.ghs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{methodLabel}</p>

          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={tx.payout.status ?? tx.status} />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {dateStr} • {timeStr}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export function Transactions() {
  const navigate      = useNavigate();
  const [search, setSearch]     = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Debounce search so we don't fire a query on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  }

  const tabs = [
    { key: 'all',        label: 'All' },
    { key: 'completed',  label: 'Completed' },
    { key: 'processing', label: 'Processing' },
    { key: 'pending',    label: 'Pending' },
    { key: 'failed',     label: 'Failed' },
  ];

  const tabColors: Record<string, string> = {
    all:        'bg-blue-600 dark:bg-blue-700',
    completed:  'bg-emerald-600 dark:bg-emerald-700',
    processing: 'bg-blue-500 dark:bg-blue-600',
    pending:    'bg-yellow-600 dark:bg-yellow-700',
    failed:     'bg-red-600 dark:bg-red-700',
  };

  return (
    <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Activity
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Your transaction history</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search transactions..."
            className="pl-10 h-11 text-base bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? `${tabColors[tab.key]} text-white`
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <InfiniteList<Transaction>
        queryKey={['transactions', activeTab, debouncedSearch]}
        fetcher={makeFetcher(activeTab, debouncedSearch)}
        cursorKey="seqId"
        renderItem={(tx) => (
          <TransactionCard
            key={tx.remittanceId}
            tx={tx}
            onClick={() =>
              navigate({
                to: '/transactions/$transactionId',
                params: { transactionId: tx.remittanceId },
              })
            }
          />
        )}
        emptyState={
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">
              No transactions found
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search or filters
            </p>
          </div>
        }
      />
    </main>
  );
}

// missing import
import { useRef } from 'react';