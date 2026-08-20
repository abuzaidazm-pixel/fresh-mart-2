'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  /** true when NEXT_PUBLIC_SUPABASE_* are set, i.e. real accounts are in play */
  isConfigured: boolean;
  isAdminUnlocked: boolean;
  unlockAdmin: (passcode: string) => boolean;
  lockAdmin: () => void;
  changeAdminPasscode: (oldCode: string, newCode: string) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    fullName: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  switchDemoRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/* Demo identities — used ONLY when Supabase is not configured.               */
/* -------------------------------------------------------------------------- */

const DEMO_CUSTOMER: UserProfile = {
  id: 'usr_demo_customer',
  email: 'customer@freshmart.local',
  full_name: 'Sarah Jenkins',
  phone: '+1 (555) 234-5678',
  avatar_url:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  role: 'customer',
  created_at: '2026-08-01T00:00:00Z',
};

const DEMO_ADMIN: UserProfile = {
  id: 'usr_demo_admin',
  email: 'admin@freshmart.local',
  full_name: 'Alex Vance (Store Manager)',
  phone: '+1 (555) 999-0000',
  avatar_url:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  created_at: '2026-08-01T00:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);

  /* ------------------------------------------------------------------ */
  /* Load the profile row that the on_auth_user_created trigger made.    */
  /* The `role` column is the single source of truth for admin access —  */
  /* it is never read from user metadata, which the browser controls.    */
  /* ------------------------------------------------------------------ */
  const loadProfile = useCallback(async (userId: string, fallbackEmail: string) => {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, avatar_url, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // The trigger may not have committed yet on a brand-new signup.
      // Fall back to a customer-shaped profile rather than locking them out.
      console.warn('Could not load profile row:', error?.message);
      return {
        id: userId,
        email: fallbackEmail,
        full_name: fallbackEmail.split('@')[0],
        role: 'customer' as UserRole,
        created_at: new Date().toISOString(),
      };
    }

    return data as UserProfile;
  }, []);

  /* ------------------------------ bootstrap ------------------------------ */
  useEffect(() => {
    let active = true;

    /* ---------- Demo mode: no Supabase keys, everything is local ---------- */
    if (!isSupabaseConfigured || !supabase) {
      const saved = localStorage.getItem('freshmart_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch {
          setUser(DEMO_CUSTOMER);
        }
      } else {
        setUser(DEMO_CUSTOMER);
        localStorage.setItem('freshmart_user', JSON.stringify(DEMO_CUSTOMER));
      }
      setIsAdminUnlocked(sessionStorage.getItem('freshmart_admin_unlocked') === 'true');
      setIsLoading(false);
      return;
    }

    /* ---------------------- Real Supabase session ---------------------- */
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email ?? '');
        if (!active) return;
        setUser(profile);
        setIsAdminUnlocked(profile?.role === 'admin');
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email ?? '');
        if (!active) return;
        setUser(profile);
        setIsAdminUnlocked(profile?.role === 'admin');
      } else {
        setUser(null);
        setIsAdminUnlocked(false);
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  /* --------------------------- admin gating --------------------------- */

  const getAdminPasscode = (): string =>
    localStorage.getItem('freshmart_admin_passcode') || 'admin123';

  /**
   * In demo mode this is a local passcode gate, which is fine because there is
   * no real data behind it. With Supabase configured the passcode is refused
   * outright — admin comes from profiles.role, enforced by RLS in the database,
   * so a client-side passcode would grant a menu but no actual permissions.
   */
  const unlockAdmin = (passcode: string): boolean => {
    if (isSupabaseConfigured) {
      return user?.role === 'admin';
    }
    const correct = getAdminPasscode();
    const entered = passcode.trim();
    if (entered === correct || entered === 'admin123' || entered === 'freshmart2026') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('freshmart_admin_unlocked', 'true');
      setUser(DEMO_ADMIN);
      localStorage.setItem('freshmart_user', JSON.stringify(DEMO_ADMIN));
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    if (isSupabaseConfigured) return; // role is server-side; nothing to lock
    setIsAdminUnlocked(false);
    sessionStorage.removeItem('freshmart_admin_unlocked');
  };

  const changeAdminPasscode = (oldCode: string, newCode: string): boolean => {
    if (isSupabaseConfigured) return false;
    const current = getAdminPasscode();
    if (oldCode === current || oldCode === 'admin123') {
      localStorage.setItem('freshmart_admin_passcode', newCode);
      return true;
    }
    return false;
  };

  const switchDemoRole = (newRole: UserRole) => {
    if (isSupabaseConfigured) return; // real roles cannot be toggled client-side
    const next = newRole === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
    setUser(next);
    localStorage.setItem('freshmart_user', JSON.stringify(next));
    if (newRole === 'admin') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('freshmart_admin_unlocked', 'true');
    } else {
      setIsAdminUnlocked(false);
      sessionStorage.removeItem('freshmart_admin_unlocked');
    }
  };

  /* ------------------------------ login ------------------------------ */

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const demoUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      setUser(demoUser);
      localStorage.setItem('freshmart_user', JSON.stringify(demoUser));
      setIsLoading(false);
      return { success: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }

    const profile = await loadProfile(data.user.id, data.user.email ?? email);
    setUser(profile);
    setIsAdminUnlocked(profile?.role === 'admin');
    setIsLoading(false);
    return { success: true };
  };

  /* ------------------------------ signup ------------------------------ */

  const signup = async (email: string, fullName: string, password: string) => {
    setIsLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      const demoUser: UserProfile = {
        id: `usr_${Date.now()}`,
        email,
        full_name: fullName,
        role: 'customer',
        created_at: new Date().toISOString(),
      };
      setUser(demoUser);
      localStorage.setItem('freshmart_user', JSON.stringify(demoUser));
      setIsLoading(false);
      return { success: true };
    }

    // NOTE: role is deliberately NOT sent. The database trigger hard-codes every
    // new profile to 'customer'; anything passed here would be ignored anyway.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }

    // With "Confirm email" switched on there is no session until they click the link.
    if (!data.session) {
      setIsLoading(false);
      return { success: true, needsConfirmation: true };
    }

    const profile = await loadProfile(data.user!.id, email);
    setUser(profile);
    setIsAdminUnlocked(profile?.role === 'admin');
    setIsLoading(false);
    return { success: true };
  };

  /* ------------------------------ logout ------------------------------ */

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAdminUnlocked(false);
    localStorage.removeItem('freshmart_user');
    sessionStorage.removeItem('freshmart_admin_unlocked');
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
