"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthState, User } from '@/types/auth';

interface AuthContextProps extends AuthState {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        const storedAccess = localStorage.getItem('accessToken');
        const storedRefresh = localStorage.getItem('refreshToken');
        if (storedUser && storedAccess && storedRefresh) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsInitialized(true);
      }
    } else {
      // On server side, mark as initialized immediately
      setIsInitialized(true);
    }
  }, []);

  const login = (user: User, accessToken: string, refreshToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isAuthenticated, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 