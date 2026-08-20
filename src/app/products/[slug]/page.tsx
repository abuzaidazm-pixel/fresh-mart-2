'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  ShoppingBag,
  Plus,
  Minus,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const { products, categories } = useStore();
  const { addToCart, items } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState<number>(1);

  const product = products.find(p => p.slug === params.slug);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">
          The grocery item you are looking for may have been moved or is no longer available.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grocery Catalog</span>
        </Link>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category_id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.reorder_level;

  const discountPercent =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  // Related products from same category
  const relatedProducts = products
    .filter(p => p.category_id === product.category_id && p.id !== product.id && p.is_active)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }
    const res = addToCart(product, quantity);
    if (res.success) {
      showToast(res.message || `Added ${quantity}x ${product.name} to basket`, 'success');
    } else {
      showToast(res.message || 'Cannot add requested quantity', 'error');
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }
    const res = addToCart(product, quantity);
    if (res.success) {
      router.push('/checkout');
    } else {
      showToast(res.message || 'Cannot add requested quantity', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-emerald-700">Groceries</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/products?cat=${category.id}`} className="hover:text-emerald-700">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="font-semibold text-slate-800 truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product View Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-amber-500 text-white font-black text-xs px-3 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            {product.is_featured && (
              <span className="absolute top-4 right-4 bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Farm Fresh Pick
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Quality Inspected
            </span>
            <span>Origin: Certified Sustainable Farms</span>
          </div>
        </div>

        {/* Right: Product Details & Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category badge */}
            {category && (
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {category.name}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating and Unit */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>4.9 (128 verified ratings)</span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                Unit: {product.unit}
              </span>
            </div>

            {/* Pricing Section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.compare_at_price.toFixed(2)}
                </span>
              )}
              {discountPercent && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Save ₹{(product.compare_at_price! - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                About this item
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Availability Indicator */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Inventory Status:</span>
                {isOutOfStock ? (
                  <span className="font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Low stock — only {product.stock_quantity} left
                  </span>
                ) : (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In stock ({product.stock_quantity} available)
                  </span>
                )}
              </div>

              {/* Stock Health Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isOutOfStock
                      ? 'bg-rose-500 w-0'
                      : isLowStock
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{
                    width: isOutOfStock
                      ? '0%'
                      : `${Math.min(100, Math.max(15, (product.stock_quantity / 40) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Stepper & Cart Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock_quantity}
                  onClick={() => setQuantity(prev => Math.min(product.stock_quantity, prev + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Basket */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Basket</span>
              </button>
            </div>

            {/* Instant Buy Now Button */}
            {!isOutOfStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20"
              >
                Buy Now (Proceed Directly to Checkout)
              </button>
            )}
          </div>

          {/* Delivery Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-600 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>30-min express neighborhood delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free doorstep returns & replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products from Category */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Related Items in {category?.name || 'Department'}
            </h3>
            <Link
              href={`/products?cat=${product.category_id}`}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              View More →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(relProd => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
