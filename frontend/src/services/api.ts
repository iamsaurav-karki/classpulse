import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const isLoginPage = currentPath.includes('/auth/login');
          const isRegisterPage = currentPath.includes('/auth/register');
          const isHomePage = currentPath === '/';
          
          // Don't redirect if already on auth pages or home page
          if (isLoginPage || isRegisterPage || isHomePage) {
            return Promise.reject(error);
          }
          
          // Check if token exists - if it does, it might be expired
          // If no token, user was never logged in, so don't redirect
          const token = this.getToken();
          if (!token) {
            return Promise.reject(error);
          }
          
          // Token exists but got 401 - likely expired or invalid
          // Clear token and redirect to login
          this.clearToken();
          
          if (typeof window !== 'undefined') {
            // Use a small delay to avoid race conditions during page load
            setTimeout(() => {
              // Only redirect if we're still not on login page (avoid double redirect)
              if (!window.location.pathname.includes('/auth/login')) {
                window.location.href = '/auth/login';
              }
            }, 100);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  clearAuth(): void {
    this.clearToken();
  }

  get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  // For file uploads
  postFormData<T>(url: string, formData: FormData, config?: any) {
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

