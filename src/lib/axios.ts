import axios from 'axios';

// ---------------------------
// Config
// ---------------------------
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL,
  // baseURL: 'http://localhost:3000',
  baseURL: 'https://gc-rest-api.onrender.com',
  withCredentials: true, // send cookies if using them
});

// In-memory store for tokens
let accessToken: string | null = null;
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
  (config) => {
    if (accessToken) {
      config.headers!['Authorization'] = `Bearer ${accessToken}`;
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
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true } // send refresh token if in cookie
        );

        accessToken = data.accessToken;

        // Update original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        accessToken = null; // logout user in frontend
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
export const setAccessToken = (token: string) => {
  accessToken = token;
};
