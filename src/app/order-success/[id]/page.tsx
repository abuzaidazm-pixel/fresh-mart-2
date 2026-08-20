'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import confetti from 'canvas-confetti';
import LiveDriverTrackingMap from '@/components/storefront/LiveDriverTrackingMap';
import {
  CheckCircle2,
  Package,
  Truck,
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  Printer,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

interface OrderSuccessPageProps {
  params: {
    id: string;
  };
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orders } = useStore();
  const order = orders.find(o => o.id === params.id || o.order_number === params.id);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore if canvas not supported
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-sm text-slate-500">We could not locate this order record.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Return to Store Home</span>
        </Link>
      </div>
    );
  }

  const stages = [
    { label: 'Order Placed', status: 'pending', done: true },
    {
      label: 'Confirmed',
      status: 'confirmed',
      done: ['confirmed', 'packed', 'out_for_delivery', 'completed'].includes(order.order_status),
    },
    {
      label: 'Packed in Bags',
      status: 'packed',
      done: ['packed', 'out_for_delivery', 'completed'].includes(order.order_status),
    },
    {
      label: order.fulfillment_type === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery',
      status: 'out_for_delivery',
      done: ['out_for_delivery', 'completed'].includes(order.order_status),
    },
    {
      label: 'Completed',
      status: 'completed',
      done: order.order_status === 'completed',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Hero Confirmation Card */}
      <div className="bg-gradient-to-tr from-emerald-900 to-emerald-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-white text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-200 uppercase tracking-widest">
            Order Confirmed & Stock Reserved
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
            Your grocery order <span className="font-mono font-bold text-amber-300">#{order.order_number}</span> has been received and is being prepared by our store team.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
          <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Time Window: {order.delivery_slot}</span>
          </span>
          <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5">
            {order.fulfillment_type === 'delivery' ? (
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Store className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span>
              {order.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
            </span>
          </span>
        </div>
      </div>

      {/* Live 5-Stage Fulfillment Tracker */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center justify-between">
          <span>Live Order Fulfillment Timeline</span>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Current Status: {order.order_status.replace('_', ' ')}
          </span>
        </h3>

        <div className="grid grid-cols-5 gap-2 pt-2">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  stage.done
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {stage.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium leading-tight ${stage.done ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Google Map & Express Delivery Driver Tracking */}
      {order.fulfillment_type === 'delivery' && (
        <LiveDriverTrackingMap
          orderNumber={order.order_number}
          customerName={order.customer_name}
          destinationAddress={`${order.address.street}, ${order.address.city}`}
          orderStatus={order.order_status}
        />
      )}

      {/* Order Summary & Receipt Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Receipt Details</h3>
            <div className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900">Recipient & Contact</div>
            <div>{order.customer_name}</div>
            <div>{order.phone}</div>
            <div>{order.email}</div>
            <div className="pt-2 text-slate-500 font-mono text-[11px]">
              Order ID: #{order.order_number}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900">
              {order.fulfillment_type === 'delivery' ? 'Delivery Destination' : 'Pickup Point'}
            </div>
            <div>{order.address.street}</div>
            {order.address.landmark && <div>Landmark: {order.address.landmark}</div>}
            <div>{order.address.city}, {order.address.postal_code}</div>
            
            <div className="pt-2 border-t border-slate-200 mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Payment:</span>
                <span className="capitalize font-semibold text-slate-700">
                  {order.payment_method === 'upi_intent'
                    ? '⚡ UPI Direct Bank Transfer'
                    : order.payment_method === 'bank_transfer'
                    ? '🏛️ Direct IMPS / NEFT Transfer'
                    : order.payment_method === 'card_online'
                    ? `💳 ${order.payment_details?.card_brand || 'Card'} (${order.payment_details?.card_last4 ? `•••• ${order.payment_details.card_last4}` : 'Online'})`
                    : order.payment_method === 'cash_on_delivery'
                    ? '💵 Cash on Delivery'
                    : order.payment_method.replace(/_/g, ' ')}
                  {order.payment_details?.wallet_provider && ` (${order.payment_details.wallet_provider})`}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    order.payment_status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
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
                  Transaction Ref: {order.transaction_id}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100">
          {order.items.map(item => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                {item.image_url && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-slate-50 border shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="40px"
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

        {/* Financials Totals */}
        <div className="border-t border-slate-100 pt-4 space-y-1.5 text-xs">
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
            <span>Grand Total</span>
            <span className="text-emerald-700">₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/account"
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition-colors"
          >
            View in My Orders History
          </Link>
          <Link
            href="/products"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Continue Shopping FreshMart</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
