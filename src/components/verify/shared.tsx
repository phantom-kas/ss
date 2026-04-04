/**
 * components/verify/shared.tsx
 *
 * Reusable UI primitives for the verify flow.
 * Same philosophy as FormInput — thin wrappers that cut repeated markup.
 */

import * as React from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

// ── VerifyHeader ──────────────────────────────────────────────

export function VerifyHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

// ── VerifyLoader ──────────────────────────────────────────────

export function VerifyLoader({ message = 'Checking your account status...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
}

// ── VerifyError ───────────────────────────────────────────────

export function VerifyError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-sm">{message}</p>
      <Button
        onClick={onRetry ?? (() => window.location.reload())}
        className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 px-8"
      >
        Try Again
      </Button>
    </div>
  );
}

// ── StatusBanner ──────────────────────────────────────────────

type BannerVariant = 'warning' | 'error' | 'success' | 'info';

const BANNER_CARD: Record<BannerVariant, string> = {
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  error:   'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
  info:    'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
};

const BANNER_TITLE: Record<BannerVariant, string> = {
  warning: 'text-amber-900 dark:text-amber-200',
  error:   'text-red-900 dark:text-red-200',
  success: 'text-emerald-900 dark:text-emerald-200',
  info:    'text-blue-900 dark:text-blue-200',
};

const BANNER_MSG: Record<BannerVariant, string> = {
  warning: 'text-amber-700 dark:text-amber-300',
  error:   'text-red-700 dark:text-red-300',
  success: 'text-emerald-700 dark:text-emerald-300',
  info:    'text-blue-700 dark:text-blue-300',
};

const BANNER_ICON: Record<BannerVariant, string> = {
  warning: 'text-amber-600',
  error:   'text-red-600',
  success: 'text-emerald-600',
  info:    'text-blue-600',
};

export function StatusBanner({
  variant,
  title,
  message,
  icon,
  spinner = false,
}: {
  variant:  BannerVariant;
  title:    string;
  message?: string;
  icon?:    React.ReactNode;
  spinner?: boolean;
}) {
  const defaultIcon = spinner
    ? <Loader2 className={cn('w-5 h-5 flex-shrink-0 animate-spin', BANNER_ICON[variant])} />
    : variant === 'success'
      ? <CheckCircle2 className={cn('w-5 h-5 flex-shrink-0', BANNER_ICON[variant])} />
      : <AlertCircle className={cn('w-5 h-5 flex-shrink-0', BANNER_ICON[variant])} />;

  return (
    <Card className={cn('p-4', BANNER_CARD[variant])}>
      <div className="flex items-start gap-3">
        {icon ?? defaultIcon}
        <div>
          <p className={cn('text-sm font-semibold', BANNER_TITLE[variant])}>{title}</p>
          {message && <p className={cn('text-xs mt-0.5', BANNER_MSG[variant])}>{message}</p>}
        </div>
      </div>
    </Card>
  );
}

// ── VerifyingSpinner ──────────────────────────────────────────

export function VerifyingSpinner({
  title   = 'Verifying Your Bank Account',
  message = 'Confirming your bank account. This usually takes just a moment...',
}: {
  title?:   string;
  message?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-sm">{message}</p>
    </motion.div>
  );
}