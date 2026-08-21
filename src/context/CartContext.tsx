'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';
import { useStore } from './StoreContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  freeDeliveryThreshold: number;
  freeDeliveryProgress: number;
  amountNeededForFreeDelivery: number;
  isDrawerOpen: boolean;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const { products } = useStore();

  const FREE_DELIVERY_THRESHOLD = 35.0;
  const STANDARD_DELIVERY_FEE = 3.99;
  const TAX_RATE = 0.08; // 8%

  /**
   * `hasHydrated` exists to stop the save effect from firing before the load
   * effect has restored the basket.
   *
   * Without it, the first render (items = []) wrote "[]" straight over the
   * saved basket, and under React StrictMode — which mounts effects twice —
   * the second load then read that "[]" back and emptied the cart for real.
   * The symptom was a shopper adding items, moving to another page, and
   * finding the basket empty.
   */
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('freshmart_cart');
      if (savedCart) setItems(JSON.parse(savedCart));
    } catch {
      setItems([]);
    }
    setHasHydrated(true);
  }, []);

  // Save cart to LocalStorage — only once the saved basket has been read back.
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      localStorage.setItem('freshmart_cart', JSON.stringify(items));
    } catch {
      /* quota or private mode — the basket still works for this session */
    }
  }, [items, hasHydrated]);

  // Keep cart items' product stock synchronized with live store products.
  // The work happens inside the updater so it always sees the current basket;
  // gating on `items.length` from the effect closure read a stale value.
  useEffect(() => {
    if (products.length === 0) return;
    setItems(prev => {
      if (prev.length === 0) return prev;
      const next = prev
        .map(cartItem => {
          const currentProd = products.find(p => p.id === cartItem.product.id);
          if (!currentProd || !currentProd.is_active || currentProd.stock_quantity <= 0) {
            return null; // drop anything delisted or sold out
          }
          return {
            product: currentProd,
            quantity: Math.min(cartItem.quantity, currentProd.stock_quantity),
          };
        })
        .filter(Boolean) as CartItem[];

      // Returning `prev` when nothing changed avoids a needless re-render loop.
      const unchanged =
        next.length === prev.length &&
        next.every((it, i) => it.quantity === prev[i].quantity && it.product === prev[i].product);
      return unchanged ? prev : next;
    });
  }, [products]);

  const addToCart = (product: Product, quantity: number = 1) => {
    // Check available stock in live store
    const liveProd = products.find(p => p.id === product.id) || product;

    if (liveProd.stock_quantity <= 0) {
      return { success: false, message: `"${liveProd.name}" is currently out of stock.` };
    }

    const existingIndex = items.findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      const existingItem = items[existingIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > liveProd.stock_quantity) {
        return {
          success: false,
          message: `Only ${liveProd.stock_quantity} available in stock. You already have ${existingItem.quantity} in your cart.`,
        };
      }

      setItems(prev => {
        const next = [...prev];
        next[existingIndex] = { product: liveProd, quantity: newQuantity };
        return next;
      });
    } else {
      if (quantity > liveProd.stock_quantity) {
        return {
          success: false,
          message: `Cannot add ${quantity}. Only ${liveProd.stock_quantity} units available.`,
        };
      }

      setItems(prev => [...prev, { product: liveProd, quantity }]);
    }

    setIsDrawerOpen(true);
    return { success: true, message: `Added ${product.name} to your basket.` };
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const liveProd = products.find(p => p.id === productId);

    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    if (liveProd && quantity > liveProd.stock_quantity) {
      setItems(prev =>
        prev.map(i => (i.product.id === productId ? { ...i, quantity: liveProd.stock_quantity } : i))
      );
      return {
        success: false,
        message: `Maximum available stock is ${liveProd.stock_quantity}.`,
      };
    }

    setItems(prev =>
      prev.map(i => (i.product.id === productId ? { ...i, quantity } : i))
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('freshmart_cart');
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  // Financial calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + deliveryFee + tax).toFixed(2));
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const amountNeededForFreeDelivery = Math.max(0, Number((FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)));

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        total,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        freeDeliveryProgress,
        amountNeededForFreeDelivery,
        isDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
