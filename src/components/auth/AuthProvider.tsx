'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthManager, OwnerSession } from '@/lib/auth';

interface AuthContextType {
  session: OwnerSession | null;
  isLoading: boolean;
  login: (identifier: string, secret: string) => boolean;
  quickUnlock: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  login: () => false,
  quickUnlock: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<OwnerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentSession = AuthManager.getSession();
    setSession(currentSession);
    setIsLoading(false);

    // Protection rule: if not authenticated and not on login page, redirect to login
    if (!currentSession && pathname !== '/login') {
      router.push('/login');
    } else if (currentSession && pathname === '/login') {
      // If already authenticated and on login page, redirect to main dashboard
      router.push('/');
    }
  }, [pathname, router]);

  const login = (identifier: string, secret: string) => {
    const success = AuthManager.login(identifier, secret);
    if (success) {
      const newSession = AuthManager.getSession();
      setSession(newSession);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.push('/');
      }
    }
    return success;
  };

  const quickUnlock = () => {
    const newSession = AuthManager.quickUnlock();
    setSession(newSession);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    } else {
      router.push('/');
    }
  };

  const logout = () => {
    AuthManager.logout();
    setSession(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, quickUnlock, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
