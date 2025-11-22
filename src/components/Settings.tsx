import { useState, useEffect } from 'react';
import { User, Shield, Bell, CreditCard, Globe, ChevronRight, Lock, LogOut, HelpCircle, FileText, Share2, Star, Zap, CheckCircle, AlertCircle, Smartphone, Mail, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface SettingsProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
}

export function Settings({ navigateTo, onLogout }: SettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage and DOM
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'dark'; // Default to light mode
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    checkDarkMode();
    
    // Listen for storage changes (in case changed in another tab or component)
    const handleStorageChange = () => checkDarkMode();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  const SettingsItem = ({ icon: Icon, title, subtitle, onClick, rightContent }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 dark:active:bg-slate-700 transition-colors rounded-xl"
    >
      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
      </div>
      {rightContent || <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0" />}
    </button>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2 mt-4 first:mt-0">
      {title}
    </h3>
  );

  return (
    <AppLayout navigateTo={navigateTo} currentPage="settings" onLogout={onLogout}>
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
        {/* Profile Header */}
        <Card className="p-4 mb-4 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl sm:text-2xl font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">John Doe</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">john.doe@example.com</p>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Verified Account</span>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </Card>

        {/* Settings List */}
        <Card className="divide-y divide-slate-100 dark:divide-slate-700 dark:bg-slate-800 dark:border-slate-700">
          <SectionHeader title="Account" />
          
          <SettingsItem
            icon={User}
            title="Personal Information"
            subtitle="Name, email, phone number"
            onClick={() => navigateTo('personal-info')}
          />
          
          <SettingsItem
            icon={Shield}
            title="Security"
            subtitle="Password, 2FA, biometrics"
            onClick={() => navigateTo('security')}
          />
          
          <SettingsItem
            icon={CreditCard}
            title="Payment Methods"
            subtitle="Cards, bank accounts"
            onClick={() => navigateTo('payment-methods')}
          />

          <SectionHeader title="Preferences" />
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-3 p-3 sm:p-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              {isDarkMode ? <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}</p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
          
          <div className="flex items-center gap-3 p-3 sm:p-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Push, email, SMS alerts</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <SettingsItem
            icon={Globe}
            title="Language"
            subtitle="English (US)"
            onClick={() => {}}
          />

          <SectionHeader title="More" />

          <SettingsItem
            icon={Share2}
            title="Refer a Friend"
            subtitle="Earn $10 per referral"
            onClick={() => {}}
            rightContent={
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">$10</span>
              </div>
            }
          />

          <SettingsItem
            icon={HelpCircle}
            title="Help & Support"
            subtitle="FAQs, contact us"
            onClick={() => navigateTo('support')}
          />

          <SettingsItem
            icon={FileText}
            title="Legal"
            subtitle="Terms, privacy policy"
            onClick={() => {}}
          />

          <SettingsItem
            icon={Zap}
            title="About StableSend"
            subtitle="Version 1.0.0"
            onClick={() => {}}
          />

          <SectionHeader title="Session" />

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors rounded-xl"
          >
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Log Out</p>
              <p className="text-xs text-red-500 dark:text-red-400/80">Sign out of your account</p>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </Card>

        {/* Version Info */}
        <div className="text-center mt-6 mb-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">StableSend v1.0.0</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">© 2024 StableSend. All rights reserved.</p>
        </div>
      </main>
    </AppLayout>
  );
}