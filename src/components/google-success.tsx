import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import Splash from '@/components/splash';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/auth';
import { showError } from '@/lib/error';


// Wrapper component to handle loader logic
export function SplashWrapper() {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const search = useSearch<{ user?: string }>({from:'/google-success'});
const login = useAuthStore((state) => state.login);
const [run , setRun] = useState(true)
const ran = useRef(false);

useEffect(() => {
  if (ran.current) return; // already ran
  if (!search.user) return;

  const fetchUser = async () => {
    const res = await api.get(`auth/me/${search.user}`);
    if (res.data.status !== 'success') return;

    const { data, accessToken } = res.data;
    login(data, accessToken);

    if (!data.done_onboarding) {
      navigate({ to: '/onboarding' });
      return;
    }

    navigate({ to: '/dashboard' });
  };

  fetchUser();
  ran.current = true; // mark as run
}, [search.user]);

  return <Splash />;
}
