'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    total,
    freeDeliveryThreshold,
    freeDeliveryProgress,
    amountNeededForFreeDelivery,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'FRESHMART5' || couponCode.trim().toUpperCase() === 'FRESH5') {
      if (subtotal < 15) {
        showToast('Coupon requires a minimum order of $15', 'error');
        return;
      }
      setCouponApplied(true);
      setDiscountAmount(5.0);
      showToast('🎉 Coupon FRESHMART5 applied! $5 discount granted', 'success');
    } else {
      showToast('Invalid promo code. Try "FRESHMART5"', 'error');
    }
  };

  const finalTotal = Math.max(0, Number((total - discountAmount).toFixed(2)));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Your Basket is Empty</h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any groceries in your basket yet. Discover our fresh farm produce and daily pantry essentials.
          </p>
        </div>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Farm Groceries</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Basket ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected groceries before proceeding to checkout
          </p>
        </div>
        <button
          onClick={() => {
            clearCart();
            showToast('Cleared your shopping basket', 'info');
          }}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold self-start sm:self-auto flex items-center gap-1 hover:underline"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Free Delivery Bar */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950">
              {amountNeededForFreeDelivery > 0 ? (
                <>Add <span className="text-emerald-700 font-black">₹{amountNeededForFreeDelivery.toFixed(2)}</span> more to unlock FREE Delivery!</>
              ) : (
                <>🎉 Congratulations! You have unlocked FREE 30-Min Neighborhood Delivery!</>
              )}
            </div>
            <div className="text-[11px] text-emerald-700">
              Standard 30-minute delivery threshold is ₹{freeDeliveryThreshold.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="w-full sm:w-48 bg-emerald-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* Grid: Cart Items List + Order Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items Table/Cards */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div
              key={item.product.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Product Info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative bg-slate-50 border border-slate-100 shrink-0">
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors truncate">
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Unit: <span className="font-semibold text-slate-700">{item.product.unit}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    ₹{item.product.price.toFixed(2)} each
                  </div>
                  {item.product.stock_quantity <= item.product.reorder_level && (
                    <div className="text-[10px] text-amber-600 font-semibold mt-1">
                      ⚠️ Only {item.product.stock_quantity} remaining in stock
                    </div>
                  )}
                </div>
              </div>

              {/* Stepper and Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800 min-w-[28px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      if (item.quantity >= item.product.stock_quantity) {
                        showToast(`Only ${item.product.stock_quantity} available in stock.`, 'error');
                        return;
                      }
                      updateQuantity(item.product.id, item.quantity + 1);
                    }}
                    className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[70px]">
                  <div className="text-sm font-black text-slate-900">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[11px] text-slate-400 hover:text-rose-600 mt-1 inline-block"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Adding More Groceries</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary
          </h2>

          {/* Coupon Code Section */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Promo Code</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="e.g. FRESHMART5"
                  className="w-full pl-8 pr-3 py-2 text-xs uppercase font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Apply
              </button>
            </div>
            {couponApplied && (
              <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                ₹50.00 discount applied!
              </div>
            )}
          </form>

          {/* Financial Breakdown */}
          <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>

            {couponApplied && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Estimated Delivery Fee</span>
              <span className="font-semibold text-slate-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `₹${deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>GST Tax (5%)</span>
              <span className="font-semibold text-slate-900">₹{tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Estimated Total</span>
              <span className="text-emerald-700">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure 256-bit encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
