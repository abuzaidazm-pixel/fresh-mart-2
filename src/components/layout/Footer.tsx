'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Mail,
  Heart,
  Phone,
  MapPin,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      {/* 4 Feature Badges */}
      <div className="max-w-7xl mx-auto px-4 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/50">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">30-Min Fast Delivery</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Direct from our neighborhood mart to your kitchen
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">100% Organic & Fresh</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Hand-inspected produce sourced daily from verified local farms
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/50">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Doorstep Quality Guarantee</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Not happy with freshness? Instant replacement or refund
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/50">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Open 7 AM - 11 PM Daily</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Walk in anytime or place online orders for express pickup
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white leading-none">
                Fresh<span className="text-emerald-400">Mart</span>
              </div>
              <div className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest leading-none mt-0.5">
                Local Grocery
              </div>
            </div>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            FreshMart Local is your community grocer committed to bringing pure, farm-fresh produce, wholesome dairy, artisanal bread, and kitchen staples to your doorstep with unmatched speed and care.
          </p>
          <div className="space-y-1.5 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>104 Green Valley Blvd, Greenfield, State 90210</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>(555) 234-MART • Helpline Open 7 AM - 11 PM</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Departments
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/products?cat=cat_produce" className="hover:text-emerald-400 transition-colors">
                Fruits & Vegetables
              </Link>
            </li>
            <li>
              <Link href="/products?cat=cat_dairy" className="hover:text-emerald-400 transition-colors">
                Dairy & Farm Eggs
              </Link>
            </li>
            <li>
              <Link href="/products?cat=cat_bakery" className="hover:text-emerald-400 transition-colors">
                Artisanal Bakery
              </Link>
            </li>
            <li>
              <Link href="/products?cat=cat_staples" className="hover:text-emerald-400 transition-colors">
                Organic Staples & Grains
              </Link>
            </li>
            <li>
              <Link href="/products?cat=cat_beverages" className="hover:text-emerald-400 transition-colors">
                Cold Beverages & Juices
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Customer Care
          </div>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/account" className="hover:text-emerald-400 transition-colors">
                Track My Order
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-emerald-400 transition-colors">
                Shopping Basket
              </Link>
            </li>
            <li>
              <Link href="/products?deals=true" className="hover:text-emerald-400 transition-colors">
                Flash Discounts & Deals
              </Link>
            </li>
            <li>
              <Link href="/insights" className="hover:text-emerald-400 transition-colors">
                Global Sourcing Map
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-amber-400 font-semibold hover:underline">
                Admin Control Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-white mb-4">
            Weekly Mart Deals
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Subscribe for exclusive coupon codes, farm arrival alerts, and weekend specials.
          </p>
          <form onSubmit={e => e.preventDefault()} className="space-y-2">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Get ₹50 Coupon
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} FreshMart Local Inc. All rights reserved. Original grocery marketplace.
        </div>
        <div className="flex items-center gap-2">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for local neighborhood grocery shopping</span>
        </div>
      </div>
    </footer>
  );
};
