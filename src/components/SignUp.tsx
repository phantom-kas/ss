import { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Mail, Lock, User, Globe, Zap, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import type { Page } from '../App';
import logo from 'figma:asset/872c19024a848c86be2cfb9320e9ce2d33228284.png';
import { toast } from 'sonner';
import axios from 'axios';
import { LoadingButton } from './Elements/Button';
import api from '@/lib/axios';
import { showApiError } from '@/lib/error';
import { Link } from '@tanstack/react-router';
// import {toast} from ''
interface SignUpProps {
  navigateTo: (page: Page) => void;
  onSignUp: () => void;
}



export function SignUp({ navigateTo, onSignUp }: SignUpProps) {
  const [loading , setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Initialize dark mode from localStorage
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    checkDarkMode();
    
    // Listen for storage changes
    const handleStorageChange = () => checkDarkMode();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSubmit =async (e: React.SubmitEvent) => {
    e.preventDefault();
  setLoading(true)

   await api.post('/auth/register',{first_name:formData.firstName,last_name:formData.lastName,email:formData.email ,password:formData.password}).then(res=>{

    toast.success('Signup successful')
    }).finally(()=>{setLoading(false)}).catch(e=>{showApiError(e)})
    // toast.success('success')
    // onSignUp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-emerald-50/30 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Back Button */}
      <button
        onClick={() => navigateTo('landing')}
        className="absolute top-4 left-4 p-2 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      <Card className="w-full max-w-md p-5 shadow-xl dark:bg-slate-800 dark:border-slate-700">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <img src={logo} alt="StableSend" className="h-11 sm:h-12" />
          </div>
          <h2 className="text-slate-900 dark:text-white mb-1">Create Your Account</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Start sending money to Ghana in minutes</p>
        </div>

        {/* Social Sign Up */}
        <div className="mb-3">
          <Button variant="outline" className="w-full h-9 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600" type="button">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        <div className="relative mb-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or with email</span>
          </div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs dark:text-slate-300">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                className="h-8 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs dark:text-slate-300">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="h-8 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs dark:text-slate-300">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="pl-8 h-8 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs dark:text-slate-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-8 pr-8 h-8 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormData({ ...formData, password: e.target.value });
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Must be at least 8 characters</p>
          </div>

          <LoadingButton isLoading={loading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 h-9 text-sm">
            Create Account
          </LoadingButton>
        </form>

        <p className="text-center text-slate-600 dark:text-slate-400 text-xs mt-3">
          Already have an account?{' '}
          <Link to='/signin' onClick={() => navigateTo('signin')} className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-3">
          By signing up, you agree to our Terms & Privacy Policy
        </p>
      </Card>
    </div>
  );
}