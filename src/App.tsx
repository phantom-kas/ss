import { createRouter, RouterProvider, createRootRoute, createRoute } from '@tanstack/react-router';
import { LandingPage } from './components/LandingPage';
import { SignUp } from './components/SignUp';
import { SignIn } from './components/SignIn';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { SendMoney } from './components/SendMoney';
import { Transactions } from './components/Transactions';
import { TransactionDetail } from './components/TransactionDetail';
import { Settings } from './components/Settings';
import { PersonalInfo } from './components/PersonalInfo';
import { Security } from './components/Security';
import { PaymentMethods } from './components/PaymentMethods';
import { Notifications } from './components/Notifications';
import { Support } from './components/Support';
import { AppLayout } from './components/AppLayout';
import { Toaster } from "@/components/ui/sonner"
// Root route
const rootRoute = createRootRoute({
  component: () => <div id="app-root"><RouterOutlet /></div>,
});

// Import RouterOutlet
import { Outlet as RouterOutlet } from '@tanstack/react-router';

// Update root route with Outlet
const rootRouteFixed = createRootRoute({
  component: RouterOutlet,
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => rootRouteFixed,
  path: '/',
  component: LandingPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRouteFixed,
  path: '/signup',
  component: () => {
    const navigate = useNavigate();
    const handleSignUp = () => {
      localStorage.setItem('isAuthenticated', 'true');
      navigate({ to: '/onboarding' });
    };
    return <SignUp onSignUp={handleSignUp} />;
  },
});

const signinRoute = createRoute({
  getParentRoute: () => rootRouteFixed,
  path: '/signin',
  component: () => {
    const navigate = useNavigate();
    const handleSignIn = () => {
      localStorage.setItem('isAuthenticated', 'true');
      navigate({ to: '/onboarding' });
    };
    return <SignIn onSignIn={handleSignIn} />;
  },
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRouteFixed,
  path: '/onboarding',
  component: () => {
    const navigate = useNavigate();
    const handleComplete = () => {
      navigate({ to: '/dashboard' });
    };
    return <Onboarding onComplete={handleComplete} />;
  },
});

// Auth layout route
import { redirect, useNavigate, Outlet } from '@tanstack/react-router';

const authRoute = createRoute({
  getParentRoute: () => rootRouteFixed,
  id: '_auth',
  beforeLoad: async () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      throw redirect({ to: '/signin' });
    }
  },
  component: () => {
    const navigate = useNavigate();
    const currentPath = window.location.pathname;

    const getPageFromPath = (path: string) => {
      if (path.includes('/dashboard')) return 'dashboard';
      if (path.includes('/send')) return 'send';
      if (path.includes('/transactions')) return 'transactions';
      if (path.includes('/settings/personal-info')) return 'personal-info';
      if (path.includes('/settings/security')) return 'security';
      if (path.includes('/settings/payment-methods')) return 'payment-methods';
      if (path.includes('/settings')) return 'settings';
      if (path.includes('/notifications')) return 'notifications';
      if (path.includes('/support')) return 'support';
      return 'dashboard';
    };

    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };

    return (
      <AppLayout
        navigateTo={(page) => {
          const pathMap: Record<string, string> = {
            'dashboard': '/dashboard',
            'send': '/send',
            'transactions': '/transactions',
            'transaction-detail': '/transactions',
            'settings': '/settings',
            'personal-info': '/settings/personal-info',
            'security': '/settings/security',
            'payment-methods': '/settings/payment-methods',
            'notifications': '/notifications',
            'support': '/support',
          };
          navigate({ to: pathMap[page] || '/dashboard' });
        }}
        currentPage={getPageFromPath(currentPath) as any}
        onLogout={handleLogout}
      >
        <Outlet />
      </AppLayout>
    );
  },
});

