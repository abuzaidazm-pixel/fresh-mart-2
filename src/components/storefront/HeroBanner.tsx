'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Clock, Percent } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Main Hero Container */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white shadow-xl min-h-[360px] sm:min-h-[420px] flex items-center">
        {/* Ambient background glow & image */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-30 lg:opacity-75 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"
            alt="Fresh grocery market produce"
            fill
            className="object-cover object-right"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl p-6 sm:p-10 lg:p-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Farm Harvest Special • Week of Freshness</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Pure Farm Groceries, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-200">
              Delivered in 30 Mins.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg leading-relaxed">
            Hand-inspected organic fruits, crisp greens, morning artisanal bread, and grass-fed dairy from trusted local producers directly to your doorstep.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products"
              className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-400/20 flex items-center gap-2 group"
            >
              <span>Shop All Groceries</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/products?deals=true"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Percent className="w-4 h-4 text-amber-300" />
              <span>Explore Deals (Up to 30% Off)</span>
            </Link>
          </div>

          {/* Quick Coupon Voucher */}
          <div className="pt-2 flex items-center gap-3">
            <div className="bg-emerald-900/90 border border-dashed border-emerald-500/80 px-3 py-1.5 rounded-xl text-[11px] font-mono text-emerald-200 flex items-center gap-2">
              <span className="text-amber-300 font-bold">PROMO CODE:</span>
              <span className="font-bold tracking-wider text-white bg-emerald-800 px-1.5 py-0.5 rounded">
                FRESHMART5
              </span>
              <span className="text-emerald-300 font-sans hidden sm:inline">(₹50 off first order)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Express 30-Min Delivery</div>
            <div className="text-[11px] text-slate-500">Fast neighborhood dispatch</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">100% Quality Checked</div>
            <div className="text-[11px] text-slate-500">Freshness guaranteed or replaced</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Open 7 AM - 11 PM Daily</div>
            <div className="text-[11px] text-slate-500">Pick up or home delivery</div>
          </div>
        </div>
      </div>
    </div>
  );
};
