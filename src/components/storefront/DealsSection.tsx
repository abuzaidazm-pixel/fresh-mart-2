'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from './ProductCard';
import { Flame, Clock, ArrowRight } from 'lucide-react';

export const DealsSection: React.FC = () => {
  const { products } = useStore();

  // Deal countdown timer simulation (e.g. 07h 45m 22s)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 45, seconds: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products
    .filter(p => p.is_active && p.compare_at_price && p.compare_at_price > p.price)
    .slice(0, 4);

  if (dealProducts.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-50 to-emerald-50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Daily Flash Deals
              </h2>
              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Limited Stock
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Special promotional prices refreshed daily at midnight
            </p>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 mr-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Ends in:</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
            <span className="bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 shadow-sm">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span className="text-amber-600 font-bold">:</span>
            <span className="bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 shadow-sm">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span className="text-amber-600 font-bold">:</span>
            <span className="bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 shadow-sm text-amber-700">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dealProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Footer link */}
      <div className="text-center pt-2">
        <Link
          href="/products?deals=true"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-200/70 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors"
        >
          <span>View All Discounted Grocery Offers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
