'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import {
  Landmark,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Save,
  Zap,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Building,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export default function AdminBankSettingsPage() {
  const { bankSettings, updateBankSettings } = useStore();
  const { showToast } = useToast();

  const [upiId, setUpiId] = useState(bankSettings.upi_id || 'freshmart@okhdfcbank');
  const [merchantName, setMerchantName] = useState(bankSettings.merchant_name || 'FreshMart Local Grocery');
  const [accountHolder, setAccountHolder] = useState(bankSettings.account_holder || 'FreshMart Retail Private Limited');
  const [accountNumber, setAccountNumber] = useState(bankSettings.account_number || '50200084729102');
  const [ifscCode, setIfscCode] = useState(bankSettings.ifsc_code || 'HDFC0001234');
  const [bankName, setBankName] = useState(bankSettings.bank_name || 'HDFC Bank');
  const [branchName, setBranchName] = useState(bankSettings.branch_name || 'Indiranagar Branch, Bengaluru');
  const [accountType, setAccountType] = useState(bankSettings.account_type || 'Current Account');
  const [razorpayKeyId, setRazorpayKeyId] = useState(bankSettings.razorpay_key_id || 'rzp_test_freshmart123');

  const [testAmount, setTestAmount] = useState('100');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generate Sample Dynamic UPI URI for test preview
  const sampleUpiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    merchantName
  )}&am=${testAmount}&cu=INR&tn=FreshMart%20Test%20Order`;

  const sampleQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    sampleUpiUri
  )}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !upiId.includes('@')) {
      showToast('Please enter a valid Indian UPI ID (e.g. name@okhdfcbank)', 'error');
      return;
    }
    if (!accountNumber.trim() || !ifscCode.trim()) {
      showToast('Please provide Bank Account Number and IFSC Code', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateBankSettings({
        upi_id: upiId.trim(),
        merchant_name: merchantName.trim(),
        account_holder: accountHolder.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.trim().toUpperCase(),
        bank_name: bankName.trim(),
        branch_name: branchName.trim(),
        account_type: accountType,
        razorpay_key_id: razorpayKeyId.trim(),
      });
      showToast('✅ Bank Account & UPI Settings saved successfully! All store QR codes updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    }
    setIsSaving(false);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showToast(`Copied UPI ID "${upiId}" to clipboard`, 'success');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Landmark className="w-4 h-4" />
            <span>Direct Payment Gateway & Bank Account</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Indian Bank Account & UPI Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure your UPI VPA and Bank details to receive 100% of customer payments directly into your account
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-2xl text-xs font-bold shadow-sm self-start sm:self-auto">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>0% Fee Instant Settlement</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Bank & UPI Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* 1. Primary UPI Settings */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-md">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                UPI
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Primary UPI ID (Google Pay, PhonePe, Paytm, BHIM)</h3>
                <p className="text-xs text-slate-400">
                  Customers will scan or deep-link pay to this UPI ID on checkout
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Store UPI ID (VPA) *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="e.g. yourbusiness@okhdfcbank or 9876543210@paytm"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white placeholder:text-slate-600 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Works with GPay, PhonePe, Paytm, Cred, BHIM, Amazon Pay.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Display Business / Merchant Name *
                </label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  placeholder="e.g. FreshMart Grocery Store"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white placeholder:text-slate-600 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Shown to customer on Google Pay & PhonePe confirmation screens.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Direct Bank Account Details (IMPS / NEFT) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-md">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Direct Bank Wire Details (IMPS / NEFT / RTGS)</h3>
                <p className="text-xs text-slate-400">
                  Provided to customers who prefer direct bank account wire transfer
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Account Holder / Beneficiary Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value)}
                  placeholder="e.g. FreshMart Retail Private Limited"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="e.g. 50200084729102"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white font-mono text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Bank IFSC Code *
                </label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white font-mono text-sm uppercase font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank / ICICI Bank / SBI"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Branch Name & City
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  placeholder="e.g. Indiranagar Branch, Bengaluru"
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={e => setAccountType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Current Account">Current Account (Business)</option>
                  <option value="Savings Account">Savings Account (Individual)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Razorpay / Card Gateway Keys */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-md">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Razorpay Gateway API Key (Optional)</h3>
                <p className="text-xs text-slate-400">
                  For automated card, netbanking, and payment gateway verification in India
                </p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <label className="block font-bold text-slate-300">
                Razorpay Key ID (Client Key)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={e => setRazorpayKeyId(e.target.value)}
                  placeholder="e.g. rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 rounded-xl border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Get your key at{' '}
                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>dashboard.razorpay.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Settings...' : 'Save Bank & UPI Settings'}</span>
            </button>
          </div>
        </form>

        {/* Right 1 Column: Live UPI QR Code Simulator */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-md text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-[10px] font-black uppercase text-blue-300">
              <QrCode className="w-3.5 h-3.5" />
              <span>Live Storefront QR Test</span>
            </div>

            <h3 className="font-black text-white text-base">
              Scan to Pay with GPay / PhonePe
            </h3>
            <p className="text-xs text-slate-400">
              Test your UPI QR code directly on your mobile device
            </p>

            {/* Generated Dynamic QR Code */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl border border-slate-300 my-2">
              <img
                src={sampleQrUrl}
                alt="Dynamic UPI QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
            </div>

            <div className="space-y-2 text-xs text-left bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-slate-300">
                <span>Active UPI ID:</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>{upiId}</span>
                  {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Merchant:</span>
                <span className="font-bold text-white truncate max-w-[140px]">{merchantName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Test Amount:</span>
                <div className="flex items-center gap-1">
                  <span>₹</span>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={e => setTestAmount(e.target.value)}
                    className="w-16 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700 text-white font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl text-[11px] text-emerald-300 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Payments transfer directly into your linked bank account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
