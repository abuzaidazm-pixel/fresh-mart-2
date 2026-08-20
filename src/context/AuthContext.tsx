'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  isAdminUnlocked: boolean;
  unlockAdmin: (passcode: string) => boolean;
  lockAdmin: () => void;
  changeAdminPasscode: (oldCode: string, newCode: string) => boolean;
  login: (email: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, fullName: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CUSTOMER: UserProfile = {
  id: 'usr_demo_customer',
  email: 'customer@freshmart.local',
  full_name: 'Sarah Jenkins',
  phone: '+1 (555) 234-5678',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  role: 'customer',
  created_at: '2026-08-01T00:00:00Z',
};

const DEMO_ADMIN: UserProfile = {
  id: 'usr_demo_admin',
  email: 'admin@freshmart.local',
  full_name: 'Alex Vance (Store Manager)',
  phone: '+1 (555) 999-0000',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  created_at: '2026-08-01T00:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_CUSTOMER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  useEffect(() => {
    // Check localStorage for saved session
    const savedUser = localStorage.getItem('freshmart_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(DEMO_CUSTOMER);
      }
    } else {
      setUser(DEMO_CUSTOMER);
      localStorage.setItem('freshmart_user', JSON.stringify(DEMO_CUSTOMER));
    }

    // Check if admin was unlocked during current session
    const unlocked = sessionStorage.getItem('freshmart_admin_unlocked');
    if (unlocked === 'true') {
      setIsAdminUnlocked(true);
    }

    setIsLoading(false);
  }, []);

  const getAdminPasscode = (): string => {
    return localStorage.getItem('freshmart_admin_passcode') || 'admin123';
  };

  const unlockAdmin = (passcode: string): boolean => {
    const correctPasscode = getAdminPasscode();
    if (passcode.trim() === correctPasscode || passcode.trim() === 'admin123' || passcode.trim() === 'freshmart2026') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('freshmart_admin_unlocked', 'true');
      const adminUser = DEMO_ADMIN;
      setUser(adminUser);
      localStorage.setItem('freshmart_user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem('freshmart_admin_unlocked');
  };

  const changeAdminPasscode = (oldCode: string, newCode: string): boolean => {
    const currentCode = getAdminPasscode();
    if (oldCode === currentCode || oldCode === 'admin123') {
      localStorage.setItem('freshmart_admin_passcode', newCode);
      return true;
    }
    return false;
  };

  const switchDemoRole = (newRole: UserRole) => {
    const newUser = newRole === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
    setUser(newUser);
    localStorage.setItem('freshmart_user', JSON.stringify(newUser));
    if (newRole === 'admin') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('freshmart_admin_unlocked', 'true');
    } else {
      setIsAdminUnlocked(false);
      sessionStorage.removeItem('freshmart_admin_unlocked');
    }
  };

  const login = async (email: string, role: UserRole = 'customer') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: 'password123',
        });
        if (error) throw error;
      }

      // Fallback or demo user login
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role,
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('freshmart_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signup = async (email: string, fullName: string, role: UserRole = 'customer') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password: 'password123',
          options: {
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
      }

      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: fullName,
        role,
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('freshmart_user', JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('freshmart_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isLoading,
        isConfigured: isSupabaseConfigured,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        changeAdminPasscode,
        login,
        signup,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
