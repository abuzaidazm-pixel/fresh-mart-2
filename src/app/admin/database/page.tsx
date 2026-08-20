'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { testSupabaseConnection } from '@/lib/supabase';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Activity,
  Code,
} from 'lucide-react';

export default function AdminDatabasePage() {
  const { isConfigured } = useAuth();
  const { resetToDemoData, products, orders, adjustments, categories } = useStore();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    latencyMs?: number;
    error?: string;
    testedAt?: string;
  } | null>(null);

  const handleResetData = () => {
    resetToDemoData();
    showToast('Reset catalog, stocks, and sample orders to factory state', 'info');
  };

  const handleCopySqlPath = () => {
    navigator.clipboard.writeText(`supabase/schema.sql`);
    setCopied(true);
    showToast('Copied schema file path to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection();
      setTestResult({
        connected: res.connected,
        latencyMs: res.latencyMs,
        error: res.error,
        testedAt: new Date().toLocaleTimeString(),
      });
      if (res.connected) {
        showToast(`Connected to Supabase in ${res.latencyMs}ms!`, 'success');
      } else {
        showToast(res.error || 'Connection failed', 'info');
      }
    } catch (err: any) {
      setTestResult({
        connected: false,
        error: err.message,
        testedAt: new Date().toLocaleTimeString(),
      });
    }
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Database className="w-4 h-4" />
            <span>Database Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Supabase PostgreSQL & State Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-config resilient demo mode with live Supabase PostgreSQL synchronization
          </p>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-auto">
          {isConfigured ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-2xl text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Live Supabase Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/80 border border-amber-800 text-amber-300 rounded-2xl text-xs font-bold shadow-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Zero-Config Demo State Active</span>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: 3-Step Supabase Setup Guide */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" />
                <span>How to Connect Your Own Live Supabase Database</span>
              </h3>
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-emerald-900/50 text-emerald-300 border border-slate-700 hover:border-emerald-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1 ${
                  testResult.connected
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Connection Test Result ({testResult.testedAt}):</span>
                  <span>{testResult.connected ? `✅ Online (${testResult.latencyMs}ms)` : 'ℹ️ Demo Mode'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {testResult.connected
                    ? 'Successfully executed SELECT query on products table.'
                    : testResult.error || 'Running in local state. Add credentials in .env.local to enable live sync.'}
                </p>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">
                    Create a Free Project on Supabase
                  </div>
                  <p className="text-slate-400">
                    Visit{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      supabase.com
                    </a>{' '}
                    and create a new project (e.g. &quot;freshmart-grocery-app&quot;).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">
                    Run the PostgreSQL Schema Script
                  </div>
                  <p className="text-slate-400">
                    Open your Supabase project dashboard → Navigate to <strong>SQL Editor</strong> → Paste the contents of{' '}
                    <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                      supabase/schema.sql
                    </code>{' '}
                    and click <strong>Run</strong>. This will automatically create all 7 tables, indexes, triggers, and seed 30+ products!
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">
                    Add Credentials to .env.local
                  </div>
                  <p className="text-slate-400">
                    In your Supabase project settings → <strong>API</strong>, copy your Project URL and Anon Public Key into your local <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">.env.local</code> file:
                  </p>
                  <pre className="bg-slate-900 p-3 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800">
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Database Entities Summary */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-md">
            <h3 className="text-base font-extrabold text-white">Active Database Table Entities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-xl font-black text-white">{categories.length}</div>
                <div className="text-[11px] text-slate-400">Categories</div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-xl font-black text-white">{products.length}</div>
                <div className="text-[11px] text-slate-400">Products</div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-xl font-black text-white">{orders.length}</div>
                <div className="text-[11px] text-slate-400">Orders</div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-xl font-black text-white">{adjustments.length}</div>
                <div className="text-[11px] text-slate-400">Audit Adjustments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: State Reset & Utility Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-md">
            <h3 className="text-base font-extrabold text-white">Demo Data Tools</h3>
            <p className="text-xs text-slate-400">
              Reset the local state back to clean initial factory seed data (30+ products, sample orders, and stock records).
            </p>

            <button
              onClick={handleResetData}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Factory Demo Data</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-md">
            <h3 className="text-base font-extrabold text-white">Schema Location</h3>
            <p className="text-xs text-slate-400">
              The full PostgreSQL DDL script is located in your project repository:
            </p>
            <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-amber-300 border border-slate-800 break-all flex items-center justify-between">
              <span>supabase/schema.sql</span>
              <button
                onClick={handleCopySqlPath}
                className="text-slate-400 hover:text-white p-1"
                title="Copy Path"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
