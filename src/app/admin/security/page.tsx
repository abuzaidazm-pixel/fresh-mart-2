'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ChangePasswordCard } from '@/components/ui/ChangePasswordCard';
import { ShieldCheck, Lock, Clock, UserCheck, AlertTriangle } from 'lucide-react';

export default function AdminSecurityPage() {
  const { user, lockAdmin, adminUnlockMinutes, isConfigured } = useAuth();
  const { showToast } = useToast();

  const handleLock = () => {
    lockAdmin();
    showToast('Admin panel locked', 'info');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Security &amp; Password
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Who can reach this panel, and how to change the password that opens it.
        </p>
      </div>

      {/* How access works */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h2 className="font-bold text-white text-sm">How admin access is protected</h2>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-bold text-slate-200">1. Your role</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only accounts with <code className="text-emerald-300">role = admin</code> in
              the database can see this panel. The database enforces it too, so a
              customer account gets nothing even if it reaches the page.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-bold text-slate-200">2. Your password</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Being signed in is not enough — the panel asks for your account
              password again before it opens. It is checked by Supabase, never
              stored in the site&apos;s code.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <p className="text-xs font-bold text-slate-200">3. Auto re-lock</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The unlock lasts {adminUnlockMinutes} minutes and is cleared when you
              close the tab, so an unattended machine doesn&apos;t leave the panel
              standing open.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Signed in as{' '}
            <span className="font-semibold text-slate-200">{user?.email}</span>
            <span className="ml-2 text-[10px] font-black uppercase tracking-wider bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLock}
            className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock panel now
          </button>
        </div>
      </div>

      {!isConfigured && (
        <div className="flex gap-2.5 text-xs text-amber-200 bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Supabase is not connected, so this store is running on demo data with
            the shared <code className="font-mono">admin123</code> passcode. Connect
            Supabase before relying on any of this for a real shop.
          </p>
        </div>
      )}

      {/* The change-password form, same component the account page uses */}
      <div className="[&>div]:max-w-none">
        <ChangePasswordCard />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
        <h2 className="font-bold text-white text-sm">Adding or removing staff</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Nobody can make themselves an admin — new sign-ups are always customers.
          To promote someone, have them register first, then run this in the
          Supabase SQL Editor:
        </p>
        <code className="block bg-black/50 rounded-xl p-3 text-[11px] text-emerald-300 break-all">
          update public.profiles set role = &apos;admin&apos; where email =
          &apos;them@example.com&apos;;
        </code>
        <p className="text-xs text-slate-400 leading-relaxed">
          To revoke access, set the role back to <code>&apos;customer&apos;</code>. They
          keep their account and order history but lose this panel immediately.
        </p>
      </div>
    </div>
  );
}
