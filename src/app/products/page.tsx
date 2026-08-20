'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductSortOption } from '@/lib/types';
import {
  SlidersHorizontal,
  X,
  Search,
  Check,
  ChevronDown,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { products, categories } = useStore();

  // Search & Filter parameters from URL or state
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || 'all';
  const dealsParam = searchParams.get('deals') === 'true';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(dealsParam);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortOption, setSortOption] = useState<ProductSortOption>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Sync state when URL params change
  React.useEffect(() => {
    setSelectedCategory(searchParams.get('cat') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    setOnlyDeals(searchParams.get('deals') === 'true');
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.is_active) return false;

      // Category match
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
        return false;
      }

      // Deals match
      if (onlyDeals && (!p.compare_at_price || p.compare_at_price <= p.price)) {
        return false;
      }

      // Stock filter
      if (onlyInStock && p.stock_quantity <= 0) {
        return false;
      }

      // Price filter
      if (p.price > maxPrice) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'price_low_high') return a.price - b.price;
      if (sortOption === 'price_high_low') return b.price - a.price;
      if (sortOption === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOption === 'discount') {
        const discA = a.compare_at_price ? a.compare_at_price - a.price : 0;
        const discB = b.compare_at_price ? b.compare_at_price - b.price : 0;
        return discB - discA;
      }
      // Popular (featured first, then stock)
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, selectedCategory, onlyDeals, onlyInStock, maxPrice, searchQuery, sortOption]);

  const activeCategoryObj = categories.find(c => c.id === selectedCategory);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyInStock(false);
    setOnlyDeals(false);
    setMaxPrice(1000);
    setSortOption('popular');
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Departments</span>
              <span>/</span>
              <span className="font-semibold text-emerald-700">
                {activeCategoryObj ? activeCategoryObj.name : 'All Grocery Items'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{activeCategoryObj ? activeCategoryObj.name : 'All Grocery Items'}</span>
              {onlyDeals && (
                <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Deals Only
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredProducts.length} fresh Indian grocery products available in local stock
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Sort Selector */}
            <div className="relative flex-1 sm:w-56">
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value as ProductSortOption)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="popular">Most Popular / Featured</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="discount">Biggest Discount %</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>Filters</span>
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Department Categories */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Departments</span>
                {selectedCategory === 'all' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Max Price</span>
              <span className="text-emerald-700">₹{maxPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹20.00</span>
              <span>₹1,000.00</span>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyDeals}
                onChange={e => setOnlyDeals(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>On Sale / Discounts</span>
              </span>
            </label>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-80 max-w-full h-full p-6 space-y-6 overflow-y-auto ml-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-sm">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase">Departments</div>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="w-full text-left py-1.5 text-xs font-bold text-emerald-800"
                  >
                    All Departments
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className="w-full text-left py-1.5 text-xs text-slate-600"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                {/* Max Price */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Max Price</span>
                    <span>₹{maxPrice.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs"
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, clearing your search query, or selecting a different department.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm font-semibold">Loading FreshMart Catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
