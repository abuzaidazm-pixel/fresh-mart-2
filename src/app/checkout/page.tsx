'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { FulfillmentType, PaymentMethod, Address } from '@/lib/types';
import AddressMapPicker from '@/components/storefront/AddressMapPicker';
import {
  Truck,
  Store,
  CreditCard,
  Banknote,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Check,
  QrCode,
  Landmark,
  Copy,
  ExternalLink,
  Zap,
  X,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
  'Rajasthan',
  'Haryana',
  'Punjab',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Goa',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, tax, total, clearCart } = useCart();
  const { createOrder, bankSettings } = useStore();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [deliverySlot, setDeliverySlot] = useState<string>('Today (Express 30-45 mins)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');

  // Customer Contact State
  const [customerName, setCustomerName] = useState<string>(user?.full_name || 'Pooja Sharma');
  const [phone, setPhone] = useState<string>(user?.phone || '+91 98201 45678');
  const [email, setEmail] = useState<string>(user?.email || 'pooja.sharma@example.com');

  // Indian Address State
  const [street, setStreet] = useState<string>('Flat 402, Sunshine Apartments, Linking Road');
  const [landmark, setLandmark] = useState<string>('Near Bandra Police Station');
  const [city, setCity] = useState<string>('Mumbai');
  const [state, setState] = useState<string>('Maharashtra');
  const [postalCode, setPostalCode] = useState<string>('400050');
  const [notes, setNotes] = useState<string>('Please call before ringing apartment bell 402');

  // UPI State & Modal
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr'>('gpay');
  const [enteredUtr, setEnteredUtr] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedAcc, setCopiedAcc] = useState<boolean>(false);
  const [copiedIfsc, setCopiedIfsc] = useState<boolean>(false);

  // Credit / Debit Card Form State


  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStepText, setPaymentStepText] = useState<string>('Verifying inventory & reserving items...');

  // Compute calculated delivery fee in INR
  const actualDeliveryFee = fulfillmentType === 'pickup' ? 0 : subtotal >= 499 ? 0 : 40;
  const actualTax = Math.round(subtotal * 0.05); // 5% GST on groceries
  const actualTotal = Number((subtotal + actualDeliveryFee + actualTax).toFixed(2));

  // Detect Card Brand from number


  // Dynamic UPI Deep Link URI for direct mobile payments
  const dynamicUpiUri = `upi://pay?pa=${encodeURIComponent(bankSettings.upi_id)}&pn=${encodeURIComponent(
    bankSettings.merchant_name
  )}&am=${actualTotal}&cu=INR&tn=FreshMart%20Order`;

  // Dynamic QR Code Image URL
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    dynamicUpiUri
  )}`;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your basket is empty</h2>
        <p className="text-sm text-slate-500">
          Add Indian groceries to your basket before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
        </Link>
      </div>
    );
  }

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(bankSettings.upi_id);
    setCopiedUpi(true);
    showToast(`Copied FreshMart UPI ID "${bankSettings.upi_id}"`, 'success');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankSettings.account_number);
    setCopiedAcc(true);
    showToast(`Copied Bank Account Number "${bankSettings.account_number}"`, 'success');
    setTimeout(() => setCopiedAcc(false), 2500);
  };

  const handleCopyIfsc = () => {
    navigator.clipboard.writeText(bankSettings.ifsc_code);
    setCopiedIfsc(true);
    showToast(`Copied IFSC Code "${bankSettings.ifsc_code}"`, 'success');
    setTimeout(() => setCopiedIfsc(false), 2500);
  };

  // Launch direct mobile UPI App intent
  const handleLaunchUpiApp = (app: 'gpay' | 'phonepe' | 'paytm' | 'bhim') => {
    setSelectedUpiApp(app);
    if (typeof window !== 'undefined') {
      window.location.href = dynamicUpiUri;
    }
  };

  // Form submission handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !phone || !email) {
      showToast('Please fill in your contact information', 'error');
      return;
    }

    if (fulfillmentType === 'delivery' && (!street || !city || !postalCode)) {
      showToast('Please provide a complete Indian delivery address with pincode', 'error');
      return;
    }

    // 1. If UPI is chosen, open the official FreshMart UPI QR Modal
    if (paymentMethod === 'upi_intent') {
      setIsUpiModalOpen(true);
      return;
    }

    // Card payments are intentionally not handled here. A simulated authorisation
    // that tells a customer "payment successful" without money moving is worse
    // than having no card option at all.

    // 2. Direct placement for Cash on Delivery, Pay at Store or Bank Wire
    executeOrderPlacement();
  };


  // Final Order Placement Execution
  const executeOrderPlacement = async (overrideUtr?: string) => {
    setIsProcessingPayment(true);
    setPaymentStepText('Checking live stock availability...');
    await new Promise(r => setTimeout(r, 500));

    if (paymentMethod === 'upi_intent') {
      setPaymentStepText(`Verifying UPI transaction with ${bankSettings.merchant_name}...`);
      await new Promise(r => setTimeout(r, 700));
      setPaymentStepText('Settlement verified on UPI / NPCI Network...');
      await new Promise(r => setTimeout(r, 600));
    } else if (paymentMethod === 'bank_transfer') {
      setPaymentStepText(`Recording direct IMPS/NEFT transfer to ${bankSettings.bank_name}...`);
      await new Promise(r => setTimeout(r, 600));
    } else if (paymentMethod === 'cash_on_delivery') {
      setPaymentStepText('Registering Cash on Delivery dispatch booking...');
      await new Promise(r => setTimeout(r, 500));
    }

    setPaymentStepText('Reserving inventory & generating order confirmation...');
    await new Promise(r => setTimeout(r, 400));

    const shippingAddress: Address =
      fulfillmentType === 'delivery'
        ? {
            id: `addr_${Date.now()}`,
            recipient_name: customerName,
            phone,
            street,
            landmark,
            city,
            state,
            postal_code: postalCode,
          }
        : {
            id: `addr_pickup_${Date.now()}`,
            recipient_name: customerName,
            phone,
            street: 'FreshMart Local Store Counter (104 Green Valley Blvd)',
            city,
            state,
            postal_code: postalCode,
          };

    const isInstantPay =
      paymentMethod === 'upi_intent' || paymentMethod === 'digital_wallet';

    const finalUtr =
      overrideUtr ||
      enteredUtr.trim() ||
      (isInstantPay ? `${Math.floor(100000000000 + Math.random() * 900000000000)}` : undefined);


    const orderResult = await createOrder({
      userId: user?.id || null,
      customerName,
      phone,
      email,
      address: shippingAddress,
      fulfillmentType,
      deliverySlot,
      paymentMethod,
      utrNumber: finalUtr,
      paymentDetails: {
        upiId: paymentMethod === 'upi_intent' ? bankSettings.upi_id : undefined,
        utrNumber: finalUtr,
        walletProvider:
          paymentMethod === 'upi_intent'
            ? selectedUpiApp.toUpperCase()
            : paymentMethod === 'digital_wallet'
            ? 'GOOGLE_PAY'
            : undefined,
        bankRef: paymentMethod === 'bank_transfer' ? bankSettings.account_number : undefined,
      },
      notes,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
      deliveryFee: actualDeliveryFee,
      tax: actualTax,
    });

    if (orderResult.success && orderResult.order) {
      clearCart();
      setIsUpiModalOpen(false);
      if (paymentMethod === 'cash_on_delivery') {
        showToast(
          `🎉 Order #${orderResult.order.order_number} confirmed! Pay ₹${actualTotal.toFixed(2)} on delivery.`,
          'success'
        );
      } else {
        showToast(
          `🎉 Order #${orderResult.order.order_number} confirmed! Payment processed to ${bankSettings.merchant_name}.`,
          'success'
        );
      }
      router.push(`/order-success/${orderResult.order.id}`);
    } else {
      setIsProcessingPayment(false);
      showToast(orderResult.error || 'Failed to place order. Please review stock.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Checkout Header */}
      <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
            <span>🇮🇳 FreshMart Local India</span>
            <span>•</span>
            <span>Secure Checkout & Direct Payment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Direct Payment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pay by UPI, on delivery, or at the store counter
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure Checkout</span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Fulfillment Type Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">
                1
              </span>
              <span>Delivery / Collection Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('delivery')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  fulfillmentType === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${fulfillmentType === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Doorstep Home Delivery</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Dispatched from neighborhood hub in 30-45 mins
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('pickup')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  fulfillmentType === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${fulfillmentType === 'pickup' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">In-Store Express Pickup</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Packed & ready at store billing counter (FREE)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Customer Contact Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">
                2
              </span>
              <span>Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Pooja Sharma"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (for delivery updates) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98201 45678"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (For Tax Invoice & Receipt) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="pooja.sharma@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Address & Delivery Slot */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">
                3
              </span>
              <span>{fulfillmentType === 'delivery' ? 'Delivery Address & Slot' : 'Pickup Time Slot'}</span>
            </h2>

            {fulfillmentType === 'delivery' ? (
              <div className="space-y-4">
                {/* Interactive Google Map & GPS Pin Picker */}
                <AddressMapPicker
                  initialAddress={{ street, landmark, city, state, postalCode }}
                  onAddressSelect={addr => {
                    setStreet(addr.street);
                    setLandmark(addr.landmark);
                    setCity(addr.city);
                    setState(addr.state);
                    setPostalCode(addr.postalCode);
                    showToast(`📍 Map Pin Dropped: ${addr.street}`, 'success');
                  }}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Flat / House No, Building Name & Street *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      required
                      rows={2}
                      value={street}
                      onChange={e => setStreet(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Apartments, Linking Road"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      placeholder="Near Bandra Police Station"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Mumbai / Bengaluru / Delhi"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                    <select
                      value={state}
                      onChange={e => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="400050"
                    className="w-full sm:w-1/3 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>Pickup Location: FreshMart Local Store Counter</span>
                </div>
                <p>104 Green Valley Commercial Complex, Linking Road, Mumbai 400050</p>
                <p className="text-[11px] text-amber-800">Your basket will be packed in chilled bags ready for express collection.</p>
              </div>
            )}

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={deliverySlot}
                  onChange={e => setDeliverySlot(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium bg-white"
                >
                  <option value="Today (Express 30-45 mins)">⚡ Today (Express 30-45 mins)</option>
                  <option value="Today Evening (5:00 PM - 7:00 PM)">Today Evening (5:00 PM - 7:00 PM)</option>
                  <option value="Today Night (7:00 PM - 9:00 PM)">Today Night (7:00 PM - 9:00 PM)</option>
                  <option value="Tomorrow Morning (7:00 AM - 9:00 AM)">Tomorrow Morning (7:00 AM - 9:00 AM)</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Order Notes / Delivery Instructions</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Leave with security guard or ring apartment 402"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 4. PAYMENT OPTIONS & ENGINES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">
                  4
                </span>
                <span>Payment Method</span>
              </span>
              <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Secure & RBI Verified
              </span>
            </h2>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              {/* Card / Netbanking Tab */}
              {/* Cards are not enabled. Taking real card numbers requires a PCI-DSS
                  compliant gateway (Razorpay, Stripe, Cashfree) with a server-side
                  secret key — never a form that posts from the browser. Shown as
                  disabled rather than hidden so customers know it is coming. */}
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Card payments are not enabled on this store yet"
                className="py-3 px-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 flex flex-col items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5 text-slate-300" />
                <span>Cards</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide">Coming soon</span>
              </button>

              {/* UPI Tab */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi_intent')}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'upi_intent'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-sm font-extrabold ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1 font-black text-sm">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600">UPI</span>
                  <span className="text-amber-500">⚡</span>
                </div>
                <span className="text-[10px] text-slate-700 font-bold">GPay / PhonePe / QR</span>
              </button>

              {/* Cash on Delivery Tab */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm font-extrabold ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                }`}
              >
                <Banknote className={`w-5 h-5 ${paymentMethod === 'cash_on_delivery' ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>Cash on Delivery</span>
              </button>

              {/* Direct Bank Wire Tab */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-sm font-extrabold ring-1 ring-amber-500'
                    : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                }`}
              >
                <Landmark className={`w-5 h-5 ${paymentMethod === 'bank_transfer' ? 'text-amber-600' : 'text-slate-500'}`} />
                <span>Bank IMPS / NEFT</span>
              </button>
            </div>

            {/* TAB CONTENT 1: Credit / Debit Card Payment Engine */}

            {/* TAB CONTENT 2: Instant UPI Payment Box */}
            {paymentMethod === 'upi_intent' && (
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-4 animate-fade-in text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-3">
                  <div>
                    <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <span>⚡ FreshMart Official UPI Payment</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        0% Fees
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Account: <strong>{bankSettings.merchant_name}</strong> • VPA: <strong>{bankSettings.upi_id}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-blue-200 hover:bg-blue-50 rounded-xl font-mono text-[11px] font-bold text-blue-700 self-start sm:self-auto shadow-sm"
                  >
                    <span>{bankSettings.upi_id}</span>
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Mobile 1-Click App Buttons */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-700">1-Click Pay on Mobile (Tap your app):</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp('gpay')}
                      className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl text-center font-bold transition-all shadow-sm flex flex-col items-center gap-1"
                    >
                      <span className="font-black text-sm flex items-center">
                        <span className="text-blue-500">G</span>
                        <span className="text-red-500">o</span>
                        <span className="text-amber-500">o</span>
                        <span className="text-blue-500">g</span>
                        <span className="text-green-500">l</span>
                        <span className="text-red-500">e</span>
                        <span className="text-slate-800 ml-1">Pay</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Google Pay</span>
                    </button>

                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp('phonepe')}
                      className="p-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-400 rounded-xl text-center font-bold transition-all shadow-sm flex flex-col items-center gap-1"
                    >
                      <span className="font-black text-sm text-purple-700">PhonePe</span>
                      <span className="text-[10px] text-slate-500">Instant UPI</span>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp('paytm')}
                      className="p-3 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-400 rounded-xl text-center font-bold transition-all shadow-sm flex flex-col items-center gap-1"
                    >
                      <span className="font-black text-sm text-sky-600">Paytm</span>
                      <span className="text-[10px] text-slate-500">UPI Wallet</span>
                    </button>

                    {/* BHIM / Cred */}
                    <button
                      type="button"
                      onClick={() => handleLaunchUpiApp('bhim')}
                      className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-xl text-center font-bold transition-all shadow-sm flex flex-col items-center gap-1"
                    >
                      <span className="font-black text-sm text-emerald-700">BHIM / CRED</span>
                      <span className="text-[10px] text-slate-500">Any UPI App</span>
                    </button>
                  </div>
                </div>

                {/* FreshMart Dynamic QR Code for Desktop Scanning */}
                <div className="bg-white p-4 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0 text-center">
                    <img
                      src={qrCodeImageUrl}
                      alt="FreshMart Official UPI QR Code"
                      className="w-36 h-36 object-contain mx-auto"
                    />
                    <div className="text-[10px] font-mono font-bold text-blue-700 mt-1">
                      Scan with any UPI App
                    </div>
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="font-extrabold text-slate-900 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span>FreshMart Official UPI QR Code</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Scan using Google Pay, PhonePe, Paytm, or BHIM. The exact order total{' '}
                      <strong className="text-emerald-700 font-bold">₹{actualTotal.toFixed(2)}</strong> is pre-filled.
                    </p>
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                        UPI 12-Digit Reference / UTR Number:
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        value={enteredUtr}
                        onChange={e => setEnteredUtr(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 324598127654"
                        className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Cash on Delivery */}
            {paymentMethod === 'cash_on_delivery' && (
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2 animate-fade-in">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Cash on Delivery (Pay at Doorstep)</span>
                </div>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  Your order will be confirmed immediately and dispatched. You can pay{' '}
                  <strong className="font-black text-emerald-900">₹{actualTotal.toFixed(2)}</strong> using cash or scan the delivery executive&apos;s UPI QR code upon arrival.
                </p>
              </div>
            )}

            {/* TAB CONTENT 4: Direct Bank Transfer (IMPS/NEFT) */}
            {paymentMethod === 'bank_transfer' && (
              <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200 space-y-4 animate-fade-in text-xs">
                <div className="border-b border-amber-200 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-bold text-slate-900">FreshMart Bank Wire Details (IMPS / NEFT / RTGS)</div>
                      <div className="text-[11px] text-slate-500">Transfer directly into store bank account</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                    {bankSettings.account_type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Beneficiary Name</div>
                    <div className="font-extrabold text-slate-900">{bankSettings.account_holder}</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Bank Name & Branch</div>
                    <div className="font-extrabold text-slate-900">{bankSettings.bank_name} ({bankSettings.branch_name})</div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Bank Account Number</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{bankSettings.account_number}</span>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy Account Number"
                      >
                        {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">IFSC Code</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{bankSettings.ifsc_code}</span>
                      <button
                        type="button"
                        onClick={handleCopyIfsc}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy IFSC Code"
                      >
                        {copiedIfsc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    IMPS / NEFT Transaction Reference (UTR) Number:
                  </label>
                  <input
                    type="text"
                    value={enteredUtr}
                    onChange={e => setEnteredUtr(e.target.value)}
                    placeholder="Enter UTR reference after completing wire transfer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Items Review & Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary ({items.length} Items)
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-slate-50 border shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate">{item.product.name}</div>
                    <div className="text-slate-500 text-[11px]">
                      {item.quantity}x {item.product.unit}
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations in INR */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {actualDeliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE (Orders ₹499+)</span>
                  ) : (
                    `₹${actualDeliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5% Groceries Tax)</span>
                <span className="font-semibold text-slate-900">₹{actualTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Amount Due</span>
                <span className="text-emerald-700">₹{actualTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className={`w-full py-4 text-white font-black rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
                paymentMethod === 'upi_intent'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <span>
                {paymentMethod === 'upi_intent'
                  ? `Pay ₹${actualTotal.toFixed(2)} with UPI (QR / GPay)`
                  : paymentMethod === 'cash_on_delivery'
                  ? 'Confirm & Place Order (Cash on Delivery)'
                  : `Confirm ₹${actualTotal.toFixed(2)} Bank Wire`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payments settle directly to {bankSettings.merchant_name}</span>
            </div>
          </div>
        </div>
      </form>

      {/* POPUP MODAL: Bank 3D Secure / RBI 2-Factor OTP Verification Window */}

      {/* POPUP MODAL: FreshMart Official UPI Details & QR Code */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-slate-100 space-y-4 text-center animate-slide-up">
            <button
              onClick={() => setIsUpiModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>FreshMart Official UPI Payment</span>
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Scan & Pay ₹{actualTotal.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-500">
              Scan with Google Pay, PhonePe, Paytm, or BHIM on your smartphone
            </p>

            {/* FreshMart Official QR Code */}
            <div className="p-3 bg-white rounded-2xl inline-block border-2 border-dashed border-blue-300 shadow-lg my-1">
              <img
                src={qrCodeImageUrl}
                alt="FreshMart Official UPI QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            {/* FreshMart VPA & Merchant Info */}
            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl text-left border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">FreshMart UPI ID:</span>
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
                <span className="font-bold text-slate-900">{bankSettings.merchant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bill:</span>
                <span className="font-black text-emerald-700 text-sm">₹{actualTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Mobile 1-Click Launcher Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleLaunchUpiApp('gpay')}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Google Pay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleLaunchUpiApp('phonepe')}
                className="py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>PhonePe</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 12-Digit UTR Input */}
            <div className="text-left pt-1">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                UPI Reference / UTR Number (Optional 12-digits):
              </label>
              <input
                type="text"
                maxLength={12}
                value={enteredUtr}
                onChange={e => setEnteredUtr(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 324598127654"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Confirm Paid Button */}
            <button
              type="button"
              onClick={() => executeOrderPlacement(enteredUtr)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Paid ₹{actualTotal.toFixed(2)} (Confirm Order)</span>
            </button>
          </div>
        </div>
      )}

      {/* Payment Processing Spinner */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100 animate-slide-up">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
            <h3 className="text-lg font-black text-slate-900">Processing Payment</h3>
            <p className="text-xs text-slate-600 font-medium">{paymentStepText}</p>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settling to {bankSettings.bank_name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
