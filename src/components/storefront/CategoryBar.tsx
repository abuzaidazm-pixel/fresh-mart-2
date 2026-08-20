'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  Apple,
  Milk,
  Croissant,
  Cookie,
  Coffee,
  Wheat,
  Sparkles,
  Heart,
  Snowflake,
  ShoppingBag,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Apple,
  Milk,
  Croissant,
  Cookie,
  Coffee,
  Wheat,
  Sparkles,
  Heart,
  Snowflake,
};

export const CategoryBar: React.FC = () => {
  const { categories, products } = useStore();

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId && p.is_active).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Shop by Department
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore curated fresh categories from your neighborhood store
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          View All Departments →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {categories.map(cat => {
          const IconComponent = ICON_MAP[cat.icon] || ShoppingBag;
          const count = getProductCount(cat.id);

          return (
            <Link
              key={cat.id}
              href={`/products?cat=${cat.id}`}
              className="group bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-card-hover transition-all flex flex-col items-center text-center justify-center space-y-2 hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {count} {count === 1 ? 'item' : 'items'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
