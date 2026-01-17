import { create } from 'zustand';
import { User } from '@/types/user';
import { authService } from '@/services/auth.service';
import apiClient from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loadAuth: () => void;
  initialize: () => void;
  refreshUser: () => Promise<void>;
}

// Initialize auth state from localStorage - only on client side
const initializeAuth = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (user && token) {
      // Set token in API client immediately
      apiClient.setToken(token);
      return { user, token };
    }
  } catch (error) {
    console.error('Error initializing auth from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  
  return { user: null, token: null };
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize on store creation (client-side only due to window check)
  const initialAuth = initializeAuth();
  
  return {
    user: initialAuth.user,
    token: initialAuth.token,
    isAuthenticated: !!initialAuth.user && !!initialAuth.token,
    isLoading: false,
    isInitialized: !!initialAuth.user && !!initialAuth.token,
    setAuth: (user, token) => {
      set({ user, token, isAuthenticated: true, isLoading: false, isInitialized: true });
      apiClient.setToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      }
    },
    clearAuth: () => {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: false });
      apiClient.clearAuth();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
    loadAuth: () => {
      // Only load if not already initialized and we're on client side
      if (!get().isInitialized && typeof window !== 'undefined') {
        try {
          const user = authService.getCurrentUser();
          const token = authService.getToken();
          if (user && token) {
            set({ user, token, isAuthenticated: true, isLoading: false, isInitialized: true });
            apiClient.setToken(token);
          } else {
            set({ isLoading: false, isInitialized: true });
          }
        } catch (error) {
          console.error('Error loading auth:', error);
          set({ isLoading: false, isInitialized: true });
        }
      }
    },
    initialize: () => {
      // This is called to mark as initialized
      if (!get().isInitialized && typeof window !== 'undefined') {
        const user = authService.getCurrentUser();
        const token = authService.getToken();
        if (user && token) {
          set({ user, token, isAuthenticated: true, isLoading: false, isInitialized: true });
          apiClient.setToken(token);
        } else {
          set({ isInitialized: true });
        }
      }
    },
    refreshUser: async () => {
      // Refresh user data from the backend
      try {
        const token = get().token;
        if (!token) return;
        
        const updatedUser = await authService.getProfile();
        set({ user: updatedUser });
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
        // If refresh fails, user might be logged out or account deactivated
        // Don't clear auth automatically - let the user see the error
      }
    },
  };
});

