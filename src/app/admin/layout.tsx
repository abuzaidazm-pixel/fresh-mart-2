'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    isAdminUnlocked,
    unlockAdminWithPassword,
    lockAdmin,
    isConfigured,
    isLoading,
    adminUnlockMinutes,
  } = useAuth();
  const { showToast } = useToast();

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg(isConfigured ? 'Please enter your password' : 'Please enter the store admin passcode');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const res = await unlockAdminWithPassword(passcode);
    if (res.success) {
      showToast('Admin panel unlocked', 'success');
      setPasscode('');
    } else {
      setErrorMsg(
        res.error ||
          (isConfigured ? 'Incorrect password.' : 'Incorrect passcode. Try "admin123" for demo access.')
      );
      showToast('Authentication failed', 'error');
    }
    setIsSubmitting(false);
  };

  // With Supabase connected there is no passcode to type: admin comes from
  // profiles.role and is enforced by RLS in the database. Typing a code here
  // would open the menus while every query behind them still failed, so the
  // gate explains what to do instead.
  if (isConfigured && !isLoading && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Staff access required
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {isLoading
                ? 'Checking your account…'
                : user
                ? `You're signed in as ${user.email}, which is a customer account. Store staff need the admin role on their profile.`
                : 'Sign in with a store staff account to reach inventory, pricing and order fulfilment.'}
            </p>
          </div>
          <div className="text-left text-xs text-slate-400 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-slate-300">Granting admin access</p>
            <p>
              In the Supabase SQL Editor, run:
            </p>
            <code className="block bg-black/50 rounded-lg p-2.5 text-[11px] text-emerald-300 break-all">
              update public.profiles set role = &apos;admin&apos; where email = &apos;you@example.com&apos;;
            </code>
            <p>Then sign out and back in.</p>
          </div>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Back to the store
          </Link>
        </div>
      </div>
    );
  }

  // If Admin Panel is Locked, show the Security Authentication Gate
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Security Icon Badge */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-[10px] font-black uppercase tracking-wider text-amber-300 mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Restricted Staff Portal</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Admin Panel Security
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isConfigured
                  ? `Signed in as ${user?.email}. Re-enter your account password to reach inventory, pricing and order fulfilment.`
                  : 'Enter your authorized store manager passcode to access inventory, pricing, and order fulfillment controls.'}
              </p>
            </div>
          </div>

          {/* Passcode Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isConfigured ? 'Your Account Password' : 'Staff Master Passcode'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcode}
                  onChange={e => {
                    setPasscode(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={isConfigured ? 'Enter your password' : 'Enter passcode (e.g. admin123)'}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 rounded-2xl border border-slate-700 text-white placeholder:text-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="text-rose-400 text-xs font-medium mt-2 flex items-center gap-1.5 animate-fade-in">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {isConfigured ? (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                The panel re-locks after {adminUnlockMinutes} minutes and whenever
                this tab is closed. Change this password under{' '}
                <span className="text-slate-300 font-semibold">Account &rarr; Profile</span>.
              </div>
            ) : (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="text-slate-400">
                  <span>Demo Passcode: </span>
                  <code className="text-amber-300 font-mono font-bold">admin123</code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPasscode('admin123');
                    setErrorMsg('');
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying…' : 'Unlock Admin Panel'}</span>
            </button>
          </form>

          {/* Return to Customer Store */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // When Unlocked, render full Admin Portal Layout
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Admin Navigation Sidebar */}
        <AdminSidebar />

        {/* Admin Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Admin Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white">
                  FreshMart Store Operations
                </h1>
                <p className="text-xs text-slate-400">
                  Inventory control, price adjustments, and live order dispatch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>{user?.full_name || 'Store Admin'}</span>
              </span>

              {/* Lock Admin Panel Button */}
              <button
                onClick={() => {
                  lockAdmin();
                  showToast('Admin operations panel locked', 'info');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-bold transition-colors"
                title="Lock Admin Panel"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Panel</span>
              </button>
            </div>
          </div>

          {/* Page Child View */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
