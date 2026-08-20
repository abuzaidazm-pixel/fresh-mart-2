'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { Product, Order } from '@/lib/types';
import { ProductModal } from '@/components/admin/ProductModal';
import { StockAdjustModal } from '@/components/admin/StockAdjustModal';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import {
  DollarSign,
  ClipboardList,
  AlertTriangle,
  Package,
  Plus,
  ArrowRight,
  TrendingUp,
  Boxes,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { products, orders, adjustments } = useStore();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Financial Metrics
  const totalRevenue = orders
    .filter(o => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders.filter(
    o => o.order_status !== 'completed' && o.order_status !== 'cancelled'
  ).length;

  const lowStockProducts = products.filter(
    p => p.is_active && p.stock_quantity <= p.reorder_level
  );

  const activeProductsCount = products.filter(p => p.is_active).length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Store Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Based on {orders.length} lifetime orders</span>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Active Live Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {activeOrdersCount}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Requires packing or dispatch</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {lowStockProducts.length}
          </div>
          <div className="text-[11px] text-rose-300 font-semibold">
            {lowStockProducts.length > 0
              ? 'Units ≤ Reorder threshold'
              : 'All catalog stocks healthy'}
          </div>
        </div>

        {/* Active Catalog */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Active Products</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {activeProductsCount}
          </div>
          <div className="text-[11px] text-sky-400 font-semibold">
            Across 9 grocery departments
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-300">Quick Store Actions:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </button>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
          >
            <Boxes className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Stock Inflow</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
          >
            <ClipboardList className="w-3.5 h-3.5 text-sky-400" />
            <span>Dispatch Live Orders</span>
          </Link>
        </div>
      </div>

      {/* 2 Grid: Critical Low Stock Items + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Critical Low Stock Warning Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-white">Critical Stock Attention</h3>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              View Full Stock Matrix →
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="font-bold text-slate-200">All inventory levels are healthy!</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                No items are below their reorder threshold.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map(prod => (
                <div
                  key={prod.id}
                  className="bg-slate-950/70 p-3.5 rounded-2xl border border-rose-900/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-slate-800 shrink-0">
                      <Image
                        src={prod.image_url}
                        alt={prod.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-200 truncate">{prod.name}</div>
                      <div className="text-[11px] text-rose-400 font-semibold">
                        {prod.stock_quantity === 0 ? (
                          'OUT OF STOCK'
                        ) : (
                          `Only ${prod.stock_quantity} left (Threshold: ${prod.reorder_level})`
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProductForStock(prod)}
                    className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-sm"
                  >
                    Quick Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Live Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-white">Recent Customer Orders</h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-amber-400 hover:underline font-bold"
            >
              All Orders ({orders.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-white">
                      #{order.order_number}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      order.order_status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : order.order_status === 'cancelled'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {order.order_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {order.customer_name} • {order.items.length} items • {order.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Pickup'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-white">₹{order.total.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />

      <StockAdjustModal
        isOpen={Boolean(selectedProductForStock)}
        onClose={() => setSelectedProductForStock(null)}
        product={selectedProductForStock}
      />

      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
