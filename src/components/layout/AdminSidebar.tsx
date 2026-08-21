'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ClipboardList,
  Database,
  ArrowLeft,
  ShoppingBag,
  AlertTriangle,
  Lock,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { products, orders } = useStore();
  const { lockAdmin } = useAuth();

  const lowStockCount = products.filter(
    p => p.is_active && p.stock_quantity <= p.reorder_level
  ).length;

  const pendingOrdersCount = orders.filter(
    o => o.order_status === 'pending' || o.order_status === 'confirmed'
  ).length;

  const navItems = [
    {
      href: '/admin',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: '/admin/products',
      label: 'Product Catalog',
      icon: Package,
      badge: `${products.length}`,
    },
    {
      href: '/admin/categories',
      label: 'Departments',
      icon: Layers,
      badge: null,
    },
    {
      href: '/admin/inventory',
      label: 'Inventory & Stock',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      href: '/admin/orders',
      label: 'Orders Fulfillment',
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} active` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      href: '/admin/bank-settings',
      label: 'Bank & UPI Settings',
      icon: Landmark,
      badge: 'Direct',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      href: '/admin/database',
      label: 'Supabase & Database',
      icon: Database,
      badge: null,
    },
    {
      href: '/admin/security',
      label: 'Security & Password',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 rounded-3xl p-5 border border-slate-800 shadow-xl">
      <div className="space-y-6">
        {/* Admin Brand Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            FM
          </div>
          <div>
            <div className="text-sm font-black text-white">FreshMart Admin</div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              Store Control Center
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-slate-900 text-amber-400' : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to Customer Storefront */}
      <div className="pt-6 border-t border-slate-800 mt-6 space-y-3">
        {lowStockCount > 0 && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-[11px] text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{lowStockCount} items need immediate reorder</span>
          </div>
        )}

        <button
          onClick={lockAdmin}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/70 rounded-xl text-xs font-bold transition-colors"
        >
          <Lock className="w-4 h-4" />
          <span>Lock Admin Panel</span>
        </button>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    </aside>
  );
};
