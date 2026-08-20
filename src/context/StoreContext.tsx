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

  /**
   * Pull the whole store from Supabase.
   *
   * Called on mount and again after every mutation, because the database is the
   * source of truth once it is connected: place_order() recomputes prices and
   * deducts stock server-side, so the browser's optimistic copy is a guess until
   * it is refreshed. Empty tables are honoured as empty — the old code treated
   * `length === 0` as "fall back to seed data", which silently painted 15 demo
   * products over a genuinely empty catalogue.
   */
  const refetchFromSupabase = async (): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null;

    const [catRes, prodRes, ordRes, adjRes] = await Promise.all([
      supabase.from('categories').select('*').order('display_order', { ascending: true }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('inventory_adjustments')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    const failure = catRes.error || prodRes.error || ordRes.error || adjRes.error;
    if (failure) {
      console.error('Supabase read failed:', failure.message);
      return failure.message;
    }

    setCategories(catRes.data ?? []);
    setProducts(prodRes.data ?? []);
    setOrders((ordRes.data ?? []) as Order[]);
    setAdjustments((adjRes.data ?? []) as InventoryAdjustment[]);
    return null;
  };

  // Initialize from LocalStorage or Supabase
  useEffect(() => {
    const initializeData = async () => {
      if (isSupabaseConfigured && supabase) {
        const error = await refetchFromSupabase();
        if (!error) {
          setIsLoading(false);
          return;
        }
        // Reaching here means the keys are set but the database is unreachable
        // or the schema is missing. Falling through to the demo catalogue keeps
        // the storefront usable, and the console line above says why.
        console.warn('Falling back to local demo data.');
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

  // Save to LocalStorage whenever state changes.
  // Skipped entirely when Supabase is connected: mirroring server rows into
  // localStorage means a stale copy wins on the next reload, and it would also
  // leave one customer's order history sitting in the next visitor's browser on
  // a shared machine. Bank settings stay local either way — there is no table.
  useEffect(() => {
    if (isLoading) return;

    localStorage.setItem('freshmart_bank_settings', JSON.stringify(bankSettings));
    if (isSupabaseConfigured) return;

    localStorage.setItem('freshmart_products', JSON.stringify(products));
    localStorage.setItem('freshmart_categories', JSON.stringify(categories));
    localStorage.setItem('freshmart_orders', JSON.stringify(orders));
    localStorage.setItem('freshmart_adjustments', JSON.stringify(adjustments));
  }, [products, categories, orders, adjustments, bankSettings, isLoading]);

  const updateBankSettings = async (settings: Partial<BankSettings>): Promise<void> => {
    const updated = { ...bankSettings, ...settings };
    setBankSettings(updated);
    localStorage.setItem('freshmart_bank_settings', JSON.stringify(updated));
  };

  /**
   * Supabase's client returns errors in `{ error }` rather than throwing, so a
   * try/catch around `.insert()` catches nothing and a row rejected by RLS looks
   * exactly like a successful write. Every call goes through this instead, which
   * turns an RLS refusal or constraint violation into a real exception the UI
   * can show. RLS denials on write arrive either as an explicit policy error or
   * as zero rows affected, so both are treated as failure.
   */
  const failIfError = <T,>(
    result: { data: T | null; error: { message: string } | null },
    action: string
  ): T => {
    if (result.error) {
      throw new Error(`${action} failed: ${result.error.message}`);
    }
    if (result.data === null) {
      throw new Error(
        `${action} was blocked. You may not have permission, or your admin session expired.`
      );
    }
    return result.data;
  };

  // Product Operations
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    if (isSupabaseConfigured && supabase) {
      // No client-generated id: the products table has its own default, and a
      // timestamp id would collide the moment two admins add a product together.
      const created = failIfError(
        await supabase.from('products').insert([productData]).select().single(),
        'Adding the product'
      ) as Product;

      if (created.stock_quantity > 0) {
        // Opening balance for the audit trail. Written directly rather than via
        // adjustStock(), which would add the quantity a second time.
        await supabase.from('inventory_adjustments').insert([
          {
            product_id: created.id,
            adjustment_type: 'restock',
            quantity_change: created.stock_quantity,
            previous_quantity: 0,
            new_quantity: created.stock_quantity,
            reason: 'Opening stock on product creation',
            performed_by: 'Store Manager',
          },
        ]);
      }

      await refetchFromSupabase();
      return created;
    }

    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);

    if (newProduct.stock_quantity > 0) {
      setAdjustments(prev => [
        {
          id: `adj_${Date.now()}_${newProduct.id}`,
          product_id: newProduct.id,
          product_name: newProduct.name,
          adjustment_type: 'restock',
          quantity_change: newProduct.stock_quantity,
          previous_quantity: 0,
          new_quantity: newProduct.stock_quantity,
          reason: 'Opening stock on product creation',
          performed_by: 'Store Manager',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
    if (isSupabaseConfigured && supabase) {
      const updated = failIfError(
        await supabase.from('products').update(updates).eq('id', id).select().single(),
        'Updating the product'
      ) as Product;
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
      return updated;
    }

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
    return updated || ({} as Product);
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      failIfError(
        await supabase.from('products').delete().eq('id', id).select(),
        'Deleting the product'
      );
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    return true;
  };

  // Category Operations
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    const newCategory: Category = { ...catData, id: `cat_${Date.now()}` };

    if (isSupabaseConfigured && supabase) {
      const created = failIfError(
        await supabase.from('categories').insert([newCategory]).select().single(),
        'Adding the category'
      ) as Category;
      setCategories(prev => [...prev, created]);
      return created;
    }

    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
    if (isSupabaseConfigured && supabase) {
      const updated = failIfError(
        await supabase.from('categories').update(updates).eq('id', id).select().single(),
        'Updating the category'
      ) as Category;
      setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
      return updated;
    }

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
    return updated || ({} as Category);
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      failIfError(
        await supabase.from('categories').delete().eq('id', id).select(),
        'Deleting the category'
      );
      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
    }

    setCategories(prev => prev.filter(c => c.id !== id));
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

    if (isSupabaseConfigured && supabase) {
      // One transaction in the database: stock update + audit row together.
      // Doing it as two client calls could log an adjustment that never applied,
      // or apply one that was never logged.
      const { error } = await supabase.rpc('admin_adjust_stock', {
        p_product_id: productId,
        p_adjustment_type: adjustmentType,
        p_quantity_change: quantityChange,
        p_reason: reason,
        p_performed_by: performedBy,
      });

      if (error) return { success: false, error: error.message };

      await refetchFromSupabase();
      return { success: true };
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

    return { success: true };
  };

  // Order Placement & Inventory Reduction
  const createOrder = async (
    input: CreateOrderInput
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    /* ------------------------------------------------------------------ *
     * Supabase path: one call, one transaction.
     *
     * Only product ids and quantities are sent. Prices, delivery fee, tax and
     * the grand total are all recomputed inside place_order() from the products
     * table, so a tampered request cannot buy a $40 basket for a penny. Stock is
     * checked and deducted under a row lock in the same transaction, which also
     * closes the oversell race the client-side check could never catch.
     * ------------------------------------------------------------------ */
    if (isSupabaseConfigured && supabase) {
      const isInstant =
        input.paymentMethod === 'upi_intent' ||
        input.paymentMethod === 'card_online' ||
        input.paymentMethod === 'digital_wallet';

      const { data, error } = await supabase.rpc('place_order', {
        p_items: input.items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        p_customer_name: input.customerName,
        p_phone: input.phone,
        p_email: input.email,
        p_address: input.address,
        p_fulfillment_type: input.fulfillmentType,
        p_delivery_slot: input.deliverySlot,
        p_payment_method: input.paymentMethod,
        p_payment_status: isInstant ? 'paid' : 'pending',
        p_payment_details: {
          card_brand: input.paymentDetails?.cardBrand,
          card_last4: input.paymentDetails?.cardLast4,
          wallet_provider: input.paymentDetails?.walletProvider,
          upi_id: input.paymentDetails?.upiId,
          utr_number: input.paymentDetails?.utrNumber,
          bank_ref: input.paymentDetails?.bankRef,
        },
        p_transaction_id: isInstant
          ? `TXN-${Math.floor(100000 + Math.random() * 900000)}`
          : null,
        p_utr_number: input.utrNumber ?? null,
        p_notes: input.notes ?? '',
      });

      if (error) {
        // "Only 2 left of Baby Spinach Leaves" and friends are raised by the
        // function itself and are safe to show the shopper as-is.
        return { success: false, error: error.message };
      }

      const placed = data as unknown as Order;
      await refetchFromSupabase();
      // A guest order is invisible to the orders SELECT policy, so keep the copy
      // the function handed back — the receipt page reads orders from here.
      setOrders(prev => (prev.some(o => o.id === placed.id) ? prev : [placed, ...prev]));
      return { success: true, order: placed };
    }

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

    if (isSupabaseConfigured && supabase) {
      // Cancelling has to put the reserved stock back, so it goes through the
      // transactional RPC rather than a bare status update.
      if (newStatus === 'cancelled') {
        const { error } = await supabase.rpc('admin_cancel_order', { p_order_id: orderId });
        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase
          .from('orders')
          .update({
            order_status: newStatus,
            ...(newStatus === 'completed' ? { payment_status: 'paid' } : {}),
          })
          .eq('id', orderId);
        if (error) return { success: false, error: error.message };
      }

      await refetchFromSupabase();
      return { success: true };
    }

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

    return { success: true };
  };

  const resetToDemoData = () => {
    // Against a real database this would only desynchronise the UI from the
    // rows that are actually there — and if it were wired to delete, it would
    // destroy live orders. The button is hidden when Supabase is connected;
    // this guard covers any other caller.
    if (isSupabaseConfigured) {
      console.warn('resetToDemoData ignored: Supabase is the source of truth.');
      return;
    }

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