// Protected routes
const dashboardRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/dashboard',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string, data?: any) => {
      if (page === 'send') {
        navigate({ to: '/send' });
      } else if (page === 'transactions') {
        navigate({ to: '/transactions' });
      } else if (page === 'settings') {
        navigate({ to: '/settings' });
      } else if (page === 'support') {
        navigate({ to: '/support' });
      } else if (page === 'notifications') {
        navigate({ to: '/notifications' });
      } else if (page === 'transaction-detail' && data?.id) {
        navigate({ to: `/transactions/${data.id}` });
      }
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <Dashboard navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

const sendRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/send',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'dashboard') navigate({ to: '/dashboard' });
      else if (page === 'transactions') navigate({ to: '/transactions' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <SendMoney navigateTo={handleNavigate} onLogout={handleLogout} prefilledRecipient={null} />;
  },
});

const transactionsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/transactions',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string, data?: any) => {
      if (page === 'dashboard') navigate({ to: '/dashboard' });
      else if (page === 'send') navigate({ to: '/send' });
      else if (page === 'transaction-detail' && data?.id) {
        navigate({ to: `/transactions/${data.id}` });
      }
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <Transactions navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

const transactionDetailRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/transactions/$transactionId',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'transactions') navigate({ to: '/transactions' });
      else if (page === 'dashboard') navigate({ to: '/dashboard' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <TransactionDetail navigateTo={handleNavigate} onLogout={handleLogout} transaction={null} />;
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/settings',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'dashboard') navigate({ to: '/dashboard' });
      else if (page === 'personal-info') navigate({ to: '/settings/personal-info' });
      else if (page === 'security') navigate({ to: '/settings/security' });
      else if (page === 'payment-methods') navigate({ to: '/settings/payment-methods' });
      else if (page === 'notifications') navigate({ to: '/notifications' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <Settings navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

const personalInfoRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/settings/personal-info',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'settings') navigate({ to: '/settings' });
      else if (page === 'dashboard') navigate({ to: '/dashboard' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <PersonalInfo navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

const securityRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/settings/security',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'settings') navigate({ to: '/settings' });
      else if (page === 'dashboard') navigate({ to: '/dashboard' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <Security navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

const paymentMethodsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/settings/payment-methods',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'settings') navigate({ to: '/settings' });
      else if (page === 'dashboard') navigate({ to: '/dashboard' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <PaymentMethods navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

const notificationsRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/notifications',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'dashboard') navigate({ to: '/dashboard' });
      else if (page === 'settings') navigate({ to: '/settings' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <Notifications navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

const supportRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/support',
  component: () => {
    const navigate = useNavigate();
    const handleNavigate = (page: string) => {
      if (page === 'dashboard') navigate({ to: '/dashboard' });
      else if (page === 'settings') navigate({ to: '/settings' });
    };
    const handleLogout = () => {
      localStorage.removeItem('isAuthenticated');
      navigate({ to: '/' });
    };
    return <Support navigateTo={handleNavigate} onLogout={handleLogout} />;
  },
});

// Create route tree
const routeTree = rootRouteFixed.addChildren([
  indexRoute,
  signupRoute,
  signinRoute,
  onboardingRoute,
  authRoute.addChildren([
    dashboardRoute,
    sendRoute,
    transactionsRoute,
    transactionDetailRoute,
    settingsRoute,
    personalInfoRoute,
    securityRoute,
    paymentMethodsRoute,
    notificationsRoute,
    supportRoute,
  ]),
]);

// Create router
const router = createRouter({ routeTree });

// Register types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <><RouterProvider router={router} />
  <AppToaster/></> 
}


export function AppToaster() {
  return (
    <Toaster
      richColors
      // duration={400000}
      toastOptions={{
        classNames: {
          toast: "rounded-2xl shadow-md px-4 py-2 text-sm",
          title: "font-bold text-base",
          description: "text-sm text-muted-foreground",
          success: "bg-green-600 text-white border border-green-700",
          error: "bg-red-600 text-white border border-red-700",
          info: "bg-blue-600 text-white border border-blue-700",
          warning: "bg-yellow-500 text-black border border-yellow-600",
          icon: "mr-2",
          closeButton: "text-white hover:text-gray-200",
        },
        // duration: 400000,
        closeButton: true,
      }}
    />
  );
}