'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
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
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const { showToast } = useToast();

  if (!isDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  const handleIncrement = (productId: string, currentQty: number, maxStock: number) => {
    if (currentQty >= maxStock) {
      showToast(`Only ${maxStock} available in stock.`, 'error');
      return;
    }
    const res = updateQuantity(productId, currentQty + 1);
    if (!res.success && res.message) {
      showToast(res.message, 'error');
    }
  };

  const handleDecrement = (productId: string, currentQty: number) => {
    updateQuantity(productId, currentQty - 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-up border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Your Grocery Basket</h3>
                <p className="text-xs text-slate-500">{itemCount} {itemCount === 1 ? 'item' : 'items'} in basket</p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-100">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              {amountNeededForFreeDelivery > 0 ? (
                <span className="text-emerald-900 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  Add <span className="font-bold text-emerald-700">₹{amountNeededForFreeDelivery.toFixed(2)}</span> more for FREE delivery!
                </span>
              ) : (
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  🎉 You unlocked FREE 30-Min Delivery!
                </span>
              )}
              <span className="text-emerald-700 font-bold">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">Your basket is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Explore our fresh organic produce, farm eggs, artisanal breads, and pantry essentials.
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden relative bg-slate-50 border border-slate-100 shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">
                      {item.product.name}
                    </h5>
                    <div className="text-[11px] text-slate-500">
                      {item.product.unit} • ₹{item.product.price.toFixed(2)} each
                    </div>
                    {item.product.stock_quantity <= item.product.reorder_level && (
                      <div className="text-[10px] text-amber-600 font-semibold">
                        Only {item.product.stock_quantity} left in stock
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => handleDecrement(item.product.id, item.quantity)}
                        className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleIncrement(item.product.id, item.quantity, item.product.stock_quantity)
                        }
                        className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Cost Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      `₹${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax</span>
                  <span className="font-semibold text-slate-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    View detailed cart →
                  </Link>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Guaranteed Fresh Checkout
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
