'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { Product } from '@/lib/types';
import { ProductModal } from '@/components/admin/ProductModal';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminProductsPage() {
  const { products, categories, updateProduct, deleteProduct } = useStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleToggleActive = async (product: Product) => {
    const nextState = !product.is_active;
    await updateProduct(product.id, { is_active: nextState });
    showToast(
      `Product "${product.name}" marked as ${nextState ? 'Active' : 'Inactive'}`,
      'info'
    );
  };

  const handleToggleFeatured = async (product: Product) => {
    const nextState = !product.is_featured;
    await updateProduct(product.id, { is_featured: nextState });
    showToast(
      `Product "${product.name}" ${nextState ? 'added to' : 'removed from'} Farm Picks`,
      'info'
    );
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}" from catalog?`)) {
      await deleteProduct(product.id);
      showToast(`Deleted "${product.name}"`, 'info');
    }
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Add Product CTA */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
            <Package className="w-4 h-4" />
            <span>Product Catalog</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Manage Grocery Inventory ({products.length} Products)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure pricing, images, categories, and availability
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products by title, keyword, or slug..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="all">All Departments ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({products.filter(p => p.category_id === c.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
              <tr>
                <th className="py-4 px-4">Item</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Retail Price</th>
                <th className="py-4 px-4">Unit Measure</th>
                <th className="py-4 px-4">Stock Units</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Featured</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No grocery products found matching &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const cat = categories.find(c => c.id === product.category_id);
                  const isLow = product.stock_quantity <= product.reorder_level;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-11 h-11 rounded-xl overflow-hidden relative bg-slate-950 shrink-0 border border-slate-800">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 font-semibold text-slate-300">
                        {cat?.name || 'Unassigned'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div className="font-black text-white">₹{product.price.toFixed(2)}</div>
                        {product.compare_at_price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            ₹{product.compare_at_price.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 text-slate-400 font-medium">{product.unit}</td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black ${
                            product.stock_quantity === 0
                              ? 'text-rose-400'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}>
                            {product.stock_quantity}
                          </span>
                          {isLow && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">Reorder at: {product.reorder_level}</div>
                      </td>

                      {/* Active Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(product)}
                          title={product.is_active ? 'Click to deactivate' : 'Click to activate'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            product.is_active
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {product.is_active ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          title="Toggle Featured Farm Pick status"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            product.is_featured
                              ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                              : 'bg-slate-800 text-slate-600 border-slate-700 hover:text-slate-400'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />
    </div>
  );
}
