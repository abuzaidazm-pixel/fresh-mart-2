'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Database, 
  CreditCard, 
  ShieldCheck, 
  Server, 
  Layers, 
  Code2, 
  Terminal, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'routes' | 'database' | 'payments' | 'admin'>('overview');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-emerald-900 text-white border-b border-emerald-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/80 rounded-xl border border-emerald-600/50 shadow-inner">
              <BookOpen className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">FreshMart Local Documentation</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-mono font-bold">v1.0.0</span>
              </div>
              <p className="text-emerald-200/80 text-sm mt-0.5">Architecture, Routing, Database Schemas & Payment APIs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              Open Storefront <ExternalLink className="w-4 h-4" />
            </Link>
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition"
            >
              Admin Center <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Notice Banner if someone was looking for port 8000 */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <span className="font-bold">Port Notice:</span> FreshMart Local is a <strong>Next.js (React/TypeScript)</strong> web application running on <strong>Port 3000</strong> (<code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-mono text-xs">http://localhost:3000</code>). If you were looking for FastAPI/Swagger UI at port 8000, please note that this project operates purely on Next.js + Supabase without a Python 8000 daemon.
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sticky top-6 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">Doc Sections</p>
              
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'overview' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" /> System Overview
              </button>

              <button
                onClick={() => setActiveTab('routes')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'routes' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-4 h-4 text-emerald-600" /> Application Routes
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'database' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-600" /> Database & Schema
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'payments' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & 3D Secure
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'admin' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Admin & Inventory
              </button>
            </div>
          </div>

          {/* Doc Content Panels */}
          <div className="lg:col-span-3 space-y-6">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Project Architecture & Overview</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    FreshMart Local is an enterprise-grade grocery e-commerce and store operations platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Frontend</span>
                    <h3 className="font-bold text-slate-900 mt-1">Next.js 14 App Router</h3>
                    <p className="text-xs text-slate-600 mt-1">React 18, TypeScript, Tailwind CSS, Lucide Icons</p>
                  </div>
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Data Layer</span>
                    <h3 className="font-bold text-slate-900 mt-1">Dual-Mode Architecture</h3>
                    <p className="text-xs text-slate-600 mt-1">Supabase PostgreSQL + Zero-config LocalStorage Fallback</p>
                  </div>
                  <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
                    <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Payments</span>
                    <h3 className="font-bold text-slate-900 mt-1">Multi-Rail Engine</h3>
                    <p className="text-xs text-slate-600 mt-1">3D Secure Cards, Direct UPI QR/VPA, Cash on Delivery</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Quick Commands</h3>
                  <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span># Start Dev Server</span>
                      <span>Port 3000</span>
                    </div>
                    <p className="text-emerald-400">npm run dev</p>
                    <div className="border-t border-slate-800 my-2 pt-2 flex items-center justify-between text-slate-400 text-xs">
                      <span># Build Production Bundle</span>
                    </div>
                    <p className="text-emerald-400">npm run build</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ROUTES */}
            {activeTab === 'routes' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Application Endpoints & Routes</h2>
                  <p className="text-slate-600 text-sm mt-1">All pages and interactive routes available on this server:</p>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/</span>
                      <p className="text-sm text-slate-600 mt-1">Storefront Home (Featured hero banners, categories, flash deals, and farm-fresh picks).</p>
                    </div>
                    <Link href="/" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>

                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/products</span>
                      <p className="text-sm text-slate-600 mt-1">Full product catalog with live search, 9 category filters, price sorting, and stock indicators.</p>
                    </div>
                    <Link href="/products" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>

                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/insights</span>
                      <p className="text-sm text-slate-600 mt-1">Interactive choropleth sourcing map with metric switcher, legend, hover tooltips, pan/zoom, and a country detail panel.</p>
                    </div>
                    <Link href="/insights" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>

                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/cart</span>
                      <p className="text-sm text-slate-600 mt-1">Shopping basket with quantity steppers, promo vouchers (e.g. <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">FRESHMART5</code>), and delivery progress bar.</p>
                    </div>
                    <Link href="/cart" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>

                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/checkout</span>
                      <p className="text-sm text-slate-600 mt-1">Checkout funnel with address selection, delivery windows, 3D Secure Card modal, UPI QR code, and COD.</p>
                    </div>
                    <Link href="/checkout" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>

                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/admin</span>
                      <p className="text-sm text-slate-600 mt-1">Executive store operations dashboard with live KPI counters, critical stock widgets, and live orders.</p>
                    </div>
                    <Link href="/admin" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>

                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/admin/inventory</span>
                      <p className="text-sm text-slate-600 mt-1">Stock balance matrix, adjustment modal (Restock, Damaged, Expired, Count Audit), and reason history log.</p>
                    </div>
                    <Link href="/admin/inventory" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>

                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">/account</span>
                      <p className="text-sm text-slate-600 mt-1">Customer account management, past order history with 1-click reorder, and saved payment options.</p>
                    </div>
                    <Link href="/account" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DATABASE */}
            {activeTab === 'database' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Database Models (PostgreSQL / Supabase)</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    The schema file is located at <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">supabase/schema.sql</code>.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl p-4">
                    <h3 className="font-bold text-slate-900 font-mono text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> products
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      <code className="text-slate-800 font-mono">id (UUID), name, slug, description, price, compare_price, category_id, stock_quantity, reorder_level, unit, image_url, is_active, is_featured</code>
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <h3 className="font-bold text-slate-900 font-mono text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> orders & order_items
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      <code className="text-slate-800 font-mono">id, order_number, user_id, status (pending/confirmed/packed/out_for_delivery/delivered/cancelled), total_amount, payment_method, payment_status, utr_reference, delivery_type, shipping_address</code>
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <h3 className="font-bold text-slate-900 font-mono text-sm flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> inventory_adjustments
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      <code className="text-slate-800 font-mono">id, product_id, change_amount, adjustment_type (restock/damaged/expired/count_audit/order_placed/order_cancelled), reason, performed_by, created_at</code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Payment Rails & 3D Secure Verification</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Strict verification engine ensuring orders cannot be finalized without authorized payment.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      1. Bank 3D Secure / OTP Simulation
                    </h3>
                    <p className="text-sm text-emerald-800 mt-1 leading-relaxed">
                      Validates 16-digit card number, CVV, and expiration. Opens bank gateway overlay requiring 6-digit SMS OTP (Test OTP: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">123456</code>). Prevents order creation if declined or cancelled.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <h3 className="font-bold text-purple-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                      2. Direct UPI (VPA & Dynamic QR)
                    </h3>
                    <p className="text-sm text-purple-800 mt-1 leading-relaxed">
                      Deep-links with Google Pay, PhonePe, Paytm, and BHIM UPI apps. Automatically renders real-time UPI QR code and logs 12-digit UTR transaction codes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADMIN */}
            {activeTab === 'admin' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Admin Operations & Safeguards</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Comprehensive inventory controls with built-in stock restoration safeguards.
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Order Cancellation Stock Return:</strong> When an admin marks an order as Cancelled, all reserved inventory units are automatically refunded to product stock and audited.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Mandatory Reason Audit:</strong> Any physical stock modification requires a reason log category (Restock, Damage, Expiration, or Physical Count).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>1-Click Demo Mode Switcher:</strong> Switch between Store Owner (Admin) and Customer roles at any time using the top utility bar.</span>
                  </li>
                </ul>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
