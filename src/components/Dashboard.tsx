import { useState } from 'react';
import { Star, Send, Plus, CreditCard, TrendingUp, Bell, Settings, LogOut, User, Menu, X, Home, Receipt, HelpCircle, Sparkles, Gift, ArrowRight, Zap, Clock, ArrowUpRight, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface DashboardProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
}

export function Dashboard({ navigateTo, onLogout }: DashboardProps) {
  const recentTransfers = [
    { id: '1', recipient: 'Kwame Mensah', amount: 500, status: 'completed', date: '2h ago' },
    { id: '2', recipient: 'Ama Owusu', amount: 750, status: 'completed', date: '1d ago' },
    { id: '3', recipient: 'Kofi Asante', amount: 300, status: 'pending', date: '2d ago' },
  ];

  // Recent recipients data (same as in SendMoney component)
  const recentRecipients = [
    {
      id: '1',
      name: 'Kwame Mensah',
      phone: '+233 24 567 8901',
      deliveryMethod: 'mobile',
      lastSent: '2 days ago',
      avatar: 'KM',
      type: 'Mobile Money'
    },
    {
      id: '2',
      name: 'Abena Osei',
      phone: '+233 55 123 4567',
      deliveryMethod: 'mobile',
      lastSent: '1 week ago',
      avatar: 'AO',
      type: 'Mobile Money'
    },
    {
      id: '3',
      name: 'Kofi Asante',
      bank: 'GCB Bank',
      account: '1234567890',
      deliveryMethod: 'bank',
      lastSent: '2 weeks ago',
      avatar: 'KA',
      type: 'Bank Transfer'
    },
    {
      id: '4',
      name: 'Ama Owusu',
      phone: '+233 20 987 6543',
      deliveryMethod: 'mobile',
      lastSent: '3 weeks ago',
      avatar: 'AO',
      type: 'Mobile Money'
    },
  ];

  return (
    <AppLayout navigateTo={navigateTo} currentPage="dashboard" onLogout={onLogout}>
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">Hi, John 👋</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Send money to Ghana instantly</p>
        </div>

        {/* Quick Actions Card */}
        <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white border-0 shadow-lg mb-3">
          <p className="text-xs text-blue-100 mb-2">Quick Actions</p>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigateTo('send')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors active:scale-95"
            >
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium">Send Money</span>
            </button>
            <button 
              onClick={() => navigateTo('payment-methods')}
              className="flex flex-col items-center gap-1.5 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-colors active:scale-95"
            >
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium">Add Payment Method</span>
            </button>
          </div>
        </Card>

        {/* Exchange Rate Comparison */}
        <Card className="p-4 mb-3 sm:mb-4 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 fill-white" />
            <p className="text-xs font-semibold text-white">StableSend Exchange Rate 🇬🇭</p>
          </div>
          
          {/* StableSend Rate */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Our Rate</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-[10px] text-emerald-100">Live</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-4xl font-bold">₵11.25</span>
              <span className="text-sm text-emerald-100">per USD</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-100">
              <span>1 USD = 11.25 GHS</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">StableSend Rate</span>
            </div>
          </div>
        </Card>

        {/* Recent Recipients */}
        <Card className="p-3 sm:p-4 dark:bg-slate-800 dark:border-slate-700 mb-3 sm:mb-4">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Send Again
            </h3>
            <button
              onClick={() => navigateTo('send')}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              New Recipient
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Quick send to your recent recipients</p>
          
          {/* Horizontal scrollable recipients */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {recentRecipients.map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => navigateTo('send', {
                  deliveryMethod: recipient.deliveryMethod,
                  recipientName: recipient.name,
                  recipientPhone: recipient.phone,
                  recipientBank: recipient.bank,
                  recipientAccount: recipient.account,
                })}
                className="flex-shrink-0 w-[140px] sm:w-[160px] p-3 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all group active:scale-95"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {recipient.avatar}
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate mb-0.5">{recipient.name}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mb-1">{recipient.type}</p>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </main>
    </AppLayout>
  );
}