export type UserRole = 'customer' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentMethod =
  | 'upi_intent'
  | 'bank_transfer'
  | 'card_online'
  | 'cash_on_delivery'
  | 'pay_at_store'
  | 'digital_wallet';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type FulfillmentType = 'delivery' | 'pickup';

export type AdjustmentType =
  | 'restock'
  | 'sale'
  | 'cancellation_restore'
  | 'damaged'
  | 'expired'
  | 'manual_count';

export interface BankSettings {
  upi_id: string; // e.g. "freshmart@okhdfcbank" or "9876543210@paytm"
  merchant_name: string; // e.g. "FreshMart Grocery Store"
  account_holder: string; // e.g. "FreshMart Retail Private Limited"
  account_number: string; // e.g. "50200084729102"
  ifsc_code: string; // e.g. "HDFC0001234"
  bank_name: string; // e.g. "HDFC Bank"
  branch_name: string; // e.g. "MG Road, Bengaluru"
  account_type: string; // e.g. "Current Account"
  razorpay_key_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  price: number; // in INR (₹)
  compare_at_price?: number;
  unit: string; // e.g. "1 kg", "500 g", "1 Litre", "1 Dozen", "250 g"
  image_url: string;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface InventoryAdjustment {
  id: string;
  product_id: string;
  product_name?: string;
  adjustment_type: AdjustmentType;
  quantity_change: number; // positive or negative
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  performed_by: string;
  created_at: string;
}

export interface Address {
  id: string;
  user_id?: string;
  recipient_name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state?: string;
  postal_code: string;
  is_default?: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  email: string;
  address: Address;
  fulfillment_type: FulfillmentType;
  delivery_slot: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  transaction_id?: string;
  utr_number?: string;
  payment_details?: {
    card_brand?: string;
    card_last4?: string;
    wallet_provider?: string;
    upi_id?: string;
    utr_number?: string;
    bank_ref?: string;
  };
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ProductSortOption =
  | 'popular'
  | 'price_low_high'
  | 'price_high_low'
  | 'newest'
  | 'discount';
