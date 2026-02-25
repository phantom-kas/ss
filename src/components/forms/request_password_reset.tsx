import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import logo from 'figma:asset/872c19024a848c86be2cfb9320e9ce2d33228284.png';
import { useNavigate } from '@tanstack/react-router';
import api from '@/lib/axios';
import { showError } from '@/lib/error';
import { toast } from 'sonner';
import { LoadingButton } from '../Elements/Button';

interface RequestPasswordResetProps {
  navigateTo: (page: string) => void;
}

export function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigateTo = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      
      setLoading(true);
// alert(window.location.origin)
      // return
      await api.post('/auth/send-passwordreset-email', { email,link:window.location.origin });
      toast.success('Password reset link sent! Check your email.');
      setEmail('');
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 via-emerald-50/30 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Back Button */}
      <button
        onClick={() => navigateTo({to:'/signin'})}
        className="absolute top-4 left-4 p-2 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      <Card className="w-full max-w-md p-6 shadow-xl dark:bg-slate-800 dark:border-slate-700">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <img src={logo} alt="StableSend" className="h-11 sm:h-12" />
          </div>
          <h2 className="text-slate-900 dark:text-white mb-1 text-xl">Reset Your Password</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Enter your email and we’ll send you a link to reset your password.
          </p>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleRequestReset} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm dark:text-slate-300">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="pl-9 h-9 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <LoadingButton
            isLoading={loading}
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 text-sm"
          >
            Send Reset Link
          </LoadingButton>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-4">
          Remembered your password?{' '}
          <Button
            variant="link"
            className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-0"
            onClick={() => navigateTo({to:'/signin'})}
          >
            Sign in
          </Button>
        </p>
      </Card>
    </div>
  );
}