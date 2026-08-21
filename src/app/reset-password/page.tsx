'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { checkPassword, suggestPassword, MIN_PASSWORD_LENGTH } from '@/lib/password';
import { ShieldCheck, Eye, EyeOff, Wand2, AlertTriangle, Check } from 'lucide-react';

const METER_COLORS = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];

/**
 * Landing page for the "reset your password" email.
 *
 * Supabase turns the link into a short-lived recovery session before this page
 * renders, which is why no token is read from the URL by hand — the client
 * picks it up and fires a PASSWORD_RECOVERY event. Without that session,
 * updateUser() has nothing to authenticate with, so the form stays disabled and
 * says so rather than failing on submit.
 */
export default function ResetPasswordPage() {
  const { showToast } = useToast();

  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reveal, setReveal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setChecking(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setReady(Boolean(session));
      setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const verdict = checkPassword(password);
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = ready && !isSubmitting && verdict.valid && confirm === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !supabase) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    setDone(true);
    showToast('Password reset. You are signed in.', 'success');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {done ? 'Password reset' : 'Choose a new password'}
          </h1>
        </div>

        {done ? (
          <>
            <p className="text-sm text-slate-600 text-center leading-relaxed">
              Your password has been changed and you&apos;re signed in on this device.
              Any other devices will need the new password.
            </p>
            <Link
              href="/"
              className="block w-full text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Go to the store
            </Link>
          </>
        ) : checking ? (
          <p className="text-sm text-slate-500 text-center">Checking your reset link…</p>
        ) : !isSupabaseConfigured ? (
          <div className="flex gap-2.5 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This store is in demo mode, so there are no real accounts and nothing
              to reset.
            </p>
          </div>
        ) : !ready ? (
          <>
            <div className="flex gap-2.5 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This reset link is invalid or has expired — they&apos;re only good for
                one hour. Request a fresh one from the sign-in window.
              </p>
            </div>
            <Link
              href="/"
              className="block w-full text-center py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Back to the store
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">New password</label>
                <button
                  type="button"
                  onClick={() => {
                    const g = suggestPassword();
                    setPassword(g);
                    setConfirm(g);
                    setReveal(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  <Wand2 className="w-3 h-3" />
                  Generate
                </button>
              </div>
              <div className="relative">
                <input
                  type={reveal ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setReveal(v => !v)}
                  aria-label={reveal ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < verdict.score ? METER_COLORS[verdict.score] : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{verdict.label}</span>
                  </div>
                  {verdict.problems.map(p => (
                    <p key={p} className="text-[11px] text-rose-600 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      {p}
                    </p>
                  ))}
                  {verdict.valid && (
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                      <Check className="w-3 h-3" />
                      Meets the requirements
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm password
              </label>
              <input
                type={reveal ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Type it again"
                className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm ${
                  mismatch
                    ? 'border-rose-300 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {mismatch && (
                <p className="text-[11px] text-rose-600 mt-1.5">
                  The two passwords don&apos;t match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {isSubmitting ? 'Saving…' : 'Set new password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
