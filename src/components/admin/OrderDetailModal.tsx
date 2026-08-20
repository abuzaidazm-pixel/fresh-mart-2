'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Order, OrderStatus } from '@/lib/types';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  ClipboardList,
  Clock,
  MapPin,
  Phone,
  Mail,
  Truck,
  Store,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { updateOrderStatus } = useStore();
  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order?.order_status || 'pending'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.order_status);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateOrderStatus(order.id, selectedStatus);
    if (res.success) {
      if (selectedStatus === 'cancelled') {
        showToast(`Order #${order.order_number} cancelled. Stock automatically restored to catalog!`, 'info');
      } else {
        showToast(`Order #${order.order_number} updated to "${selectedStatus.replace('_', ' ')}"`, 'success');
      }
      onClose();
    } else {
      showToast(res.error || 'Failed to update order status', 'error');
    }
    setIsUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-slate-100 my-8 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">Order #{order.order_number}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                order.order_status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.order_status === 'cancelled'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {order.order_status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status Update Control Form */}
        <form onSubmit={handleStatusChange} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Update Fulfillment Status:
              </label>
              <div className="text-[11px] text-slate-500">
                Advancing status updates tracking timeline for the customer
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="pending">Pending (New)</option>
                <option value="confirmed">Confirmed</option>
                <option value="packed">Packed in Bags</option>
                <option value="out_for_delivery">Out for Delivery / Ready</option>
                <option value="completed">Completed (Delivered / Collected)</option>
                <option value="cancelled">Cancelled (Restore Stock)</option>
              </select>

              <button
                type="submit"
                disabled={isUpdating || selectedStatus === order.order_status}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </div>

          {selectedStatus === 'cancelled' && order.order_status !== 'cancelled' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Stock Safeguard:</strong> Saving as Cancelled will automatically replenish item quantities back into catalog inventory and log a cancellation audit adjustment.
              </span>
            </div>
          )}
        </form>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 mb-6">
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Customer Information</span>
            </div>
            <div>{order.customer_name}</div>
            <div>{order.phone}</div>
            <div>{order.email}</div>
            <div className="pt-2 border-t border-slate-100 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Payment:</span>
                <span className="capitalize text-slate-700 font-semibold">
                  {order.payment_method.replace(/_/g, ' ')}
                  {order.payment_details?.card_last4 && ` (•••• ${order.payment_details.card_last4})`}
                  {order.payment_details?.wallet_provider && ` (${order.payment_details.wallet_provider})`}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.payment_status}
                </span>
              </div>
              {order.utr_number && (
                <div className="text-[11px] font-mono text-emerald-800 font-bold">
                  UPI / Bank UTR: {order.utr_number}
                </div>
              )}
              {order.transaction_id && (
                <div className="text-[11px] font-mono text-slate-500 font-medium">
                  Transaction: {order.transaction_id}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              {order.fulfillment_type === 'delivery' ? (
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Store className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{order.fulfillment_type === 'delivery' ? 'Home Delivery' : 'In-Store Pickup'}</span>
            </div>
            <div>{order.address.street}</div>
            {order.address.landmark && <div>Landmark: {order.address.landmark}</div>}
            <div>{order.address.city}, {order.address.postal_code}</div>
            <div className="text-slate-500 pt-1">Time Slot: {order.delivery_slot}</div>
            {order.notes && <div className="text-amber-800 font-medium">Notes: {order.notes}</div>}
          </div>
        </div>

        {/* Order Line Items */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Order Items ({order.items.length})
          </div>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-white max-h-48 overflow-y-auto">
            {order.items.map(item => (
              <div key={item.id} className="py-2.5 px-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {item.image_url && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden relative bg-slate-50 border shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{item.product_name}</div>
                    <div className="text-slate-500 text-[11px]">{item.unit} • ₹{item.unit_price.toFixed(2)} each</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">₹{item.subtotal.toFixed(2)}</div>
                  <div className="text-[11px] text-slate-500">Qty: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee</span>
            <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>GST Tax (5%)</span>
            <span>₹{order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Order Total</span>
            <span className="text-emerald-700">₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Close CTA */}
        <div className="flex justify-end pt-5 border-t border-slate-100 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
