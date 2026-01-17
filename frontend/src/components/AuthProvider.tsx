'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

/**
 * Client-side auth initialization component
 * Ensures auth state is loaded from localStorage on page refresh
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on client-side mount
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

