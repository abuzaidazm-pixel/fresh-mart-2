'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { checkPassword, suggestPassword, MIN_PASSWORD_LENGTH } from '@/lib/password';
import { Lock, Eye, EyeOff, ShieldCheck, Wand2, Check, AlertTriangle } from 'lucide-react';

const METER_COLORS = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];

export const ChangePasswordCard: React.FC = () => {
  const { user, changePassword, isConfigured } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verdict = checkPassword(newPassword, user?.email);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSubmit =
    !isSubmitting &&
    currentPassword.length > 0 &&
    verdict.valid &&
    confirmPassword === newPassword;

  const handleSuggest = () => {
    const generated = suggestPassword();
    setNewPassword(generated);
    setConfirmPassword(generated);
    setReveal(true);
    showToast('Generated a strong password — copy it into your password manager', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      showToast('Password updated. Use it the next time you sign in.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setReveal(false);
    } else {
      showToast(res.error || 'Could not change the password', 'error');
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-3">
        <h3 className="font-extrabold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          Password
        </h3>
        <div className="flex gap-2.5 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This store is running in demo mode, where accounts live only in this
            browser and there is no real password to change. Connect Supabase and
            sign in with a real account to manage your password here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-5">
      <h3 className="font-extrabold text-base text-slate-900 border-b pb-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        Change Password
      </h3>

      <p className="text-xs text-slate-500 leading-relaxed">
        This is the password for <span className="font-semibold text-slate-700">{user?.email}</span>.
        {user?.role === 'admin' && (
          <span className="text-amber-700 font-medium">
            {' '}
            It also unlocks the admin panel, so make it a strong one.
          </span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Current password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">New password</label>
            <button
              type="button"
              onClick={handleSuggest}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <Wand2 className="w-3 h-3" />
              Generate a strong one
            </button>
          </div>
          <div className="relative">
            <input
              type={reveal ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
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

          {newPassword.length > 0 && (
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
                <span
                  className={`text-[11px] font-bold ${
                    verdict.valid ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {verdict.label}
                </span>
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
            Confirm new password
          </label>
          <input
            type={reveal ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Type it again"
            className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm ${
              mismatch
                ? 'border-rose-300 focus:ring-rose-400'
                : 'border-slate-200 focus:ring-emerald-500'
            }`}
          />
          {mismatch && (
            <p className="text-[11px] text-rose-600 mt-1.5">The two passwords don&apos;t match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-emerald-600/20"
        >
          {isSubmitting ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <p className="text-[11px] text-slate-400 leading-relaxed border-t pt-3">
        Your current password is checked before the change is applied, so a
        forgotten or borrowed session can&apos;t take the account over. Store the new
        password in a password manager rather than reusing one from another site.
      </p>
    </div>
  );
};
