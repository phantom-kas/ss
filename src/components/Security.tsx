import { useState } from 'react';
import { ArrowLeft, Lock, Shield, Key, Smartphone, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface SecurityProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
}

export function Security({ navigateTo, onLogout }: SecurityProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <AppLayout navigateTo={navigateTo} currentPage="security" onLogout={onLogout}>
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigateTo('settings')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">Security</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Manage your security settings</p>
          </div>
        </div>

        {/* Password */}
        <Card className="p-4 sm:p-6 mb-4 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Password</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                Last changed 3 months ago
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Use a strong password with at least 8 characters, including uppercase, lowercase, and numbers.
              </p>
              <Button className="h-8 text-xs bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-4 sm:p-6 mb-4 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {twoFactorEnabled ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Disabled</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Add an extra layer of security by requiring a verification code when you sign in.
              </p>
              {twoFactorEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-xs text-slate-700 dark:text-slate-300">Authenticator App</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <Button variant="outline" className="w-full h-8 text-xs dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600">
                    View Recovery Codes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Biometric Authentication */}
        <Card className="p-4 sm:p-6 mb-4 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-purple-700 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Biometric Login</h3>
                <Switch
                  checked={biometricsEnabled}
                  onCheckedChange={setBiometricsEnabled}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                {biometricsEnabled ? 'Face ID / Touch ID enabled' : 'Enable Face ID or Touch ID'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use your fingerprint or face recognition to quickly and securely log in.
              </p>
            </div>
          </div>
        </Card>

        {/* Login Alerts */}
        <Card className="p-4 sm:p-6 mb-4 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Key className="w-5 h-5 text-orange-700 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Login Alerts</h3>
                <Switch
                  checked={loginAlerts}
                  onCheckedChange={setLoginAlerts}
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                Get notified when your account is accessed from a new device or location.
              </p>
            </div>
          </div>
        </Card>

        {/* Active Sessions */}
        <Card className="p-4 sm:p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Active Sessions</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Manage devices where you're currently signed in
            </p>
          </div>

          <div className="space-y-3">
            {/* Current Session */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-medium text-slate-900 dark:text-white">iPhone 14 Pro</p>
                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] rounded-full font-medium">
                    Current
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">New York, USA • Safari</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Active now</p>
              </div>
            </div>

            {/* Other Session */}
            <div className="flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-4 h-4 text-slate-700 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 dark:text-white mb-0.5">MacBook Pro</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">New York, USA • Chrome</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Last active 2 hours ago</p>
              </div>
              <Button variant="ghost" className="h-7 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                Revoke
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full h-8 text-xs mt-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600">
            Sign Out All Other Sessions
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}