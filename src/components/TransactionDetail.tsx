import { ArrowLeft, CheckCircle2, Clock, Hash, Download, Share2, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface Transaction {
  id: string;
  recipient: string;
  country: string;
  amount: number;
  receivedAmount: number;
  currency: string;
  status: string;
  date: string;
  time: string;
  method: string;
  recipientPhone?: string;
  recipientBank?: string;
  recipientAccount?: string;
  fee?: number;
  exchangeRate?: number;
  paymentMethod?: string;
}

interface TransactionDetailProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
  transaction: Transaction | null;
}

export function TransactionDetail({ navigateTo, onLogout, transaction }: TransactionDetailProps) {
  if (!transaction) {
    navigateTo('transactions');
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Completed</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Processing</span>
          </div>
        );
    }
  };

  return (
    <AppLayout navigateTo={navigateTo} currentPage="transactions" onLogout={onLogout}>
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4 pb-20 md:pb-6">
        {/* Compact Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => navigateTo('transactions')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Details</h1>
          </div>
          {getStatusBadge(transaction.status)}
        </div>

        {/* Compact Amount Card */}
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white mb-3 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-emerald-100 mb-1">You Sent</div>
              <div className="text-2xl font-bold">${transaction.amount}</div>
            </div>
            <div className="text-4xl">→</div>
            <div className="text-right">
              <div className="text-xs text-emerald-100 mb-1">They Got</div>
              <div className="text-2xl font-bold">₵{transaction.receivedAmount.toLocaleString()}</div>
            </div>
          </div>
          <div className="h-px bg-white/20 mb-2"></div>
          <div className="grid grid-cols-3 gap-2 text-xs text-emerald-100">
            <div>
              <div className="text-[10px] mb-0.5">Rate</div>
              <div className="text-white font-semibold">₵{transaction.exchangeRate}</div>
            </div>
            <div>
              <div className="text-[10px] mb-0.5">Fee</div>
              <div className="text-white font-semibold">${transaction.fee}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] mb-0.5">Total</div>
              <div className="text-white font-bold">${(transaction.amount + (transaction.fee || 0)).toFixed(2)}</div>
            </div>
          </div>
        </Card>

        {/* Two Column Layout for Info */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Recipient */}
          <Card className="p-3 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Recipient
            </h3>
            <div className="space-y-1.5 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Name</div>
                <div className="text-slate-900 dark:text-white font-semibold leading-tight">{transaction.recipient}</div>
              </div>
              {transaction.recipientPhone && (
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Mobile</div>
                  <div className="text-slate-900 dark:text-white font-mono text-[10px] leading-tight">{transaction.recipientPhone}</div>
                </div>
              )}
              {transaction.recipientBank && (
                <>
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Bank</div>
                    <div className="text-slate-900 dark:text-white font-semibold text-[10px] leading-tight">{transaction.recipientBank}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Account</div>
                    <div className="text-slate-900 dark:text-white font-mono text-[10px] leading-tight">{transaction.recipientAccount}</div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Delivery */}
          <Card className="p-3 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Delivery</h3>
            <div className="space-y-1.5 text-xs">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Method</div>
                <div className="text-slate-900 dark:text-white font-semibold leading-tight">{transaction.method}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Destination</div>
                <div className="text-slate-900 dark:text-white font-semibold leading-tight">{transaction.country}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Payment</div>
                <div className="text-slate-900 dark:text-white font-semibold leading-tight">{transaction.paymentMethod}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction ID & Date */}
        <Card className="p-3 mb-3 bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Transaction ID</span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {transaction.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">Completed</span>
            <span className="text-xs text-slate-900 dark:text-white font-semibold">
              {transaction.date} at {transaction.time}
            </span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-10 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => {
              alert('Receipt download feature coming soon!');
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Receipt
          </Button>
          <Button
            variant="outline"
            className="h-10 dark:border-slate-700 dark:hover:bg-slate-800"
            onClick={() => {
              alert('Share feature coming soon!');
            }}
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share
          </Button>
        </div>

        {/* Compact Help */}
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-300">
            Need help? <button onClick={() => navigateTo('support')} className="font-semibold underline">Contact Support</button>
          </p>
        </div>
      </main>
    </AppLayout>
  );
}