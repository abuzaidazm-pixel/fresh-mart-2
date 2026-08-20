'use client';

import React, { useState } from 'react';
import { Product, AdjustmentType } from '@/lib/types';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  Boxes,
  PlusCircle,
  MinusCircle,
  AlertOctagon,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { adjustStock } = useStore();
  const { showToast } = useToast();

  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('restock');
  const [quantityValue, setQuantityValue] = useState<string>('10');
  const [reason, setReason] = useState<string>('Morning vendor shipment received');
  const [staffName, setStaffName] = useState<string>('Alex Vance (Store Manager)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const prevStock = product.stock_quantity;
  const numValue = parseInt(quantityValue, 10) || 0;

  // Calculate projected new stock
  let calculatedChange = 0;
  let projectedStock = prevStock;

  if (adjustmentType === 'restock') {
    calculatedChange = Math.abs(numValue);
    projectedStock = prevStock + calculatedChange;
  } else if (adjustmentType === 'damaged' || adjustmentType === 'expired') {
    calculatedChange = -Math.abs(numValue);
    projectedStock = Math.max(0, prevStock - Math.abs(numValue));
  } else if (adjustmentType === 'manual_count') {
    projectedStock = Math.max(0, numValue);
    calculatedChange = projectedStock - prevStock;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please provide a reason for the inventory adjustment', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await adjustStock(
      product.id,
      adjustmentType,
      calculatedChange,
      reason,
      staffName
    );

    if (res.success) {
      showToast(
        `Adjusted stock for ${product.name}: ${prevStock} -> ${projectedStock} units`,
        'success'
      );
      onClose();
    } else {
      showToast(res.error || 'Failed to adjust stock', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-slate-100 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Inventory Stock Adjustment</h3>
            <p className="text-xs text-slate-500 truncate max-w-xs font-semibold">
              {product.name} ({product.unit})
            </p>
          </div>
        </div>

        {/* Stock Delta Preview Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-5 flex items-center justify-between">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Stock</div>
            <div className="text-xl font-black text-slate-800">{prevStock}</div>
          </div>

          <div className="flex flex-col items-center">
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              calculatedChange > 0
                ? 'bg-emerald-100 text-emerald-800'
                : calculatedChange < 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-200 text-slate-700'
            }`}>
              {calculatedChange > 0 ? `+${calculatedChange}` : calculatedChange}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 mt-1" />
          </div>

          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-emerald-700">Projected Stock</div>
            <div className="text-xl font-black text-emerald-700">{projectedStock}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Adjustment Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Adjustment Action *</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('restock');
                  setReason('Vendor shipment received');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center gap-1.5 transition-all ${
                  adjustmentType === 'restock'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Add Stock (Restock)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('damaged');
                  setReason('Damaged / bruised in handling');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center gap-1.5 transition-all ${
                  adjustmentType === 'damaged'
                    ? 'bg-rose-50 text-rose-800 border-rose-500'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <MinusCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Remove Damaged</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('expired');
                  setReason('Expired / past best before date');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center gap-1.5 transition-all ${
                  adjustmentType === 'expired'
                    ? 'bg-amber-50 text-amber-800 border-amber-500'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Remove Expired</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('manual_count');
                  setQuantityValue(String(prevStock));
                  setReason('Periodic physical shelf audit');
                }}
                className={`py-2 px-3 rounded-xl border flex items-center gap-1.5 transition-all ${
                  adjustmentType === 'manual_count'
                    ? 'bg-sky-50 text-sky-800 border-sky-500'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <ClipboardCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Manual Shelf Count</span>
              </button>
            </div>
          </div>

          {/* Units Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {adjustmentType === 'manual_count' ? 'Actual Physical Count Units *' : 'Number of Units to Change *'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantityValue}
              onChange={e => setQuantityValue(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-black text-slate-800"
            />
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mandatory Reason (For Audit Log) *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Received 20 fresh crates from Valley Farms"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Performed By Staff */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Staff Member Name</label>
            <input
              type="text"
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording Adjustment...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
