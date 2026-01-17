import apiClient from './api';
import { AuthResponse, User } from '@/types/user';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
  bio?: string;
  subjects?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse; message: string }>(
      '/auth/register',
      data
    );
    // Don't automatically set token or store user - user needs to login separately
    // Just return the response data
    return response.data.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse; message: string }>(
      '/auth/login',
      data
    );
    if (response.data.success && response.data.data.token) {
      apiClient.setToken(response.data.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data.data;
  },

  logout(): void {
    apiClient.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
};

