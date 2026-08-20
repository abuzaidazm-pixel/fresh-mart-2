'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import {
  X,
  Package,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Check,
  Layers,
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const GROCERY_PHOTO_PRESETS = [
  { name: 'Organic Bananas', category: 'cat_produce', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Honeycrisp Apples', category: 'cat_produce', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80' },
  { name: 'Hass Avocados', category: 'cat_produce', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80' },
  { name: 'Baby Spinach', category: 'cat_produce', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fresh Milk', category: 'cat_dairy', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80' },
  { name: 'Brown Eggs', category: 'cat_dairy', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop&q=80' },
  { name: 'Cheddar Cheese', category: 'cat_dairy', url: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sourdough Bread', category: 'cat_bakery', url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80' },
  { name: 'Croissants', category: 'cat_bakery', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80' },
  { name: 'Extra Virgin Olive Oil', category: 'cat_staples', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80' },
  { name: 'Basmati Rice', category: 'cat_staples', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fresh Orange Juice', category: 'cat_beverages', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80' },
  { name: 'Cold Brew Coffee', category: 'cat_beverages', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sea Salt Almonds', category: 'cat_snacks', url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop&q=80' },
  { name: 'Dark Chocolate', category: 'cat_snacks', url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop&q=80' },
  { name: 'Eco Dish Soap', category: 'cat_household', url: 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Wild Blueberries', category: 'cat_frozen', url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&auto=format&fit=crop&q=80' },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, addProduct, updateProduct } = useStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_produce');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('2.99');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [unit, setUnit] = useState('1 kg');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80'
  );
  const [stockQuantity, setStockQuantity] = useState('25');
  const [reorderLevel, setReorderLevel] = useState('5');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setCategoryId(productToEdit.category_id);
      setDescription(productToEdit.description);
      setPrice(String(productToEdit.price));
      setCompareAtPrice(productToEdit.compare_at_price ? String(productToEdit.compare_at_price) : '');
      setUnit(productToEdit.unit);
      setImageUrl(productToEdit.image_url);
      setStockQuantity(String(productToEdit.stock_quantity));
      setReorderLevel(String(productToEdit.reorder_level));
      setIsActive(productToEdit.is_active);
      setIsFeatured(productToEdit.is_featured);
    } else {
      setName('');
      setSlug('');
      setCategoryId(categories[0]?.id || 'cat_produce');
      setDescription('');
      setPrice('3.49');
      setCompareAtPrice('');
      setUnit('1 kg');
      setImageUrl(GROCERY_PHOTO_PRESETS[0].url);
      setStockQuantity('20');
      setReorderLevel('5');
      setIsActive(true);
      setIsFeatured(false);
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!productToEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  // Local Image Upload (File -> Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file is too large. Please select an image under 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        showToast('Local photo loaded successfully', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a product title', 'error');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      showToast('Please provide a valid positive price', 'error');
      return;
    }

    const finalImageUrl =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';

    const finalSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      `prod-${Date.now()}`;

    setIsSubmitting(true);
    const parsedCompare = compareAtPrice ? parseFloat(compareAtPrice) : undefined;
    const parsedStock = parseInt(stockQuantity, 10) || 0;
    const parsedReorder = parseInt(reorderLevel, 10) || 5;

    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, {
          name: name.trim(),
          slug: finalSlug,
          category_id: categoryId,
          description: description.trim() || `Fresh, organic ${name.trim()} sourced for daily quality.`,
          price: parsedPrice,
          compare_at_price: parsedCompare,
          unit: unit.trim() || '1 item',
          image_url: finalImageUrl,
          stock_quantity: parsedStock,
          reorder_level: parsedReorder,
          is_active: isActive,
          is_featured: isFeatured,
        });
        showToast(`Updated product "${name}"`, 'success');
      } else {
        await addProduct({
          name: name.trim(),
          slug: finalSlug,
          category_id: categoryId,
          description: description.trim() || `Fresh, organic ${name.trim()} sourced for daily quality.`,
          price: parsedPrice,
          compare_at_price: parsedCompare,
          unit: unit.trim() || '1 item',
          image_url: finalImageUrl,
          stock_quantity: parsedStock,
          reorder_level: parsedReorder,
          is_active: isActive,
          is_featured: isFeatured,
        });
        showToast(`Created new product "${name}" with ${parsedStock} units in stock!`, 'success');
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative border border-slate-100 my-8 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {productToEdit ? 'Edit Grocery Item' : 'Add New Grocery Product'}
            </h3>
            <p className="text-xs text-slate-500">
              {productToEdit
                ? `Modify pricing, stock levels, or details for #${productToEdit.id}`
                : 'Create a new item in your inventory catalog'}
            </p>
          </div>
        </div>

        {/* Product Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Fresh Organic Strawberries"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department / Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Measure */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unit Measure (e.g. 1 kg, 500 g, 1 bunch, 6 pcs) *
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. 500 g box or 1 Gallon"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Retail Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="145.00"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-800"
              />
            </div>

            {/* Compare at Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Original Price / Compare At (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={e => setCompareAtPrice(e.target.value)}
                placeholder="199.00 (Optional for discount)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-500"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock Units *</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Low Stock Threshold (Reorder Alert) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={reorderLevel}
                onChange={e => setReorderLevel(e.target.value)}
                placeholder="5"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Image Upload & Presets */}
            <div className="sm:col-span-2 space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Product Image *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo from Computer</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-slate-100 border shrink-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                      No Photo
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="Paste image URL or use presets / upload above"
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-700 text-ellipsis"
                />
              </div>

              {/* Gallery Presets */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] font-bold text-slate-400">Or Select from Grocery Photo Presets:</div>
                <div className="flex flex-wrap items-center gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {GROCERY_PHOTO_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        if (!name) setName(preset.name);
                        if (!productToEdit) {
                          setSlug(preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                          setCategoryId(preset.category);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                        imageUrl === preset.url
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {imageUrl === preset.url && <Check className="w-2.5 h-2.5" />}
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe farm origin, taste profile, and health benefits..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800">Active (Visible in Store)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Featured Farm Arrival</span>
              </span>
            </label>
          </div>

          {/* Action Buttons */}
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
              {isSubmitting ? 'Saving...' : productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
