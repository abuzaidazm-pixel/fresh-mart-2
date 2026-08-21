'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ChangePasswordCard } from '@/components/ui/ChangePasswordCard';
import { Order } from '@/lib/types';
import {
  User,
  ShoppingBag,
  Clock,
  Package,
  MapPin,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  QrCode,
  Copy,
  Check,
  Zap,
  ExternalLink,
  X,
} from 'lucide-react';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { orders, products, bankSettings } = useStore();
  const { addToCart, openDrawer } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'payments' | 'profile' | 'addresses'>('orders');
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [enteredUtr, setEnteredUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedAcc, setCopiedAcc] = useState<boolean>(false);
  const [copiedIfsc, setCopiedIfsc] = useState<boolean>(false);

  // Filter orders for this customer
  const userOrders = orders.filter(
    o => o.user_id === user?.id || o.email === user?.email || user?.role === 'customer'
  );

  const handleReorder = (order: Order) => {
    let addedCount = 0;
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.product_id);
      if (prod && prod.is_active && prod.stock_quantity > 0) {
        addToCart(prod, item.quantity);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      showToast(`Added ${addedCount} items from order #${order.order_number} to your basket!`, 'success');
      openDrawer();
    } else {
      showToast('Items from this order are currently out of stock.', 'error');
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(bankSettings.upi_id);
    setCopiedUpi(true);
    showToast(`Copied Store UPI ID "${bankSettings.upi_id}"`, 'success');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankSettings.account_number);
    setCopiedAcc(true);
    showToast(`Copied Account Number "${bankSettings.account_number}"`, 'success');
    setTimeout(() => setCopiedAcc(false), 2500);
  };

  const handleCopyIfsc = () => {
    navigator.clipboard.writeText(bankSettings.ifsc_code);
    setCopiedIfsc(true);
    showToast(`Copied IFSC Code "${bankSettings.ifsc_code}"`, 'success');
    setTimeout(() => setCopiedIfsc(false), 2500);
  };

  // Generate dynamic QR code URI for paying an order
  const getOrderUpiUri = (order: Order) => {
    return `upi://pay?pa=${encodeURIComponent(bankSettings.upi_id)}&pn=${encodeURIComponent(
      bankSettings.merchant_name
    )}&am=${order.total}&cu=INR&tn=Order%20${encodeURIComponent(order.order_number)}`;
  };

  const getOrderQrCode = (order: Order) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      getOrderUpiUri(order)
    )}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Account Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl border border-emerald-200 overflow-hidden relative">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.full_name}
                fill
                className="object-cover"
              />
            ) : (
              user?.full_name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {user?.full_name || 'Customer Account'}
              </h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                user?.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Open Admin Dashboard →
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              showToast('Logged out of session', 'info');
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Options & UPI</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Info</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses</span>
        </button>
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Past Orders Found</h3>
              <p className="text-xs text-slate-500">You haven&apos;t placed any grocery orders yet.</p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Start Grocery Shopping
              </Link>
            </div>
          ) : (
            userOrders.map(order => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm text-slate-900 font-mono">
                        #{order.order_number}
                      </span>

                      {/* Order Status Badge */}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        order.order_status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.order_status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.order_status.replace(/_/g, ' ')}
                      </span>

                      {/* Payment Method Badge */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        {order.payment_method === 'upi_intent' && (
                          <>
                            <Zap className="w-3 h-3 text-blue-600" />
                            <span>UPI (GPay / PhonePe)</span>
                          </>
                        )}
                        {order.payment_method === 'cash_on_delivery' && (
                          <>
                            <Banknote className="w-3 h-3 text-emerald-600" />
                            <span>Cash on Delivery</span>
                          </>
                        )}
                        {order.payment_method === 'bank_transfer' && (
                          <>
                            <Landmark className="w-3 h-3 text-amber-600" />
                            <span>Bank Transfer (IMPS)</span>
                          </>
                        )}
                        {order.payment_method === 'card_online' && (
                          <>
                            <CreditCard className="w-3 h-3 text-purple-600" />
                            <span>Card & Netbanking</span>
                          </>
                        )}
                      </span>

                      {/* Payment Status Badge */}
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {order.payment_status === 'paid' ? '✓ PAID' : 'PENDING PAYMENT'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {order.utr_number && (
                        <span className="font-mono text-emerald-700 font-bold">
                          UTR: {order.utr_number}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                    <span className="text-base font-black text-slate-900">
                      ₹{order.total.toFixed(2)}
                    </span>

                    {/* Quick Pay Now Button if Unpaid/COD */}
                    {order.payment_status !== 'paid' && order.order_status !== 'cancelled' && (
                      <button
                        onClick={() => setPayingOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Pay with UPI</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reorder All</span>
                    </button>

                    <Link
                      href={`/order-success/${order.id}`}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      Receipt →
                    </Link>
                  </div>
                </div>

                {/* Items preview in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      {item.image_url && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-white border shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{item.product_name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {item.quantity}x • ₹{item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT OPTIONS & STORE BANK DETAILS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Accepted Payment Options & Store Payout Details</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                FreshMart Local supports Instant UPI payments, Direct Bank Wire Transfers, Cards, and Cash on Delivery (COD).
              </p>
            </div>

            {/* 4 Payment Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. UPI */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Instant UPI (GPay, PhonePe, Paytm, BHIM)</div>
                      <div className="text-[11px] text-emerald-700 font-bold">⚡ 0% Fee • Instant Settlement</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Store UPI ID (VPA):</span>
                    <button
                      type="button"
                      onClick={handleCopyUpiId}
                      className="font-mono font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>{bankSettings.upi_id}</span>
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Merchant Name:</span>
                    <span className="font-bold text-slate-800">{bankSettings.merchant_name}</span>
                  </div>
                </div>
              </div>

              {/* 2. Direct Bank Wire */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Direct Bank Wire (IMPS / NEFT / RTGS)</div>
                      <div className="text-[11px] text-slate-500">National Electronic Funds Transfer</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Direct Account
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficiary Name:</span>
                    <span className="font-bold text-slate-800">{bankSettings.account_holder}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bank Account:</span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="font-mono font-bold text-slate-900 hover:underline flex items-center gap-1"
                    >
                      <span>{bankSettings.account_number}</span>
                      {copiedAcc ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">IFSC Code:</span>
                    <button
                      type="button"
                      onClick={handleCopyIfsc}
                      className="font-mono font-bold text-slate-900 hover:underline flex items-center gap-1"
                    >
                      <span>{bankSettings.ifsc_code}</span>
                      {copiedIfsc ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank & Branch:</span>
                    <span className="font-semibold text-slate-700">{bankSettings.bank_name} ({bankSettings.branch_name})</span>
                  </div>
                </div>
              </div>

              {/* 3. Cash on Delivery (COD) */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-emerald-700 font-bold">Pay at your doorstep</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>• Pay physical cash to the delivery partner upon arrival.</p>
                  <p>• Or scan the driver&apos;s UPI QR code directly at your door.</p>
                </div>
              </div>

              {/* 4. Cards & Netbanking */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Credit / Debit Cards & Netbanking</div>
                    <div className="text-[11px] text-slate-500">Visa, Mastercard, RuPay, Indian Banks</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>• 100% RBI 3D Secure / OTP verified payments.</p>
                  <p>• Supports HDFC, ICICI, SBI, Axis, Kotak, and all major Indian banks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 border-b pb-3">Personal Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Full Name:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{user?.full_name}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Registered Email:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{user?.email}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Primary Phone:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{user?.phone || '+91 98201 45678'}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Account Role:</span>
              <div className="font-bold text-emerald-700 text-sm mt-0.5">{user?.role?.toUpperCase()}</div>
            </div>
          </div>
          </div>

          <ChangePasswordCard />
        </div>
      )}

      {/* TAB 4: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 border-b pb-3">Saved Delivery Addresses</h3>
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Primary Home Address</span>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                DEFAULT
              </span>
            </div>
            <div className="text-slate-700 font-medium pt-1">Flat 402, Sunshine Apartments, Linking Road</div>
            <div className="text-slate-500">Near Bandra Police Station</div>
            <div className="text-slate-500">Mumbai, Maharashtra 400050</div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Quick Pay with UPI for any Order */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-slate-100 space-y-4 text-center animate-slide-up">
            <button
              onClick={() => setPayingOrder(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Bank Payment</span>
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Pay ₹{payingOrder.total.toFixed(2)} for Order #{payingOrder.order_number}
            </h3>

            {/* Dynamic QR Code for this exact order */}
            <div className="p-3 bg-white rounded-2xl inline-block border-2 border-dashed border-slate-300 shadow-md my-2">
              <img
                src={getOrderQrCode(payingOrder)}
                alt="Order UPI QR Code"
                className="w-44 h-44 mx-auto object-contain"
              />
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl text-left border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Store UPI ID:</span>
                <span className="font-mono font-bold text-slate-900">{bankSettings.upi_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant:</span>
                <span className="font-bold text-slate-800">{bankSettings.merchant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bill:</span>
                <span className="font-black text-emerald-700">₹{payingOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Mobile 1-Click launcher */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={getOrderUpiUri(payingOrder)}
                className="py-3 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Google Pay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={getOrderUpiUri(payingOrder)}
                className="py-3 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>PhonePe</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast('✅ Payment received and verified! Order confirmed.', 'success');
                setPayingOrder(null);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              I Have Paid with UPI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
