import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
// ---------------------------
// Config
// ---------------------------
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL,
  // baseURL: 'http://localhost:3001',
  baseURL: 'https://gc-rest-api.onrender.com',
  withCredentials: true, // send cookies if using them
});

// In-memory store for tokens

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

// ---------------------------
// Helper to process queue after refresh
// ---------------------------
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ---------------------------
// Request Interceptor
// ---------------------------
api.interceptors.request.use(
  async (config) => {
    await waitForHydration()
   const token = useAuthStore.getState().token;
console.log('--------- '+token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------
// Response Interceptor
// ---------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url == '/auth/login') {
      // alert('ss')
      return Promise.reject(error);
    }
    // Only try refresh once per request
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        // Queue request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/generate_new_access_token`,
          {},
          { withCredentials: true } // send refresh token if in cookie
        );

       let accessToken = data.data.accessToken;
        // alert(accessToken)
          useAuthStore.setState({ token: accessToken });
        // Update original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
       // accessToken = null; // logout user in frontend
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ---------------------------
// Optional helper to set token manually (after login)
// ---------------------------



const waitForHydration = () => {
  return new Promise<void>((resolve) => {
    const unsub = useAuthStore.subscribe((state) => {
      if (state.hasHydrated) {
        unsub();
        resolve();
      }
    });

    // already hydrated (page navigation case)
    if (useAuthStore.getState().hasHydrated) {
      unsub();
      resolve();
    }
  });
};