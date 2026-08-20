'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Category,
  Product,
  Order,
  InventoryAdjustment,
  AdjustmentType,
  OrderStatus,
  Address,
  FulfillmentType,
  PaymentMethod,
  BankSettings,
} from '@/lib/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY_ADJUSTMENTS,
  INITIAL_BANK_SETTINGS,
} from '@/lib/seedData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface CreateOrderInput {
  userId?: string | null;
  customerName: string;
  phone: string;
  email: string;
  address: Address;
  fulfillmentType: FulfillmentType;
  deliverySlot: string;
  paymentMethod: PaymentMethod;
  utrNumber?: string;
  paymentDetails?: {
    cardBrand?: string;
    cardLast4?: string;
    walletProvider?: string;
    upiId?: string;
    utrNumber?: string;
    bankRef?: string;
  };
  notes?: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  deliveryFee: number;
  tax: number;
}

interface StoreContextType {
  categories: Category[];
  products: Product[];
  orders: Order[];
  adjustments: InventoryAdjustment[];
  bankSettings: BankSettings;
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<boolean>;
  updateBankSettings: (settings: Partial<BankSettings>) => Promise<void>;
  adjustStock: (
    productId: string,
    adjustmentType: AdjustmentType,
    quantityChange: number,
    reason: string,
    performedBy?: string
  ) => Promise<{ success: boolean; error?: string }>;
  createOrder: (input: CreateOrderInput) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<{ success: boolean; error?: string }>;
  resetToDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>(INITIAL_INVENTORY_ADJUSTMENTS);
  const [bankSettings, setBankSettings] = useState<BankSettings>(INITIAL_BANK_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    const initializeData = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const [catRes, prodRes, ordRes, adjRes] = await Promise.all([
            supabase.from('categories').select('*').order('display_order', { ascending: true }),
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false }),
            supabase.from('inventory_adjustments').select('*').order('created_at', { ascending: false }),
          ]);

          if (catRes.data && catRes.data.length > 0) setCategories(catRes.data);
          if (prodRes.data && prodRes.data.length > 0) setProducts(prodRes.data);
          if (ordRes.data && ordRes.data.length > 0) setOrders(ordRes.data);
          if (adjRes.data && adjRes.data.length > 0) setAdjustments(adjRes.data);
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Supabase fetch failed, falling back to local state:', err);
        }
      }

      // Load from LocalStorage
      const savedProds = localStorage.getItem('freshmart_products');
      const savedCats = localStorage.getItem('freshmart_categories');
      const savedOrds = localStorage.getItem('freshmart_orders');
      const savedAdjs = localStorage.getItem('freshmart_adjustments');
      const savedBank = localStorage.getItem('freshmart_bank_settings');

      if (savedProds) {
        try { setProducts(JSON.parse(savedProds)); } catch { setProducts(INITIAL_PRODUCTS); }
      } else {
        localStorage.setItem('freshmart_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      if (savedCats) {
        try { setCategories(JSON.parse(savedCats)); } catch { setCategories(INITIAL_CATEGORIES); }
      } else {
        localStorage.setItem('freshmart_categories', JSON.stringify(INITIAL_CATEGORIES));
      }

      if (savedOrds) {
        try { setOrders(JSON.parse(savedOrds)); } catch { setOrders(INITIAL_ORDERS); }
      } else {
        localStorage.setItem('freshmart_orders', JSON.stringify(INITIAL_ORDERS));
      }

      if (savedAdjs) {
        try { setAdjustments(JSON.parse(savedAdjs)); } catch { setAdjustments(INITIAL_INVENTORY_ADJUSTMENTS); }
      } else {
        localStorage.setItem('freshmart_adjustments', JSON.stringify(INITIAL_INVENTORY_ADJUSTMENTS));
      }

      if (savedBank) {
        try { setBankSettings(JSON.parse(savedBank)); } catch { setBankSettings(INITIAL_BANK_SETTINGS); }
      } else {
        localStorage.setItem('freshmart_bank_settings', JSON.stringify(INITIAL_BANK_SETTINGS));
      }

      setIsLoading(false);
    };

    initializeData();
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('freshmart_products', JSON.stringify(products));
      localStorage.setItem('freshmart_categories', JSON.stringify(categories));
      localStorage.setItem('freshmart_orders', JSON.stringify(orders));
      localStorage.setItem('freshmart_adjustments', JSON.stringify(adjustments));
      localStorage.setItem('freshmart_bank_settings', JSON.stringify(bankSettings));
    }
  }, [products, categories, orders, adjustments, bankSettings, isLoading]);

  const updateBankSettings = async (settings: Partial<BankSettings>): Promise<void> => {
    const updated = { ...bankSettings, ...settings };
    setBankSettings(updated);
    localStorage.setItem('freshmart_bank_settings', JSON.stringify(updated));
  };

  // Product Operations
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').insert([newProduct]);
    }

    setProducts(prev => [newProduct, ...prev]);

    // Record initial inventory if stock > 0
    if (newProduct.stock_quantity > 0) {
      await adjustStock(
        newProduct.id,
        'restock',
        newProduct.stock_quantity,
        'Initial stock on product creation',
        'Store Manager'
      );
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    let updated: Product | null = null;

    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          updated = { ...p, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return p;
      })
    );

    if (isSupabaseConfigured && supabase && updated) {
      await supabase.from('products').update(updates).eq('id', id);
    }

    return updated || ({} as Product);
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    return true;
  };

  // Category Operations
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const newCategory: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('categories').insert([newCategory]);
    }

    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
    let updated: Category | null = null;

    setCategories(prev =>
      prev.map(c => {
        if (c.id === id) {
          updated = { ...c, ...updates };
          return updated;
        }
        return c;
      })
    );

    if (isSupabaseConfigured && supabase && updated) {
      await supabase.from('categories').update(updates).eq('id', id);
    }

    return updated || ({} as Category);
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setCategories(prev => prev.filter(c => c.id !== id));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('categories').delete().eq('id', id);
    }
    return true;
  };

  // Inventory Stock Adjustment Engine
  const adjustStock = async (
    productId: string,
    adjustmentType: AdjustmentType,
    quantityChange: number,
    reason: string,
    performedBy: string = 'Admin Staff'
  ): Promise<{ success: boolean; error?: string }> => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const previous_quantity = product.stock_quantity;
    const new_quantity = Math.max(0, previous_quantity + quantityChange);

    // Update Product Stock
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock_quantity: new_quantity } : p))
    );

    // Create Audit Log Entry
    const newAdjustment: InventoryAdjustment = {
      id: `adj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      product_id: productId,
      product_name: product.name,
      adjustment_type: adjustmentType,
      quantity_change: quantityChange,
      previous_quantity,
      new_quantity,
      reason,
      performed_by: performedBy,
      created_at: new Date().toISOString(),
    };

    setAdjustments(prev => [newAdjustment, ...prev]);

    if (isSupabaseConfigured && supabase) {
      await Promise.all([
        supabase.from('products').update({ stock_quantity: new_quantity }).eq('id', productId),
        supabase.from('inventory_adjustments').insert([newAdjustment]),
      ]);
    }

    return { success: true };
  };

  // Order Placement & Inventory Reduction
  const createOrder = async (
    input: CreateOrderInput
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    // 1. Validate Stock Availability for all items
    for (const item of input.items) {
      const currentProduct = products.find(p => p.id === item.product.id);
      if (!currentProduct) {
        return { success: false, error: `Product "${item.product.name}" is no longer available.` };
      }
      if (currentProduct.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${currentProduct.name}". Only ${currentProduct.stock_quantity} remaining.`,
        };
      }
    }

    // 2. Compute Financials
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const total = Number((subtotal + input.deliveryFee + input.tax).toFixed(2));

    const orderId = `ord_${Date.now()}`;
    const orderNumber = `FM-${Math.floor(10000 + Math.random() * 90000)}`;
    const isInstantPay =
      input.paymentMethod === 'upi_intent' ||
      input.paymentMethod === 'card_online' ||
      input.paymentMethod === 'digital_wallet';
    const transactionId = isInstantPay
      ? `TXN-${Math.floor(100000 + Math.random() * 900000)}`
      : undefined;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      user_id: input.userId || null,
      customer_name: input.customerName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      fulfillment_type: input.fulfillmentType,
      delivery_slot: input.deliverySlot,
      payment_method: input.paymentMethod,
      payment_status: isInstantPay ? 'paid' : 'pending',
      order_status: 'confirmed',
      transaction_id: transactionId,
      utr_number: input.utrNumber,
      payment_details: input.paymentDetails
        ? {
            card_brand: input.paymentDetails.cardBrand,
            card_last4: input.paymentDetails.cardLast4,
            wallet_provider: input.paymentDetails.walletProvider,
            upi_id: input.paymentDetails.upiId,
            utr_number: input.paymentDetails.utrNumber,
            bank_ref: input.paymentDetails.bankRef,
          }
        : undefined,
      subtotal: Number(subtotal.toFixed(2)),
      delivery_fee: input.deliveryFee,
      tax: input.tax,
      total,
      notes: input.notes || '',
      created_at: new Date().toISOString(),
      items: input.items.map(item => ({
        id: `item_${Date.now()}_${item.product.id}`,
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        unit: item.product.unit,
        unit_price: item.product.price,
        quantity: item.quantity,
        subtotal: Number((item.product.price * item.quantity).toFixed(2)),
        image_url: item.product.image_url,
      })),
    };

    // 3. Atomically Deduct Product Stock & Create Sale Inventory Adjustments
    const updatedProducts = [...products];
    const newSaleAdjustments: InventoryAdjustment[] = [];

    for (const item of input.items) {
      const pIndex = updatedProducts.findIndex(p => p.id === item.product.id);
      if (pIndex !== -1) {
        const prod = updatedProducts[pIndex];
        const prevStock = prod.stock_quantity;
        const newStock = Math.max(0, prevStock - item.quantity);

        updatedProducts[pIndex] = {
          ...prod,
          stock_quantity: newStock,
        };

        newSaleAdjustments.push({
          id: `adj_${Date.now()}_${prod.id}`,
          product_id: prod.id,
          product_name: prod.name,
          adjustment_type: 'sale',
          quantity_change: -item.quantity,
          previous_quantity: prevStock,
          new_quantity: newStock,
          reason: `Customer order #${orderNumber} placed`,
          performed_by: 'Customer Checkout',
          created_at: new Date().toISOString(),
        });
      }
    }

    // 4. Update State
    setProducts(updatedProducts);
    setAdjustments(prev => [...newSaleAdjustments, ...prev]);
    setOrders(prev => [newOrder, ...prev]);

    // 5. Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert([
          {
            id: newOrder.id,
            order_number: newOrder.order_number,
            user_id: newOrder.user_id,
            customer_name: newOrder.customer_name,
            phone: newOrder.phone,
            email: newOrder.email,
            address: newOrder.address,
            fulfillment_type: newOrder.fulfillment_type,
            delivery_slot: newOrder.delivery_slot,
            payment_method: newOrder.payment_method,
            payment_status: newOrder.payment_status,
            order_status: newOrder.order_status,
            subtotal: newOrder.subtotal,
            delivery_fee: newOrder.delivery_fee,
            tax: newOrder.tax,
            total: newOrder.total,
            notes: newOrder.notes,
          },
        ]);

        await supabase.from('order_items').insert(newOrder.items);
      } catch (err) {
        console.error('Failed to sync order to Supabase:', err);
      }
    }

    return { success: true, order: newOrder };
  };

  // Order Status Update with Stock Restoration Safeguard
  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<{ success: boolean; error?: string }> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const oldStatus = order.order_status;
    if (oldStatus === newStatus) return { success: true };

    // If order is newly cancelled, restore product inventory
    if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
      const updatedProducts = [...products];
      const restoreAdjustments: InventoryAdjustment[] = [];

      for (const item of order.items) {
        const pIndex = updatedProducts.findIndex(p => p.id === item.product_id);
        if (pIndex !== -1) {
          const prod = updatedProducts[pIndex];
          const prevStock = prod.stock_quantity;
          const newStock = prevStock + item.quantity;

          updatedProducts[pIndex] = {
            ...prod,
            stock_quantity: newStock,
          };

          restoreAdjustments.push({
            id: `adj_${Date.now()}_${prod.id}`,
            product_id: prod.id,
            product_name: prod.name,
            adjustment_type: 'cancellation_restore',
            quantity_change: item.quantity,
            previous_quantity: prevStock,
            new_quantity: newStock,
            reason: `Order #${order.order_number} cancelled by store admin - stock restored`,
            performed_by: 'Admin Staff',
            created_at: new Date().toISOString(),
          });
        }
      }

      setProducts(updatedProducts);
      setAdjustments(prev => [...restoreAdjustments, ...prev]);
    }

    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              order_status: newStatus,
              updated_at: new Date().toISOString(),
              payment_status: newStatus === 'completed' ? 'paid' : o.payment_status,
            }
          : o
      )
    );

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);
    }

    return { success: true };
  };

  const resetToDemoData = () => {
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setAdjustments(INITIAL_INVENTORY_ADJUSTMENTS);
    localStorage.removeItem('freshmart_products');
    localStorage.removeItem('freshmart_categories');
    localStorage.removeItem('freshmart_orders');
    localStorage.removeItem('freshmart_adjustments');
    localStorage.setItem('freshmart_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('freshmart_categories', JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem('freshmart_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('freshmart_adjustments', JSON.stringify(INITIAL_INVENTORY_ADJUSTMENTS));
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        orders,
        adjustments,
        bankSettings,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateBankSettings,
        adjustStock,
        createOrder,
        updateOrderStatus,
        resetToDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
