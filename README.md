# FreshMart Local - Grocery E-Commerce & Inventory Management Web Application

**FreshMart Local** is a modern, high-performance grocery e-commerce web application built for neighborhood mart owners and everyday shoppers. The platform features an Amazon-inspired yet custom-branded shopping experience (vibrant emerald green, clean typography, category grids, dynamic cart drawer, fast checkout) alongside a complete store operations backend (stock adjustments, low-stock alerts, audit logging, order fulfillment, and role-based access).

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Top Announcement & Location Bar**: Pincode selector, delivery turnaround ("Get fresh groceries in 30 mins"), and 24/7 store hotline.
- **Smart Global Search**: Real-time keyword matching with instant dropdown preview showing product thumbnails, pricing, and stock status.
- **9 Grocery Departments**: Fruits & Vegetables, Dairy & Eggs, Bakery & Bread, Snacks & Munchies, Cold Beverages, Organic Staples, Household & Cleaning, Personal Care, Frozen Foods.
- **Daily Flash Deals**: Live interactive countdown timer with discounted product showcase.
- **Modern Product Cards**:
  - Crisp images with hover zoom
  - Real-time stock alerts (`"Only 3 left!"` or `"Out of stock"`)
  - Unit measurements (`"1 kg"`, `"500 g"`, `"Dozen (12 pcs)"`, `"1 Gallon"`)
  - Quick quantity steppers directly on the product card.
- **Product Detail View (`/products/[slug]`)**: Stock health meter, unit breakdown, origin info, quantity selector, and related category recommendations.

### 🛍️ Basket & Frictionless Checkout
- **Interactive Slide-Over Cart Drawer & Dedicated Cart Page (`/cart`)**:
  - Real-time stock limit checks (cannot add more than available store inventory).
  - Free delivery threshold progress bar (*"Add $8.50 more for FREE delivery!"*).
  - Dynamic cost breakdown: Subtotal, Delivery fee, Estimated tax (8%), and Grand total.
  - Promo code voucher support (`FRESHMART5` for $5 off).
- **Checkout Flow (`/checkout`)**:
  - Fulfillment options: **Neighborhood Home Delivery** (30-45 mins) vs. **In-Store Express Pickup**.
  - Delivery time slot window selection.
  - Payment methods: **Cash on Delivery (COD)** and **Pay at Store**, with card placeholder.
  - Atomic stock deduction upon order confirmation.
- **Order Confirmation & Live Tracker (`/order-success/[id]`)**:
  - Celebratory confetti on order placement.
  - Live 5-stage fulfillment status tracker (`Placed` → `Confirmed` → `Packed` → `Out for Delivery` → `Delivered`).
  - Printable receipt summary.

### 👤 Customer Account Portal (`/account`)
- Customer profile information and saved delivery addresses.
- Full order history with order numbers, timestamps, line items, and totals.
- **1-Click Reorder**: Adds entire past orders directly back into the cart.

### 🛡️ Admin Store Operations Center (`/admin`)
- **Executive KPI Dashboard (`/admin`)**:
  - Today's Total Revenue, Active Live Orders, Low Stock Alerts, Total Active Products.
  - Critical stock attention widget with **1-Click Quick Restock**.
  - Recent live orders feed.
- **Product Catalog Management (`/admin/products`)**:
  - Add, edit, and delete products with image previews, category mapping, price, compare price, unit, stock quantity, and reorder levels.
  - 1-click toggles for Active/Inactive and Featured Farm Pick status.
- **Inventory Engine & Audit Logging (`/admin/inventory`)**:
  - Real-time stock matrix with low-stock warnings (`stock <= reorder_level`).
  - Stock adjustment modal supporting:
    - `+ Restock` (Vendor shipment)
    - `- Damaged` (Bruised in transit)
    - `- Expired` (Past shelf life)
    - `Manual Count` (Periodic physical audit)
  - **Mandatory reason logging** for full accountability.
  - Searchable **Inventory Adjustments History** audit log table.
- **Order Fulfillment Manager (`/admin/orders`)**:
  - Multi-status tabs (`All`, `Pending`, `Confirmed`, `Packed`, `Out for Delivery`, `Completed`, `Cancelled`).
  - **Automatic Stock Restoration Safeguard**: If an admin cancels an order, reserved item quantities are automatically replenished into the product catalog and recorded in the audit log.
- **Database & Sync Hub (`/admin/database`)**:
  - Supabase status detector and 1-click demo data reset.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 14+ (App Router) + React 18 + TypeScript |
| **Styling** | Tailwind CSS with custom grocery color tokens |
| **Icons & UI** | Lucide React |
| **Database** | Supabase (PostgreSQL with RLS & Triggers) |
| **State & Persistence** | Dual-Mode Data Architecture (LocalStorage fallback + Supabase Postgres sync) |
| **Deployment** | Vercel (Frontend) + Supabase (Database & Auth) |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally (Zero-Config Demo Mode)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The app will immediately load with 30+ pre-seeded grocery products, sample orders, and full interactive cart/admin capabilities out of the box!

