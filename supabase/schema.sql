-- ==============================================================================
-- FRESHMART LOCAL - SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('pending', 'confirmed', 'packed', 'out_for_delivery', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- NOTE: must list every value in src/lib/types.ts -> PaymentMethod.
-- The app sends 'upi_intent', 'bank_transfer' and 'digital_wallet' too; leaving
-- them out makes every UPI/card order fail with "invalid input value for enum".
DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM (
        'cash_on_delivery', 'pay_at_store', 'card_online',
        'upi_intent', 'bank_transfer', 'digital_wallet'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- If the type already existed from an earlier run, top it up.
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'upi_intent';
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'bank_transfer';
ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'digital_wallet';

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE adjustment_type AS ENUM ('restock', 'sale', 'cancellation_restore', 'damaged', 'expired', 'manual_count');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLES DEFINITIONS
-- ==============================================================================

-- PROFILES (Linked to Supabase Auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL DEFAULT 'ShoppingBag',
    description TEXT DEFAULT '',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod_' || substr(md5(random()::text), 1, 10)),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
    unit TEXT NOT NULL DEFAULT '1 item', -- e.g., '1 kg', '500 g', '1 packet', '6 pcs'
    image_url TEXT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 5 CHECK (reorder_level >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVENTORY ADJUSTMENTS (Audit Log)
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    adjustment_type adjustment_type NOT NULL,
    quantity_change INT NOT NULL, -- e.g. +20 for restock, -2 for sale or damaged
    previous_quantity INT NOT NULL CHECK (previous_quantity >= 0),
    new_quantity INT NOT NULL CHECK (new_quantity >= 0),
    reason TEXT NOT NULL,
    performed_by TEXT NOT NULL DEFAULT 'System',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    landmark TEXT DEFAULT '',
    city TEXT NOT NULL DEFAULT 'Local City',
    postal_code TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address JSONB NOT NULL, -- JSON structure of shipping address or pickup point
    fulfillment_type fulfillment_type NOT NULL DEFAULT 'delivery',
    delivery_slot TEXT NOT NULL DEFAULT 'Standard (Within 45 mins)',
    payment_method payment_method_type NOT NULL DEFAULT 'cash_on_delivery',
    payment_status payment_status_type NOT NULL DEFAULT 'pending',
    order_status order_status_type NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    utr_number TEXT,
    payment_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (delivery_fee >= 0),
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- ==============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_prod ON public.inventory_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_time ON public.inventory_adjustments(created_at DESC);

-- ==============================================================================
-- 5. TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_products_modtime
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_orders_modtime
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto Create Profile when Auth User Signs Up
--
-- SECURITY: role is ALWAYS forced to 'customer'. It must never be read from
-- raw_user_meta_data, because that is supplied by the browser at sign-up — a
-- visitor could simply post {"role":"admin"} and mint themselves an admin
-- account. Admins are promoted by hand; see section 9 at the bottom.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'customer'
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin.
-- SECURITY DEFINER so it can read profiles without tripping profiles' own RLS
-- (which would recurse). search_path is pinned so a rogue temp schema cannot
-- shadow `profiles` and trick the function into returning true.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- Stop users from promoting themselves by PATCHing their own profile row.
-- The UPDATE policy below lets a user edit their profile; without this guard
-- that includes the `role` column.
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- auth.uid() IS NULL means there is no end-user JWT on the request: this is
    -- the SQL Editor or the service role. That is the intended promotion path
    -- (see section 9), so let it through. A browser request always carries a
    -- JWT, and anon has no UPDATE grant on profiles anyway.
    IF NEW.role IS DISTINCT FROM OLD.role
       AND auth.uid() IS NOT NULL
       AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an administrator can change a profile role';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Categories Policies (Public read, admin write)
DROP POLICY IF EXISTS "Public categories read" ON public.categories;
CREATE POLICY "Public categories read" ON public.categories
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin categories manage" ON public.categories;
CREATE POLICY "Admin categories manage" ON public.categories
    FOR ALL USING (public.is_admin());

-- Products Policies (Public can read active products, Admin can manage all)
DROP POLICY IF EXISTS "Public active products read" ON public.products;
CREATE POLICY "Public active products read" ON public.products
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin products manage" ON public.products;
CREATE POLICY "Admin products manage" ON public.products
    FOR ALL USING (public.is_admin());

-- Inventory Adjustments Policies (Admin only)
DROP POLICY IF EXISTS "Admin inventory adjustments view" ON public.inventory_adjustments;
CREATE POLICY "Admin inventory adjustments view" ON public.inventory_adjustments
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin inventory adjustments insert" ON public.inventory_adjustments;
CREATE POLICY "Admin inventory adjustments insert" ON public.inventory_adjustments
    FOR INSERT WITH CHECK (public.is_admin());

-- Addresses Policies (Users can manage their own addresses)
DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Orders Policies (Customers read own, can insert; Admin can manage all)
DROP POLICY IF EXISTS "Customers view own orders" ON public.orders;
CREATE POLICY "Customers view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- NOTE: there is deliberately NO direct INSERT policy for customers.
-- Orders are created only through public.place_order() below, which recomputes
-- every price server-side. A direct insert policy would let anyone POST an
-- order with total = 0.01, because the browser controls the request body.

DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;
CREATE POLICY "Admin manage orders" ON public.orders
    FOR ALL USING (public.is_admin());

-- Order Items Policies
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Likewise no INSERT policy here: WITH CHECK (true) would have allowed any
-- visitor to append arbitrary line items onto anyone else's order.
-- place_order() is SECURITY DEFINER, so it bypasses RLS and writes them itself.

-- ==============================================================================
-- 7. INITIAL SEED DATA (9 Categories + 30+ Products)
-- ==============================================================================

INSERT INTO public.categories (id, name, slug, icon, description, display_order) VALUES
('cat_produce', 'Fruits & Vegetables', 'fruits-vegetables', 'Apple', 'Farm fresh organic fruits and crisp garden vegetables', 1),
('cat_dairy', 'Dairy & Eggs', 'dairy-eggs', 'Milk', 'Farm-fresh milk, butter, cheese, yogurt, and free-range eggs', 2),
('cat_bakery', 'Bakery & Bread', 'bakery-bread', 'Croissant', 'Artisanal breads, buns, croissants, and morning pastries', 3),
('cat_snacks', 'Snacks & Munchies', 'snacks-munchies', 'Cookie', 'Crisps, roasted nuts, cookies, crackers, and chocolates', 4),
('cat_beverages', 'Cold Beverages & Juices', 'beverages', 'Coffee', 'Cold-pressed juices, soft drinks, sparkling water, and teas', 5),
('cat_staples', 'Organic Staples & Grains', 'staples-grains', 'Wheat', 'Rice, flours, pulses, premium olive oil, and spices', 6),
('cat_household', 'Household & Cleaning', 'household-cleaning', 'Sparkles', 'Eco-friendly detergents, paper towels, and dishwash soaps', 7),
('cat_personal', 'Personal Care', 'personal-care', 'Heart', 'Natural soaps, shampoos, skincare, and oral hygiene', 8),
('cat_frozen', 'Frozen Foods', 'frozen-foods', 'Snowflake', 'Frozen veggies, berries, ice creams, and ready-to-bake meals', 9)
ON CONFLICT (id) DO NOTHING;

-- Insert initial sample products
INSERT INTO public.products (id, name, slug, category_id, price, compare_at_price, unit, image_url, description, stock_quantity, reorder_level, is_active, is_featured) VALUES
('prod_01', 'Fresh Organic Bananas', 'fresh-organic-bananas', 'cat_produce', 1.99, 2.49, '1 bunch (approx. 1 kg)', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80', 'Sweet and naturally ripened organic Cavendish bananas directly sourced from certified sustainable farms.', 45, 10, true, true),
('prod_02', 'Crisp Honeycrisp Apples', 'crisp-honeycrisp-apples', 'cat_produce', 3.99, 4.99, '1 kg bag', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80', 'Extra juicy and crunchy premium Honeycrisp apples, bursting with fresh sweet-tart flavor.', 28, 8, true, true),
('prod_03', 'Organic Hass Avocados', 'organic-hass-avocados', 'cat_produce', 4.49, 5.99, 'Pack of 3', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80', 'Creamy, perfectly ripe Hass avocados rich in healthy monounsaturated fats and essential nutrients.', 18, 5, true, true),
('prod_04', 'Baby Spinach Leaves', 'baby-spinach-leaves', 'cat_produce', 2.49, 2.99, '250 g pack', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80', 'Tender pre-washed baby spinach leaves ideal for healthy morning smoothies, crisp salads, and pasta.', 12, 6, true, false),
('prod_05', 'Farm Fresh Whole Milk', 'farm-fresh-whole-milk', 'cat_dairy', 3.29, 3.79, '1 Gallon / 3.8 L', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80', 'Pasteurized and homogenized whole milk from pasture-raised local cows, enriched with Vitamin D.', 32, 10, true, true),
('prod_06', 'Free Range Brown Eggs', 'free-range-brown-eggs', 'cat_dairy', 4.19, 4.89, 'Dozen (12 pcs)', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop&q=80', 'Grade-A large brown eggs from free-roaming hens fed on natural 100% vegetarian grains.', 22, 6, true, true),
('prod_07', 'Artisanal Sourdough Bread', 'artisanal-sourdough-bread', 'cat_bakery', 4.99, 5.99, '1 Loaf (600 g)', 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80', 'Traditional slow-fermented crusty sourdough bread with a chewy interior and rich tangy crust.', 14, 4, true, true),
('prod_08', 'Fresh Butter Croissants', 'fresh-butter-croissants', 'cat_bakery', 5.49, 6.49, 'Pack of 4', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80', 'Flaky, buttery French-style croissants baked fresh every morning with 100% pure European butter.', 9, 4, true, false),
('prod_09', 'Extra Virgin Olive Oil', 'extra-virgin-olive-oil', 'cat_staples', 12.99, 15.99, '750 ml Bottle', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', 'First cold-pressed unrefined extra virgin olive oil with rich fruity aroma and peppery finish.', 16, 5, true, true),
('prod_10', 'Aged Basmati Rice', 'aged-basmati-rice', 'cat_staples', 11.49, 13.99, '5 kg Bag', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', 'Royal long-grain aromatic aged Basmati rice that cooks into fluffy, non-sticky fragrant grains.', 25, 6, true, false),
('prod_11', 'Fresh Squeezed Orange Juice', 'fresh-squeezed-orange-juice', 'cat_beverages', 4.79, 5.49, '1 L Bottle', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', '100% pure squeezed Florida orange juice with pulp. No added sugar or preservatives.', 20, 5, true, true),
('prod_12', 'Sparkling Mineral Water', 'sparkling-mineral-water', 'cat_beverages', 2.19, 2.79, '750 ml Glass Bottle', 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&auto=format&fit=crop&q=80', 'Naturally effervescent alpine mineral water packed in premium recyclable glass bottles.', 35, 10, true, false),
('prod_13', 'Organic Greek Yogurt', 'organic-greek-yogurt', 'cat_dairy', 3.89, 4.49, '500 g Tub', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80', 'Thick, creamy plain Greek yogurt with 15g protein per serving and active probiotic cultures.', 19, 6, true, false),
('prod_14', 'Roasted Sea Salt Almonds', 'roasted-sea-salt-almonds', 'cat_snacks', 6.99, 8.49, '300 g Pouch', 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&auto=format&fit=crop&q=80', 'Crunchy dry-roasted California almonds lightly seasoned with pure Pacific sea salt.', 24, 6, true, true),
('prod_15', 'Eco Dishwashing Liquid', 'eco-dishwashing-liquid', 'cat_household', 3.49, 4.29, '500 ml Bottle', 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?w=600&auto=format&fit=crop&q=80', 'Plant-powered biodegradable dish soap that cuts through grease while being gentle on hands.', 30, 8, true, false)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 8. SERVER-SIDE TRANSACTIONS (RPC)
-- ==============================================================================
-- Everything that must be atomic, or must not be trusted to the browser, lives
-- here. These run as SECURITY DEFINER, so they bypass RLS on purpose and are
-- responsible for their own authorisation checks.

-- ------------------------------------------------------------------------------
-- place_order: the only way an order is created.
--
-- Why an RPC instead of client-side inserts:
--   1. Atomicity  - stock check, stock deduction, order, line items and the
--                   audit rows either all commit or all roll back. The old
--                   client-side version could deduct stock and then fail to
--                   write the order, losing inventory with nothing to show.
--   2. Oversell   - two shoppers buying the last item at the same moment both
--                   passed the client-side check. FOR UPDATE row locks serialise
--                   them, so the second one is told it is out of stock.
--   3. Pricing    - prices, tax and totals are recomputed from the products
--                   table. The browser sends product ids and quantities only,
--                   so a tampered request cannot buy a $40 item for $0.01.
--   4. RLS        - a customer has no UPDATE rights on products, so they could
--                   never deduct their own stock. This function can.
--
-- p_items shape: [{"product_id": "prod_1", "quantity": 2}, ...]
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.place_order(
    p_items            JSONB,
    p_customer_name    TEXT,
    p_phone            TEXT,
    p_email            TEXT,
    p_address          JSONB,
    p_fulfillment_type fulfillment_type DEFAULT 'delivery',
    p_delivery_slot    TEXT DEFAULT 'Standard (Within 45 mins)',
    p_payment_method   payment_method_type DEFAULT 'cash_on_delivery',
    p_payment_status   payment_status_type DEFAULT 'pending',
    p_payment_details  JSONB DEFAULT '{}'::jsonb,
    p_transaction_id   TEXT DEFAULT NULL,
    p_utr_number       TEXT DEFAULT NULL,
    p_notes            TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order_id      UUID;
    v_order_number  TEXT;
    v_item          JSONB;
    v_product       public.products%ROWTYPE;
    v_qty           INT;
    v_line_total    NUMERIC(10,2);
    v_subtotal      NUMERIC(10,2) := 0;
    v_delivery_fee  NUMERIC(10,2) := 0;
    v_tax           NUMERIC(10,2) := 0;
    v_total         NUMERIC(10,2) := 0;
    -- These three MUST match src/context/CartContext.tsx, or the total the
    -- shopper was shown will differ from the total actually charged.
    v_free_over     NUMERIC(10,2) := 35.00;  -- FREE_DELIVERY_THRESHOLD
    v_flat_fee      NUMERIC(10,2) := 3.99;   -- STANDARD_DELIVERY_FEE
    v_tax_rate      NUMERIC(6,4)  := 0.08;   -- TAX_RATE (8%)
BEGIN
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Your basket is empty';
    END IF;

    -- Pass 1: lock each product row, verify stock, and price the line.
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_qty := GREATEST((v_item->>'quantity')::INT, 0);
        IF v_qty = 0 THEN
            CONTINUE;
        END IF;

        SELECT * INTO v_product
        FROM public.products
        WHERE id = v_item->>'product_id'
        FOR UPDATE;                         -- serialises concurrent checkouts

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is no longer available', v_item->>'product_id';
        END IF;

        IF NOT v_product.is_active THEN
            RAISE EXCEPTION '% has been delisted', v_product.name;
        END IF;

        IF v_product.stock_quantity < v_qty THEN
            RAISE EXCEPTION 'Only % left of %', v_product.stock_quantity, v_product.name;
        END IF;

        v_subtotal := v_subtotal + (v_product.price * v_qty);
    END LOOP;

    IF v_subtotal = 0 THEN
        RAISE EXCEPTION 'Your basket is empty';
    END IF;

    IF p_fulfillment_type = 'delivery' AND v_subtotal < v_free_over THEN
        v_delivery_fee := v_flat_fee;
    END IF;

    v_tax   := ROUND(v_subtotal * v_tax_rate, 2);
    v_total := v_subtotal + v_delivery_fee + v_tax;

    v_order_number := 'FM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                      LPAD((FLOOR(RANDOM() * 100000))::TEXT, 5, '0');

    INSERT INTO public.orders (
        user_id, order_number, customer_name, phone, email, address,
        fulfillment_type, delivery_slot, payment_method, payment_status,
        order_status, transaction_id, utr_number, payment_details,
        subtotal, delivery_fee, tax, total, notes
    ) VALUES (
        auth.uid(), v_order_number, p_customer_name, p_phone, p_email, p_address,
        p_fulfillment_type, p_delivery_slot, p_payment_method, p_payment_status,
        (CASE WHEN p_payment_status = 'paid' THEN 'confirmed' ELSE 'pending' END)::order_status_type,
        p_transaction_id, p_utr_number, COALESCE(p_payment_details, '{}'::jsonb),
        v_subtotal, v_delivery_fee, v_tax, v_total, COALESCE(p_notes, '')
    )
    RETURNING id INTO v_order_id;

    -- Pass 2: write line items, deduct stock, log the audit trail.
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_qty := GREATEST((v_item->>'quantity')::INT, 0);
        IF v_qty = 0 THEN
            CONTINUE;
        END IF;

        SELECT * INTO v_product
        FROM public.products
        WHERE id = v_item->>'product_id';

        v_line_total := v_product.price * v_qty;

        INSERT INTO public.order_items (
            order_id, product_id, product_name, unit, unit_price, quantity, subtotal
        ) VALUES (
            v_order_id, v_product.id, v_product.name, v_product.unit,
            v_product.price, v_qty, v_line_total
        );

        UPDATE public.products
        SET stock_quantity = stock_quantity - v_qty
        WHERE id = v_product.id;

        INSERT INTO public.inventory_adjustments (
            product_id, adjustment_type, quantity_change,
            previous_quantity, new_quantity, reason, performed_by
        ) VALUES (
            v_product.id, 'sale', -v_qty,
            v_product.stock_quantity, v_product.stock_quantity - v_qty,
            'Order ' || v_order_number, COALESCE(p_customer_name, 'Storefront')
        );
    END LOOP;

    -- Return the whole order, items included, rather than just an id.
    -- A guest checkout has user_id = NULL, and the SELECT policy on orders
    -- compares auth.uid() = user_id, which is NULL = NULL -> never true. So a
    -- guest could place an order and then be unable to read it back for their
    -- own receipt. Returning it here sidesteps that entirely.
    RETURN (
        SELECT to_jsonb(o) || jsonb_build_object(
            'items', COALESCE(
                (SELECT jsonb_agg(to_jsonb(oi)) FROM public.order_items oi WHERE oi.order_id = o.id),
                '[]'::jsonb
            )
        )
        FROM public.orders o
        WHERE o.id = v_order_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.place_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order TO anon, authenticated;


-- ------------------------------------------------------------------------------
-- admin_adjust_stock: stock change + audit row in one transaction.
-- Checks is_admin() itself, because SECURITY DEFINER skips RLS.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_adjust_stock(
    p_product_id      TEXT,
    p_adjustment_type adjustment_type,
    p_quantity_change INT,
    p_reason          TEXT,
    p_performed_by    TEXT DEFAULT 'Store Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_product public.products%ROWTYPE;
    v_new_qty INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Administrator access required';
    END IF;

    IF p_reason IS NULL OR btrim(p_reason) = '' THEN
        RAISE EXCEPTION 'A reason is required for every stock adjustment';
    END IF;

    SELECT * INTO v_product FROM public.products WHERE id = p_product_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No such product: %', p_product_id;
    END IF;

    -- p_quantity_change is ALWAYS a delta, including for manual_count.
    -- StockAdjustModal.tsx converts a physical count into (count - current)
    -- before calling, so treating it as absolute here would corrupt the figure.
    v_new_qty := v_product.stock_quantity + p_quantity_change;

    IF v_new_qty < 0 THEN
        RAISE EXCEPTION 'That would leave stock at %, which is below zero', v_new_qty;
    END IF;

    UPDATE public.products SET stock_quantity = v_new_qty WHERE id = p_product_id;

    INSERT INTO public.inventory_adjustments (
        product_id, adjustment_type, quantity_change,
        previous_quantity, new_quantity, reason, performed_by
    ) VALUES (
        p_product_id, p_adjustment_type, v_new_qty - v_product.stock_quantity,
        v_product.stock_quantity, v_new_qty, p_reason, p_performed_by
    );

    RETURN jsonb_build_object(
        'product_id',        p_product_id,
        'previous_quantity', v_product.stock_quantity,
        'new_quantity',      v_new_qty
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_adjust_stock FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_adjust_stock TO authenticated;


-- ------------------------------------------------------------------------------
-- admin_cancel_order: cancel + restore reserved stock atomically.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_cancel_order(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order  public.orders%ROWTYPE;
    v_line   public.order_items%ROWTYPE;
    v_before INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Administrator access required';
    END IF;

    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No such order';
    END IF;

    IF v_order.order_status = 'cancelled' THEN
        RAISE EXCEPTION 'That order is already cancelled';
    END IF;

    FOR v_line IN SELECT * FROM public.order_items WHERE order_id = p_order_id
    LOOP
        SELECT stock_quantity INTO v_before
        FROM public.products WHERE id = v_line.product_id FOR UPDATE;

        UPDATE public.products
        SET stock_quantity = stock_quantity + v_line.quantity
        WHERE id = v_line.product_id;

        INSERT INTO public.inventory_adjustments (
            product_id, adjustment_type, quantity_change,
            previous_quantity, new_quantity, reason, performed_by
        ) VALUES (
            v_line.product_id, 'cancellation_restore', v_line.quantity,
            v_before, v_before + v_line.quantity,
            'Order ' || v_order.order_number || ' cancelled - stock restored',
            'Store Admin'
        );
    END LOOP;

    UPDATE public.orders SET order_status = 'cancelled' WHERE id = p_order_id;

    RETURN jsonb_build_object('id', p_order_id, 'order_status', 'cancelled');
END;
$$;

REVOKE ALL ON FUNCTION public.admin_cancel_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_cancel_order TO authenticated;


-- ==============================================================================
-- 9. CREATING YOUR FIRST ADMIN
-- ==============================================================================
-- Roles are never self-assigned. Sign up through the site like a normal
-- customer, then run this once in the Supabase SQL Editor with your own email:
--
--     UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
--
-- Confirm it took effect:
--
--     SELECT email, role FROM public.profiles ORDER BY created_at;
--
-- Sign out and back in for the new role to load. Note that the SQL Editor runs
-- as the service role and so bypasses the guard trigger above; that is expected
-- and is the only intended path to admin.
