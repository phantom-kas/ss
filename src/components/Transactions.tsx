import { useState } from 'react';
import { Star, ArrowLeft, Download, Search, Filter, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface TransactionsProps {
  navigateTo: (page: Page, transaction?: any) => void;
  onLogout: () => void;
}

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

export function Transactions({ navigateTo, onLogout }: TransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const transactions: Transaction[] = [
    {
      id: 'SS50724816',
      recipient: 'Kwame Mensah',
      country: 'Ghana 🇬🇭',
      amount: 500,
      receivedAmount: 6225,
      currency: 'GHS',
      status: 'completed',
      date: 'Nov 10',
      time: '2:30 PM',
      method: 'Mobile Money',
      recipientPhone: '+233 24 123 4567',
      fee: 2.50,
      exchangeRate: 12.45,
      paymentMethod: 'Credit/Debit Card',
    },
    {
      id: 'SS50724815',
      recipient: 'Ama Owusu',
      country: 'Ghana 🇬🇭',
      amount: 750,
      receivedAmount: 9337,
      currency: 'GHS',
      status: 'completed',
      date: 'Nov 9',
      time: '10:15 AM',
      method: 'Bank Transfer',
      recipientBank: 'GCB Bank',
      recipientAccount: '1234567890',
      fee: 3.75,
      exchangeRate: 12.45,
      paymentMethod: 'Bank Account',
    },
    {
      id: 'SS50724814',
      recipient: 'Kofi Asante',
      country: 'Ghana 🇬🇭',
      amount: 300,
      receivedAmount: 3735,
      currency: 'GHS',
      status: 'pending',
      date: 'Nov 8',
      time: '4:45 PM',
      method: 'Mobile Money',
      recipientPhone: '+233 20 987 6543',
      fee: 1.50,
      exchangeRate: 12.45,
      paymentMethod: 'Credit/Debit Card',
    },
    {
      id: 'SS50724813',
      recipient: 'Yaa Boateng',
      country: 'Ghana 🇬🇭',
      amount: 1200,
      receivedAmount: 14940,
      currency: 'GHS',
      status: 'completed',
      date: 'Nov 7',
      time: '11:20 AM',
      method: 'Mobile Money',
      recipientPhone: '+233 24 555 8888',
      fee: 6.00,
      exchangeRate: 11.25,
      paymentMethod: 'Debit Card',
    },
    {
      id: 'SS50724812',
      recipient: 'Kwesi Ampofo',
      country: 'Ghana 🇬🇭',
      amount: 450,
      receivedAmount: 5602,
      currency: 'GHS',
      status: 'completed',
      date: 'Nov 6',
      time: '3:10 PM',
      method: 'Mobile Money',
      recipientPhone: '+233 50 321 7654',
      fee: 2.25,
      exchangeRate: 12.45,
      paymentMethod: 'Bank Account',
    },
  ];

  const filterTransactions = (status?: string) => {
    let filtered = transactions;
    
    if (status && status !== 'all') {
      filtered = filtered.filter(t => t.status === status);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(
        t =>
          t.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Completed</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-900/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Pending</span>
          </div>
        );
    }
  };

  const stats = {
    all: transactions.length,
    completed: transactions.filter(t => t.status === 'completed').length,
    pending: transactions.filter(t => t.status === 'pending').length,
  };

  return (
    <AppLayout navigateTo={navigateTo} currentPage="transactions" onLogout={onLogout}>
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
        {/* Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Activity</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Your transaction history</p>
        </div>

        {/* Search - Mobile Optimized */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 h-11 text-base bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All ({stats.all})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 dark:bg-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Completed ({stats.completed})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === 'pending'
                  ? 'bg-yellow-600 dark:bg-yellow-700 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Pending ({stats.pending})
            </button>
          </div>
        </div>

        {/* Transactions List - Mobile Optimized */}
        <div className="space-y-2 sm:space-y-3">
          {filterTransactions(activeTab).map((transaction) => (
            <Card
              key={transaction.id}
              onClick={() => navigateTo('transaction-detail', transaction)}
              className="p-4 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-50 dark:active:bg-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
                      {transaction.recipient.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{transaction.recipient}</p>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-slate-900 dark:text-white">-${transaction.amount}</p>
                        {transaction.status === 'completed' && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+₵{transaction.receivedAmount.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{transaction.method}</p>
                    <div className="flex items-center justify-between gap-2">
                      {getStatusBadge(transaction.status)}
                      <p className="text-xs text-slate-400 dark:text-slate-500">{transaction.date} • {transaction.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filterTransactions(activeTab).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">No transactions found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
    </AppLayout>
  );
}