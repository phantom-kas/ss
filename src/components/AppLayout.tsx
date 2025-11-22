import { useState, ReactNode, useEffect } from 'react';
import { Star, Bell, Settings, LogOut, User, Menu, X, Home, Send, Receipt, HelpCircle, Zap, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { Page } from '../App';
import logo from 'figma:asset/872c19024a848c86be2cfb9320e9ce2d33228284.png';

interface AppLayoutProps {
  children: ReactNode;
  navigateTo: (page: Page) => void;
  currentPage: Page;
  onLogout: () => void;
}

export function AppLayout({ children, navigateTo, currentPage, onLogout }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize and listen for theme changes
  useEffect(() => {
    const checkDarkMode = () => {
      const theme = localStorage.getItem('theme');
      const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    checkDarkMode();
    
    // Listen for storage changes (from Settings or other tabs)
    const handleStorageChange = () => checkDarkMode();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // Remove dark mode when leaving authenticated pages (going back to landing/auth pages)
      document.documentElement.classList.remove('dark');
    };
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', page: 'dashboard' as Page },
    { id: 'send', label: 'Send Money', page: 'send' as Page },
    { id: 'transactions', label: 'Transactions', page: 'transactions' as Page },
    { id: 'support', label: 'Support', page: 'support' as Page },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => navigateTo('dashboard')} className="flex items-center gap-2">
              <img src={logo} alt="StableSend" className="h-9" />
            </button>
            
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.page)}
                  className={`text-sm transition-colors ${
                    currentPage === item.page
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => navigateTo('notifications')}
                className="relative p-2 text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-semibold">JD</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigateTo('settings')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar - Minimal */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="flex justify-between items-center h-14 px-4">
          <button onClick={() => navigateTo('dashboard')} className="flex items-center gap-2">
            <img src={logo} alt="StableSend" className="h-8" />
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateTo('notifications')}
              className="relative p-2 text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-700 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button onClick={() => navigateTo('settings')} className="p-1">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-semibold">JD</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {children}

      {/* Mobile Bottom Navigation - iOS Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 z-40 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => navigateTo('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
              currentPage === 'dashboard' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <div className={`transition-all ${currentPage === 'dashboard' ? 'scale-110' : ''}`}>
              <Home className={`w-6 h-6 ${currentPage === 'dashboard' ? 'fill-blue-600' : ''}`} />
            </div>
            <span className={`text-[10px] font-medium ${currentPage === 'dashboard' ? 'font-semibold' : ''}`}>Home</span>
          </button>
          
          <button
            onClick={() => navigateTo('send')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
              currentPage === 'send' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <div className={`transition-all ${currentPage === 'send' ? 'scale-110' : ''}`}>
              <Send className={`w-6 h-6 ${currentPage === 'send' ? 'fill-blue-600' : ''}`} />
            </div>
            <span className={`text-[10px] font-medium ${currentPage === 'send' ? 'font-semibold' : ''}`}>Send</span>
          </button>
          
          <button
            onClick={() => navigateTo('transactions')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
              currentPage === 'transactions' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <div className={`transition-all ${currentPage === 'transactions' ? 'scale-110' : ''}`}>
              <Receipt className={`w-6 h-6 ${currentPage === 'transactions' ? 'fill-blue-600' : ''}`} />
            </div>
            <span className={`text-[10px] font-medium ${currentPage === 'transactions' ? 'font-semibold' : ''}`}>Activity</span>
          </button>
          
          <button
            onClick={() => navigateTo('settings')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
              currentPage === 'settings' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <div className={`transition-all ${currentPage === 'settings' ? 'scale-110' : ''}`}>
              <Settings className={`w-6 h-6 ${currentPage === 'settings' ? 'fill-blue-600' : ''}`} />
            </div>
            <span className={`text-[10px] font-medium ${currentPage === 'settings' ? 'font-semibold' : ''}`}>More</span>
          </button>
        </div>
      </div>
    </div>
  );
}