---

## 🗄️ Supabase Database Setup Guide

To connect your own hosted Supabase PostgreSQL database:

### Step 1: Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and click **New Project**.
2. Name your project (e.g. `freshmart-local`) and set a secure database password.

### Step 2: Run the Database Schema
1. In your Supabase project dashboard, click on **SQL Editor** from the left navigation.
2. Click **New Query**.
3. Open the file `supabase/schema.sql` from this repository, copy its entire contents, paste it into the SQL Editor, and click **Run**.
4. This will create:
   - Tables: `profiles`, `categories`, `products`, `inventory_adjustments`, `addresses`, `orders`, `order_items`.
   - Triggers for automatic user profile creation and updated timestamps.
   - Row Level Security (RLS) policies for customers and store administrators.
   - Seed data for 9 categories and 30+ products.

### Step 3: Configure Environment Variables
1. In your Supabase dashboard, go to **Project Settings** → **API**.
2. Copy the **Project URL** and the **Anon Public Key**.
3. Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
4. Restart your development server (`npm run dev`). FreshMart Local will now synchronize directly with your live Supabase database!

---

## ☁️ Deployment Instructions

### Deploying Frontend to Vercel
1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **Add New** → **Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click **Deploy**. Vercel will build and launch your site with a live URL and global CDN.

---

## 📂 Project Structure

```
├── supabase/
│   └── schema.sql                 # Complete Postgres database schema, RLS, triggers & seed
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with providers & toast notifications
│   │   ├── page.tsx               # Storefront Home page (Hero, Categories, Deals, Featured)
│   │   ├── products/
│   │   │   ├── page.tsx           # Product catalog with search, filter, and sort
│   │   │   └── [slug]/page.tsx    # Product detail page
│   │   ├── cart/
│   │   │   └── page.tsx           # Shopping basket with coupon vouchers & fee breakdowns
│   │   ├── checkout/
│   │   │   └── page.tsx           # Checkout flow with stock validation & order creation
│   │   ├── order-success/[id]/
│   │   │   └── page.tsx           # Order confirmation & live 5-stage tracking timeline
│   │   ├── account/
│   │   │   └── page.tsx           # Customer profile & order history with 1-click reorder
│   │   └── admin/
│   │       ├── layout.tsx         # Admin sidebar and layout navigation
│   │       ├── page.tsx           # Admin KPI Dashboard & overview
│   │       ├── products/page.tsx  # Product catalog management (CRUD, active/featured)
│   │       ├── inventory/page.tsx # Inventory management & adjustment audit logs
│   │       ├── orders/page.tsx    # Order fulfillment & status manager
│   │       └── database/page.tsx  # Supabase schema & demo data utilities
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Top bar, live search, location selector, cart button
│   │   │   ├── Footer.tsx         # Footer with store hours, policies & contact info
│   │   │   └── AdminSidebar.tsx   # Admin navigation bar with alert badges
│   │   ├── storefront/
│   │   │   ├── HeroBanner.tsx     # Promotional banner slider & flash deals
│   │   │   ├── CategoryBar.tsx    # 9 Category quick-links & icons
│   │   │   ├── ProductCard.tsx    # Grocery product card with stock badges & steppers
│   │   │   ├── CartDrawer.tsx     # Slide-over cart drawer with free shipping progress
│   │   │   └── DealsSection.tsx   # Discount deals showcase with live countdown
│   │   ├── admin/
│   │   │   ├── ProductModal.tsx   # Add/Edit product form with image preview
│   │   │   ├── StockAdjustModal.tsx # Stock adjustments with mandatory reason logging
│   │   │   └── OrderDetailModal.tsx # Order details & fulfillment status updater
│   │   └── ui/
│   │       ├── AuthModal.tsx      # Sign in / Sign up modal with 1-click demo switcher
│   │       ├── Toast.tsx          # Interactive notification alerts
│   │       └── DemoBar.tsx        # Switch between Customer & Admin demo modes
│   ├── context/
│   │   ├── CartContext.tsx        # Shopping cart state, stock checks & local storage
│   │   ├── StoreContext.tsx       # Data layer (Products, Inventory, Orders, Adjustments)
│   │   ├── AuthContext.tsx        # Authentication & Role state
│   │   └── ToastContext.tsx       # Global toast notification alerts
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client configuration & fallback detection
│   │   ├── seedData.ts            # 30+ realistic grocery items across 9 categories
│   │   └── types.ts               # TypeScript interfaces for all entities
│   └── styles/
│       └── globals.css            # Tailwind directives and custom animation styles
├── tailwind.config.js
├── tsconfig.json
├── next.config.mjs
└── package.json
```
