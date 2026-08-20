'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { Product, InventoryAdjustment } from '@/lib/types';
import { StockAdjustModal } from '@/components/admin/StockAdjustModal';
import {
  Boxes,
  History,
  AlertTriangle,
  Search,
  PlusCircle,
  MinusCircle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const { products, adjustments, categories } = useStore();

  const [activeTab, setActiveTab] = useState<'matrix' | 'logs'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filtered Stock Matrix
  const filteredProducts = products.filter(p => {
    if (onlyLowStock && p.stock_quantity > p.reorder_level) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Adjustments History
  const filteredAdjustments = adjustments.filter(adj => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const pName = adj.product_name || '';
      return (
        pName.toLowerCase().includes(q) ||
        adj.reason.toLowerCase().includes(q) ||
        adj.performed_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Boxes className="w-4 h-4" />
            <span>Store Inventory Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Stock Management & Audit Records
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock balance, damage tracking, and automated audit logging
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Live Stock Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Adjustment Logs ({adjustments.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'matrix'
                ? 'Search stock by product name or slug...'
                : 'Search audit logs by reason, staff, or product...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {activeTab === 'matrix' && (
          <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs font-bold text-slate-300 shrink-0">
            <input
              type="checkbox"
              checked={onlyLowStock}
              onChange={e => setOnlyLowStock(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-slate-700 bg-slate-900"
            />
            <span className="text-rose-300">Show Low Stock Only (≤ Reorder Level)</span>
          </label>
        )}
      </div>

      {/* TAB 1: Live Stock Matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-4 px-4">Grocery Product</th>
                  <th className="py-4 px-4">Department</th>
                  <th className="py-4 px-4">Current Stock Units</th>
                  <th className="py-4 px-4">Reorder Threshold</th>
                  <th className="py-4 px-4">Stock Health</th>
                  <th className="py-4 px-4 text-right">Quick Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No products matching current stock filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const cat = categories.find(c => c.id === product.category_id);
                    const isOutOfStock = product.stock_quantity === 0;
                    const isLow = !isOutOfStock && product.stock_quantity <= product.reorder_level;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Product */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-slate-950 shrink-0 border border-slate-800">
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                                {product.name}
                              </div>
                              <div className="text-[10px] text-slate-500">{product.unit}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 font-medium text-slate-400">
                          {cat?.name || 'Unassigned'}
                        </td>

                        {/* Current Units */}
                        <td className="py-3 px-4">
                          <span className={`font-black text-sm ${
                            isOutOfStock
                              ? 'text-rose-400'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}>
                            {product.stock_quantity} units
                          </span>
                        </td>

                        {/* Reorder Level */}
                        <td className="py-3 px-4 font-semibold text-slate-400">
                          {product.reorder_level} units
                        </td>

                        {/* Health Status */}
                        <td className="py-3 px-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                              <AlertTriangle className="w-3 h-3" /> OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                              <AlertTriangle className="w-3 h-3" /> LOW STOCK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> HEALTHY
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Historical Adjustments Audit Log */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-4 px-4">Timestamp</th>
                  <th className="py-4 px-4">Product</th>
                  <th className="py-4 px-4">Adjustment Type</th>
                  <th className="py-4 px-4">Quantity Change</th>
                  <th className="py-4 px-4">Prev → New</th>
                  <th className="py-4 px-4">Mandatory Audit Reason</th>
                  <th className="py-4 px-4">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No stock adjustments recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map(adj => {
                    const isPositive = adj.quantity_change > 0;

                    return (
                      <tr key={adj.id} className="hover:bg-slate-800/50 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(adj.created_at).toLocaleDateString()}{' '}
                          <span className="text-slate-500">
                            {new Date(adj.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="py-3 px-4 font-bold text-white">
                          {adj.product_name || adj.product_id}
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            adj.adjustment_type === 'restock'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : adj.adjustment_type === 'cancellation_restore'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800'
                              : adj.adjustment_type === 'sale'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {adj.adjustment_type.replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Delta */}
                        <td className="py-3 px-4 font-mono font-black">
                          <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                            {isPositive ? `+${adj.quantity_change}` : adj.quantity_change}
                          </span>
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {adj.previous_quantity} → <strong className="text-white">{adj.new_quantity}</strong>
                        </td>

                        {/* Reason */}
                        <td className="py-3 px-4 text-slate-300 font-medium max-w-xs">
                          {adj.reason}
                        </td>

                        {/* Staff */}
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {adj.performed_by}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />
    </div>
  );
}
