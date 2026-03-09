import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export function OtpInput({ value, onChange, disabled, hasError }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      onChange(value.slice(0, i) + value.slice(i + 1));
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const arr = digits.map((d, idx) => (idx === i ? char : d === ' ' ? '' : d));
    onChange(arr.join('').replace(/ /g, ''));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={i === 0}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          disabled={disabled}
          className={cn(
            'w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none',
            'transition-all duration-150 bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
            'focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError
              ? 'border-red-400 dark:border-red-500'
              : digits[i] && digits[i] !== ' '
              ? 'border-blue-500 dark:border-blue-400 focus:border-blue-500'
              : 'border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400'
          )}
        />
      ))}
    </div>
  );
}