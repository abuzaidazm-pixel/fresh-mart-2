'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { HeroBanner } from '@/components/storefront/HeroBanner';
import { CategoryBar } from '@/components/storefront/CategoryBar';
import { DealsSection } from '@/components/storefront/DealsSection';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Heart,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const { products } = useStore();

  const featuredProducts = products.filter(p => p.is_active && p.is_featured).slice(0, 8);
  const produceItems = products
    .filter(p => p.is_active && p.category_id === 'cat_produce')
    .slice(0, 4);
  const dairyBakeryItems = products
    .filter(p => p.is_active && (p.category_id === 'cat_dairy' || p.category_id === 'cat_bakery'))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12 sm:space-y-16">
      {/* 1. Hero Promo Banner & Value Badges */}
      <section>
        <HeroBanner />
      </section>

      {/* 2. Shop by Category Bar */}
      <section>
        <CategoryBar />
      </section>

      {/* 3. Daily Flash Deals & Discount Countdown */}
      <section>
        <DealsSection />
      </section>

      {/* 4. Featured Fresh Arrivals (Curated for You) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Featured Farm Arrivals
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hand-selected top picks from this morning&apos;s farm harvest
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>See All Products</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Promotional Mid-Page Banner: Organic Guarantee */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold border border-emerald-500/40">
            <Leaf className="w-3.5 h-3.5 text-lime-300" />
            <span>Farm-to-Kitchen Traceability</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
            100% Pesticide-Free & Sustainably Cultivated
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Every apple, bunch of bananas, and carton of milk comes from verified organic growers who prioritize healthy soil, animal welfare, and pure nutrition.
          </p>
          <div className="pt-2">
            <Link
              href="/products?cat=cat_produce"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              <span>Explore Organic Produce</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0 z-10 w-full sm:w-auto">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-2xl font-black text-lime-300">30+</div>
            <div className="text-[11px] text-emerald-100 font-medium">Local Partner Farms</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-2xl font-black text-amber-300">100%</div>
            <div className="text-[11px] text-emerald-100 font-medium">Freshness Guaranteed</div>
          </div>
        </div>
      </section>

      {/* 6. Fresh Fruits & Vegetables Spotlight */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-emerald-600">🥦</span> Crisp Fruits & Garden Greens
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hydrating, nutrient-rich produce picked at peak flavor
            </p>
          </div>
          <Link
            href="/products?cat=cat_produce"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View Produce</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {produceItems.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. Dairy, Eggs & Artisanal Bakery */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-amber-500">🥐</span> Morning Dairy & Artisanal Breads
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pasteurized whole milk, free-range eggs, and slow-fermented sourdough
            </p>
          </div>
          <Link
            href="/products?cat=cat_dairy"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View Dairy & Bakery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {dairyBakeryItems.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
