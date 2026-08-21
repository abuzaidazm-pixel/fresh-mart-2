'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { checkPassword, MIN_PASSWORD_LENGTH } from '@/lib/password';
import { X, Mail, Lock, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isAdminRole, setIsAdminRole] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { login, signup, switchDemoRole, isConfigured, requestPasswordReset } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleForgotPassword = async () => {
    if (!email) {
      showToast('Enter your email address first, then click again', 'info');
      return;
    }
    const res = await requestPasswordReset(email);
    if (res.success) {
      // Deliberately worded so it doesn't reveal whether the address is registered.
      showToast(`If ${email} has an account, a reset link is on its way`, 'success');
    } else {
      showToast(res.error || 'Could not send the reset email', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !fullName)) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (isSignUp && isConfigured) {
      const verdict = checkPassword(password, email);
      if (!verdict.valid) {
        showToast(verdict.problems[0], 'error');
        return;
      }
    }

    setIsSubmitting(true);

    if (isSignUp) {
      const res = await signup(email, fullName, password);
      if (res.success && res.needsConfirmation) {
        showToast(`Almost there — check ${email} for a confirmation link`, 'success');
        onClose();
      } else if (res.success) {
        showToast(`Account created successfully! Welcome, ${fullName}`, 'success');
        onClose();
      } else {
        showToast(res.error || 'Failed to sign up', 'error');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Logged in successfully as ${email}`, 'success');
        onClose();
      } else {
        showToast(res.error || 'Failed to log in', 'error');
      }
    }
    setIsSubmitting(false);
  };

  const handleQuickDemo = (roleType: 'customer' | 'admin') => {
    switchDemoRole(roleType);
    showToast(
      `Switched to ${roleType === 'admin' ? 'Admin (Alex Vance)' : 'Customer (Sarah Jenkins)'}`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-slate-100 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {isSignUp ? 'Create your Account' : 'Welcome to FreshMart'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isSignUp
              ? 'Join FreshMart Local for faster checkout and order tracking'
              : 'Sign in to access your saved basket, past orders, and profile'}
          </p>
        </div>

        {/* Quick Demo Login Badges — local-only shortcuts, meaningless against a
            real database, so they are hidden once Supabase is connected. */}
        {!isConfigured && (
        <div className="mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
            ⚡ Quick 1-Click Demo Login
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-medium text-slate-700 hover:text-emerald-700 transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-lg text-xs font-medium text-slate-700 hover:text-amber-700 transition-all shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
        )}

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-medium">Or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              {!isSignUp && isConfigured && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-semibold text-emerald-600 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : "••••••••"}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Self-service admin registration only exists in demo mode. Against a
              real database the role lives in profiles.role and is granted by an
              existing admin — offering a checkbox here would be a privilege
              escalation, and the database would reject it regardless. */}
          {isSignUp && !isConfigured && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="adminCheck"
                checked={isAdminRole}
                onChange={e => setIsAdminRole(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="adminCheck" className="text-xs text-slate-600 select-none cursor-pointer">
                Register as <span className="font-semibold text-amber-700">Admin / Store Staff</span>
              </label>
            </div>
          )}

          {isSignUp && isConfigured && (
            <p className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
              New accounts are created as customers. Store staff are promoted by an
              existing administrator.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : isSignUp
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Create One
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
