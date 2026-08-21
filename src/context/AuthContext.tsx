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
  /**
   * Re-enter your account password to open the admin panel. Being signed in is
   * not enough — this is the second gate in front of pricing, stock and orders.
   */
  unlockAdminWithPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  lockAdmin: () => void;
  /** Minutes the admin unlock stays valid before it re-locks itself. */
  adminUnlockMinutes: number;
  changeAdminPasscode: (oldCode: string, newCode: string) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    fullName: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  switchDemoRole: (newRole: UserRole) => void;
  /** Verifies the current password, then sets a new one. */
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  /** Emails a reset link for people who are locked out. */
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/* Admin panel lock                                                           */
/*                                                                            */
/* Signing in proves who you are; this proves you are still at the keyboard.  */
/* The unlock is kept in sessionStorage, not localStorage, so closing the tab  */
/* re-locks the panel, and it expires on its own after the timeout below —     */
/* an admin who walks away from an unattended machine is covered either way.   */
/* -------------------------------------------------------------------------- */

const ADMIN_UNLOCK_KEY = 'freshmart_admin_unlocked_at';
export const ADMIN_UNLOCK_MINUTES = 30;
const ADMIN_UNLOCK_TTL_MS = ADMIN_UNLOCK_MINUTES * 60 * 1000;

/** True only if an unlock was recorded and has not aged out. */
const isUnlockFresh = (): boolean => {
  try {
    const raw = sessionStorage.getItem(ADMIN_UNLOCK_KEY);
    if (!raw) return false;
    const stamped = Number(raw);
    if (!Number.isFinite(stamped)) return false;
    return Date.now() - stamped < ADMIN_UNLOCK_TTL_MS;
  } catch {
    // Private browsing can throw on sessionStorage access. Fail closed.
    return false;
  }
};

const stampUnlock = () => {
  try {
    sessionStorage.setItem(ADMIN_UNLOCK_KEY, String(Date.now()));
  } catch {
    /* ignore — the panel will simply ask again */
  }
};

const clearUnlock = () => {
  try {
    sessionStorage.removeItem(ADMIN_UNLOCK_KEY);
  } catch {
    /* ignore */
  }
};

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
      setIsAdminUnlocked(isUnlockFresh());
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
        setIsAdminUnlocked(profile?.role === 'admin' && isUnlockFresh());
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
        setIsAdminUnlocked(profile?.role === 'admin' && isUnlockFresh());
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
      stampUnlock();
      setIsAdminUnlocked(true);
      setUser(DEMO_ADMIN);
      localStorage.setItem('freshmart_user', JSON.stringify(DEMO_ADMIN));
      return true;
    }
    return false;
  };

  /**
   * The real admin gate. Verifies the password by asking Supabase to
   * authenticate with it — the check happens on their servers, so there is no
   * secret sitting in the bundle for someone to read, and a wrong password is
   * rejected by the same rate-limited endpoint that guards sign-in.
   */
  const unlockAdminWithPassword = async (password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: unlockAdmin(password) };
    }

    if (!user?.email) {
      return { success: false, error: 'Sign in first.' };
    }

    if (user.role !== 'admin') {
      return { success: false, error: 'This account does not have staff access.' };
    }

    // Stamped before the call, not after: signInWithPassword fires an auth state
    // change whose handler reads this key, and stamping afterwards would let
    // that handler observe the old value and immediately re-lock the panel.
    stampUnlock();

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (error) {
      clearUnlock();
      setIsAdminUnlocked(false);
      return { success: false, error: 'Incorrect password.' };
    }

    setIsAdminUnlocked(true);
    return { success: true };
  };

  const lockAdmin = () => {
    clearUnlock();
    setIsAdminUnlocked(false);
  };

  /* Re-lock the panel once the unlock ages out, without needing a page load. */
  useEffect(() => {
    if (!isAdminUnlocked) return;
    const timer = setInterval(() => {
      if (!isUnlockFresh()) setIsAdminUnlocked(false);
    }, 30_000);
    return () => clearInterval(timer);
  }, [isAdminUnlocked]);

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
      stampUnlock();
      setIsAdminUnlocked(true);
    } else {
      clearUnlock();
      setIsAdminUnlocked(false);
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
    setIsAdminUnlocked(profile?.role === 'admin' && isUnlockFresh());
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
    setIsAdminUnlocked(profile?.role === 'admin' && isUnlockFresh());
    setIsLoading(false);
    return { success: true };
  };

  /* -------------------------- password changes -------------------------- */

  /**
   * Supabase's updateUser() will change a password using nothing but the active
   * session — it never asks for the old one. That means an unattended laptop or
   * a stolen session token is enough to lock the real owner out of their own
   * store. So the old password is verified first by re-authenticating with it,
   * and only then is the new one set.
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          'Passwords only exist when the app is connected to Supabase. In demo mode there are no real accounts.',
      };
    }

    if (!user?.email) {
      return { success: false, error: 'You need to be signed in to change your password.' };
    }

    if (currentPassword === newPassword) {
      return { success: false, error: 'The new password must be different from the current one.' };
    }

    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (reauthError) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      // Supabase raises this when leaked-password protection rejects the choice.
      return { success: false, error: updateError.message };
    }

    return { success: true };
  };

  const requestPasswordReset = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Password resets need Supabase to be connected.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) return { success: false, error: error.message };
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
    clearUnlock();
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
        unlockAdminWithPassword,
        lockAdmin,
        adminUnlockMinutes: ADMIN_UNLOCK_MINUTES,
        changeAdminPasscode,
        login,
        signup,
        logout,
        switchDemoRole,
        changePassword,
        requestPasswordReset,
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
