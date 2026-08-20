'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { Order, OrderStatus } from '@/lib/types';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import {
  ClipboardList,
  Search,
  Truck,
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.order_status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(q) ||
        order.customer_name.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q) ||
        order.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleQuickStatus = async (orderId: string, newStatus: OrderStatus, orderNumber: string) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      if (newStatus === 'cancelled') {
        showToast(`Order #${orderNumber} cancelled. Stock restored to catalog.`, 'info');
      } else {
        showToast(`Order #${orderNumber} updated to "${newStatus.replace('_', ' ')}"`, 'success');
      }
    } else {
      showToast(res.error || 'Failed to update order status', 'error');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
      case 'cancelled':
        return 'bg-rose-950 text-rose-400 border border-rose-800';
      case 'out_for_delivery':
        return 'bg-sky-950 text-sky-400 border border-sky-800';
      case 'packed':
        return 'bg-indigo-950 text-indigo-400 border border-indigo-800';
      case 'confirmed':
        return 'bg-teal-950 text-teal-400 border border-teal-800';
      default:
        return 'bg-amber-950 text-amber-400 border border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Fulfillment Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Customer Orders & Dispatch ({orders.length} Total)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Process incoming orders, advance fulfillment status, and monitor deliveries
          </p>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'Pending', count: orders.filter(o => o.order_status === 'pending').length },
            { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.order_status === 'confirmed').length },
            { id: 'packed', label: 'Packed', count: orders.filter(o => o.order_status === 'packed').length },
            { id: 'out_for_delivery', label: 'Out for Delivery / Pickup', count: orders.filter(o => o.order_status === 'out_for_delivery').length },
            { id: 'completed', label: 'Completed', count: orders.filter(o => o.order_status === 'completed').length },
            { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.order_status === 'cancelled').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search orders by #FM number, customer name, phone, or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="py-4 px-4">Order #</th>
                <th className="py-4 px-4">Customer & Contact</th>
                <th className="py-4 px-4">Fulfillment</th>
                <th className="py-4 px-4">Time Window</th>
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Order Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No customer orders found in this view.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Order Number & Placed time */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-black text-amber-400">
                        #{order.order_number}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{order.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{order.phone}</div>
                    </td>

                    {/* Fulfillment */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        {order.fulfillment_type === 'delivery' ? (
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Store className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{order.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Pickup'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {order.items.length} {order.items.length === 1 ? 'grocery item' : 'grocery items'}
                      </div>
                    </td>

                    {/* Time Window */}
                    <td className="py-3 px-4 text-slate-300 font-medium text-[11px]">
                      {order.delivery_slot}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4">
                      <div className="font-black text-white">₹{order.total.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500 uppercase">
                        {order.payment_method.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={order.order_status}
                        onChange={e =>
                          handleQuickStatus(
                            order.id,
                            e.target.value as OrderStatus,
                            order.order_number
                          )
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl focus:outline-none cursor-pointer ${getStatusBadge(
                          order.order_status
                        )}`}
                      >
                        <option value="pending" className="bg-slate-900 text-white">Pending</option>
                        <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
                        <option value="packed" className="bg-slate-900 text-white">Packed</option>
                        <option value="out_for_delivery" className="bg-slate-900 text-white">Out for Delivery</option>
                        <option value="completed" className="bg-slate-900 text-white">Completed</option>
                        <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
      />
    </div>
  );
}
