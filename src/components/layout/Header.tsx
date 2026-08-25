'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/ui/AuthModal';
import {
  Search,
  ShoppingBag,
  MapPin,
  User,
  ChevronDown,
  Clock,
  Sparkles,
  Phone,
  Layers,
  Flame,
  CheckCircle,
  Crosshair,
  Compass,
  X,
  Navigation,
  Globe2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const { itemCount, subtotal, openDrawer } = useCart();
  const { categories, products } = useStore();
  const { user, role, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [cityName, setCityName] = useState('Mumbai');
  const [pincode, setPincode] = useState('400050');
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load saved location on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('freshmart_delivery_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.city) setCityName(parsed.city);
        if (parsed.pincode) setPincode(parsed.pincode);
      }
    } catch {
      // ignore
    }
  }, []);

  const saveDeliveryLocation = (city: string, pin: string) => {
    setCityName(city);
    setPincode(pin);
    try {
      localStorage.setItem(
        'freshmart_delivery_location',
        JSON.stringify({ city, pincode: pin })
      );
    } catch {
      // ignore
    }
    setIsLocationPickerOpen(false);
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocatingGps(false);
        saveDeliveryLocation('Current GPS Location (Mumbai Hub)', '400050');
      },
      err => {
        setIsLocatingGps(false);
        saveDeliveryLocation('Mumbai (GPS Default)', '400050');
      },
      { timeout: 8000 }
    );
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered live search results
  const searchResults = searchQuery.trim()
    ? products
        .filter(p => {
          const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
          const matchText =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
          return matchCategory && matchText;
        })
        .slice(0, 6)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchDropdown(false);
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}`);
    } else if (selectedCategory !== 'all') {
      router.push(`/products?cat=${selectedCategory}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        {/* Top Info Ribbon */}
        <div className="bg-emerald-800 text-emerald-100 text-xs py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>⚡ Express 30-Min Indian Grocery Delivery in your city</span>
              </span>
              <span className="text-emerald-500">•</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Free delivery on orders above ₹499</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-200">
                <Phone className="w-3.5 h-3.5" />
                <span>Helpline: +91 98201-FRESH</span>
              </span>
              <Link href="/products?deals=true" className="text-amber-300 font-semibold hover:underline">
                Today&apos;s Mandi Deals →
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-6">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Fresh<span className="text-emerald-600">Mart</span>
              </div>
              <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest leading-none mt-0.5">
                Local India
              </div>
            </div>
          </Link>

          {/* Google Live Location & GPS Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLocationPickerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all shadow-sm"
              title="Click to change Google Live Location & GPS Pincode"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-700 animate-bounce" />
              </div>
              <div className="text-xs hidden sm:block">
                <div className="text-slate-400 text-[10px] leading-tight flex items-center gap-1">
                  <span>Deliver to</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {cityName} {pincode}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Search Bar with live autocomplete */}
          <div ref={searchRef} className="flex-1 min-w-0 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              {/* Category Filter dropdown */}
              <div className="hidden sm:flex items-center relative">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="h-11 pl-3 pr-8 bg-slate-100 hover:bg-slate-200 border-r border-slate-200 rounded-l-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="all">All Departments</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>

              {/* Input field */}
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Search for milk, apples, bread…"
                  className="w-full h-11 pl-4 pr-10 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none text-sm text-slate-800 transition-all rounded-l-xl sm:rounded-l-none rounded-r-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search submit button */}
              <button
                type="submit"
                aria-label="Search products"
                className="h-11 px-4 sm:px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-r-xl flex items-center justify-center transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Instant Search Results Dropdown */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-96 overflow-y-auto z-50 divide-y divide-slate-100 animate-slide-up">
                <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between items-center">
                  <span>Search Suggestions</span>
                  <span>{searchResults.length} matching products</span>
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map(prod => (
                    <Link
                      key={prod.id}
                      href={`/products/${prod.slug}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="p-3 flex items-center gap-3 hover:bg-emerald-50/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={prod.image_url}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {prod.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {prod.unit} • {prod.stock_quantity > 0 ? `${prod.stock_quantity} in stock` : 'Out of stock'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-700">₹{prod.price.toFixed(2)}</div>
                        {prod.compare_at_price && (
                          <div className="text-[11px] text-slate-400 line-through">
                            ₹{prod.compare_at_price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No matching grocery items found for &quot;{searchQuery}&quot;.
                  </div>
                )}
                <div className="p-2.5 bg-slate-50 text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    View all results for &quot;{searchQuery}&quot; →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account & Cart Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* User Account Menu */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <button
                  onClick={() => setShowUserDropdown(prev => !prev)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-300 shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      user.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden xl:block text-xs">
                    <div className="text-slate-400 text-[10px]">Hello,</div>
                    <div className="font-bold text-slate-800 truncate max-w-[100px]">
                      {user.full_name.split(' ')[0]}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {showUserDropdown && user && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-slide-up">
                  <div className="p-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900 text-sm truncate">{user.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role.toUpperCase()} ACCOUNT
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/account"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Orders</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-amber-700 font-semibold hover:bg-amber-50 rounded-lg"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Admin Control Center</span>
                      </Link>
                    )}
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Basket Button */}
            <button
              onClick={openDrawer}
              className="flex items-center gap-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3.5 py-2 rounded-xl transition-all border border-emerald-200 group relative"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-fade-in">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[10px] uppercase font-bold text-emerald-800 leading-tight">
                  Cart
                </div>
                <div className="text-xs font-extrabold text-emerald-950 leading-tight">
                  ₹{subtotal.toFixed(2)}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Secondary Category Sub-Nav Bar */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
            <Link
              href="/products"
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 shadow-sm"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Departments</span>
            </Link>

            <Link
              href="/products?deals=true"
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg shadow-sm font-bold"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Flash Deals</span>
            </Link>

            <Link
              href="/insights"
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-lg shadow-sm font-bold"
            >
              <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sourcing Map</span>
            </Link>

            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

            {categories.map(category => (
              <Link
                key={category.id}
                href={`/products?cat=${category.id}`}
                className="hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Google Live Location & GPS Address Modal */}
      {isLocationPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-slate-100 space-y-5 animate-slide-up">
            <button
              onClick={() => setIsLocationPickerOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Select Google Live Delivery Location
                </h3>
                <p className="text-xs text-slate-500">
                  Set your location to view instant 30-min delivery slots & local stock
                </p>
              </div>
            </div>

            {/* Live GPS Detection Button */}
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isLocatingGps}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Crosshair className={`w-4 h-4 ${isLocatingGps ? 'animate-spin' : ''}`} />
              <span>{isLocatingGps ? 'Detecting GPS Coordinates...' : '📍 Detect My Live Google GPS Location'}</span>
            </button>

            {/* Search Indian Pincode or City */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Or Enter 6-Digit Indian Pincode:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 400050 or 560038"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => saveDeliveryLocation(cityName, pincode || '400050')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Popular Indian City Metro Hubs */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Popular Delivery Hubs:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { city: 'Mumbai', pin: '400050', label: 'Mumbai (Bandra)' },
                  { city: 'Bengaluru', pin: '560038', label: 'Bengaluru (Indiranagar)' },
                  { city: 'Delhi NCR', pin: '110001', label: 'Delhi (Connaught Pl)' },
                  { city: 'Hyderabad', pin: '500081', label: 'Hyderabad (Hitec)' },
                  { city: 'Pune', pin: '411038', label: 'Pune (Kothrud)' },
                  { city: 'Chennai', pin: '600040', label: 'Chennai (Anna Nagar)' },
                  { city: 'Kolkata', pin: '700091', label: 'Kolkata (Salt Lake)' },
                  { city: 'Ahmedabad', pin: '380015', label: 'Ahmedabad (SG Hwy)' },
                ].map(item => (
                  <button
                    key={item.city}
                    type="button"
                    onClick={() => saveDeliveryLocation(item.city, item.pin)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left transition-all"
                  >
                    <div className="font-bold text-slate-900 text-[11px] truncate">{item.city}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.pin}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
