import { ArrowLeft, CheckCircle2, Bell, DollarSign, AlertCircle, Info, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';
import { useState } from 'react';

interface NotificationsProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
}

export function Notifications({ navigateTo, onLogout }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Transfer Complete',
      message: 'Your transfer of $500 to Kwame Mensah has been successfully delivered.',
      date: 'Today',
      time: '2:30 PM',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Exchange Rate Alert',
      message: 'USD to GHS rate has improved! Now at ₵12.45 per USD.',
      date: 'Today',
      time: '10:15 AM',
      read: false,
    },
    {
      id: '3',
      type: 'success',
      title: 'Payment Method Added',
      message: 'Your new Visa card ending in 4242 has been successfully verified.',
      date: 'Yesterday',
      time: '4:20 PM',
      read: true,
    },
    {
      id: '4',
      type: 'info',
      title: 'Special Promotion',
      message: 'Send $200 or more this week and get zero fees on your next transfer!',
      date: 'Yesterday',
      time: '9:00 AM',
      read: true,
    },
    {
      id: '5',
      type: 'warning',
      title: 'Security Notice',
      message: 'We noticed a login from a new device. If this wasn\'t you, please secure your account.',
      date: '2 days ago',
      time: '6:45 PM',
      read: true,
    },
    {
      id: '6',
      type: 'success',
      title: 'Transfer Received',
      message: 'You received $1,000 from Michael Johnson.',
      date: '3 days ago',
      time: '11:30 AM',
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'warning':
        return 'bg-orange-100 dark:bg-orange-900/30';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  return ( <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="hidden sm:flex dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-700 text-white dark:bg-blue-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-700 text-white dark:bg-blue-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Mark all as read on mobile */}
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="w-full mb-3 sm:hidden dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Mark all as read
          </Button>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center dark:bg-slate-800 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No notifications</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {filter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 sm:p-4 transition-all hover:shadow-md cursor-pointer dark:border-slate-700 ${
                  !notification.read 
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                    : 'dark:bg-slate-800'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-500">
                        {notification.date} • {notification.time}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Notification Settings Link */}
        <Card className="p-4 mt-4 bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">Notification Preferences</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Manage what notifications you receive
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateTo('settings')}
              className="dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Settings
            </Button>
          </div>
        </Card>
      </main>

  );
}
