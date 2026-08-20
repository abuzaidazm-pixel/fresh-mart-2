'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Plus, Minus, Star, Sparkles, Check, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const { showToast } = useToast();

  const cartItem = items.find(i => i.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.reorder_level;

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }

    const res = addToCart(product, 1);
    if (res.success) {
      showToast(res.message || `Added ${product.name} to basket`, 'success');
    } else {
      showToast(res.message || 'Cannot add more of this item', 'error');
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentQuantity >= product.stock_quantity) {
      showToast(`Only ${product.stock_quantity} available in stock.`, 'error');
      return;
    }

    const res = updateQuantity(product.id, currentQuantity + 1);
    if (!res.success && res.message) {
      showToast(res.message, 'error');
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, currentQuantity - 1);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          {discountPercent && (
            <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="bg-emerald-700 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Farm Pick
            </span>
          )}
        </div>

        {isOutOfStock ? (
          <span className="bg-slate-800/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-pulse-subtle">
            <AlertTriangle className="w-2.5 h-2.5" /> Only {product.stock_quantity} left
          </span>
        ) : null}
      </div>

      {/* Image Container with Link */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-slate-50">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </Link>

      {/* Content Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unit and Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-slate-600 truncate">{product.unit}</span>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h4>
          </Link>

          {/* Short Description */}
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-[9px] text-emerald-700 font-medium">In local stock</div>
          </div>

          {/* Action Button */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : currentQuantity > 0 ? (
            <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-700/20 overflow-hidden">
              <button
                onClick={handleDecrement}
                className="px-2 py-1.5 hover:bg-emerald-800 transition-colors"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-black min-w-[20px] text-center">
                {currentQuantity}
              </span>
              <button
                onClick={handleIncrement}
                className="px-2 py-1.5 hover:bg-emerald-800 transition-colors"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-300 hover:border-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm group/btn"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 group-hover/btn:text-white" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
