'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { ShieldCheck, UserCheck, RefreshCw, Sparkles, Database, ExternalLink } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const { user, role, switchDemoRole, isConfigured } = useAuth();
  const { resetToDemoData } = useStore();
  const { showToast } = useToast();

  const handleReset = () => {
    resetToDemoData();
    showToast('Reset store data to clean factory demo state', 'info');
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: App Identity & Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            FreshMart Local
          </span>
          <span className="hidden sm:inline-block text-slate-400">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            {isConfigured ? (
              <span className="text-emerald-400 font-medium">Supabase Connected</span>
            ) : (
              <span className="text-amber-400 font-medium">Interactive Demo Store</span>
            )}
          </span>
        </div>

        {/* Right: Quick Role Switcher & Admin Link & Reset Data */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => switchDemoRole('customer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                role === 'customer'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span>Customer Mode</span>
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                role === 'admin'
                  ? 'bg-amber-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Mode</span>
            </button>
          </div>

          {role === 'admin' ? (
            <Link
              href="/admin"
              className="flex items-center gap-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2.5 py-1 rounded-md border border-amber-500/40 font-medium transition-colors"
            >
              <span>Admin Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <Link
              href="/admin"
              className="text-slate-400 hover:text-slate-200 px-2 py-1 transition-colors"
            >
              Switch to Admin
            </Link>
          )}

          <button
            onClick={handleReset}
            title="Reset demo stock and test orders"
            className="flex items-center gap-1 text-slate-400 hover:text-rose-300 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
