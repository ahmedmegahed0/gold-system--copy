import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authorization failures cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    // Check if it's an auth error OR if the user was deleted/archived from DB
    const isAuthError = status === 401;
    const isUserNotFoundError = status === 404 && message === 'المستخدم غير موجود أو تم نقله للأرشيف';

    if (error.response && (isAuthError || isUserNotFoundError)) {
      // Don't redirect for auth endpoints - let the component handle the error
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('gms_user_session');
        sessionStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
