/*
================================================================================
ORIGINAL WATCHES STORE - COMPLETE DATABASE SCHEMA
================================================================================
This is the comprehensive migration file for the entire e-commerce database.
Run this in Supabase SQL editor or via CLI.
Date: 2026-07-11
================================================================================
*/

-- ============================================================================
-- 1. CREATE EXTENSIONS
-- ============================================================================

-- Enable UUID generation (should already be enabled, but ensure it)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- TABLE: ecom_products
-- Description: Core product data for the e-commerce store
CREATE TABLE IF NOT EXISTS public.ecom_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL, -- URL slug
  vendor TEXT NOT NULL, -- Brand name
  product_type TEXT, -- Category (e.g., 'Analog', 'Digital', 'Smartwatch')
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  compare_at_price INTEGER, -- Original price before discount (in cents)
  inventory_qty INTEGER DEFAULT 0,
  images TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of image URLs
  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- Tags like 'sale', 'bestseller'
  sku TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'draft', 'archived'
  new_arrival BOOLEAN DEFAULT false, -- Flag for homepage "Latest Products" section
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: ecom_collections
-- Description: Brand/Category collections
CREATE TABLE IF NOT EXISTS public.ecom_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: ecom_product_collections
-- Description: Many-to-Many relationship between products and collections
CREATE TABLE IF NOT EXISTS public.ecom_product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ecom_products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.ecom_collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, collection_id)
);

-- TABLE: ecom_customers
-- Description: Customer information
CREATE TABLE IF NOT EXISTS public.ecom_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address JSONB, -- Structured address data: {line1, city, state, postal_code, country}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: ecom_orders
-- Description: Orders and checkout tracking
CREATE TABLE IF NOT EXISTS public.ecom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.ecom_customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'
  subtotal INTEGER NOT NULL, -- in cents
  tax INTEGER DEFAULT 0, -- in cents
  shipping INTEGER NOT NULL, -- in cents
  total INTEGER NOT NULL, -- in cents
  shipping_address JSONB NOT NULL, -- {name, line1, city, state, postal_code, country, phone, email}
  notes TEXT, -- Payment method, coupon code, special instructions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: ecom_order_items
-- Description: Line items within orders
CREATE TABLE IF NOT EXISTS public.ecom_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.ecom_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.ecom_products(id),
  variant_id UUID, -- For future product variants
  product_name TEXT NOT NULL, -- Denormalized for record keeping
  variant_title TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- in cents
  total INTEGER NOT NULL, -- quantity × unit_price (in cents)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: admin_users
-- Description: Admin user authentication and management
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- SHA-256 hash (frontend handles hashing)
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: chat_messages
-- Description: Live chat system for customer support
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL, -- Customer session identifier
  sender TEXT NOT NULL, -- 'customer' or 'admin'
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: shop_settings
-- Description: Store configuration and metadata
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Only one row
  shop_name TEXT,
  whatsapp TEXT, -- WhatsApp number
  email TEXT,
  telegram_url TEXT, -- Telegram group/channel URL
  shipping_fee INTEGER DEFAULT 999, -- in cents (default $9.99)
  promo_text TEXT, -- Banner text for promotions
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: contact_messages
-- Description: Contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_handle ON public.ecom_products(handle);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.ecom_products(vendor);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.ecom_products(status);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.ecom_products(new_arrival);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.ecom_products(created_at DESC);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.ecom_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.ecom_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.ecom_orders(created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.ecom_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.ecom_order_items(product_id);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.ecom_customers(email);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id, created_at);

-- Product collections indexes
CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON public.ecom_product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON public.ecom_product_collections(collection_id);

-- ============================================================================
-- 4. CREATE RPC FUNCTIONS & STORED PROCEDURES
-- ============================================================================

-- FUNCTION: verify_admin_login
-- Purpose: Authenticate admin users by username and password hash
-- Returns: success boolean, user_id, and message
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  message TEXT
) AS $$
DECLARE
  v_user_id UUID;
  v_password_hash TEXT;
  v_is_active BOOLEAN;
BEGIN
  -- Get the admin user
  SELECT id, password_hash, is_active 
  INTO v_user_id, v_password_hash, v_is_active
  FROM public.admin_users
  WHERE username = p_username
  LIMIT 1;

  -- Check if user exists
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Invalid credentials'::TEXT;
    RETURN;
  END IF;

  -- Check if user is active
  IF NOT v_is_active THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Account is inactive'::TEXT;
    RETURN;
  END IF;

  -- Verify password (compare SHA-256 hash from frontend)
  -- Frontend hashes with: SHA256("admin_salt_2024" + password)
  IF v_password_hash = p_password THEN
    RETURN QUERY SELECT true, v_user_id, 'Login successful'::TEXT;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, 'Invalid credentials'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCTION: get_order_summary
-- Purpose: Get complete order details with customer and items (for admin dashboard)
-- Returns: Order with customer name/email and item count
CREATE OR REPLACE FUNCTION public.get_order_summary(p_order_id UUID)
RETURNS TABLE (
  order_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  total_amount INTEGER,
  status TEXT,
  item_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    c.name,
    c.email,
    o.total,
    o.status,
    COUNT(oi.id)::INTEGER,
    o.created_at
  FROM public.ecom_orders o
  LEFT JOIN public.ecom_customers c ON o.customer_id = c.id
  LEFT JOIN public.ecom_order_items oi ON o.id = oi.order_id
  WHERE o.id = p_order_id
  GROUP BY o.id, c.name, c.email, o.total, o.status, o.created_at;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: search_products
-- Purpose: Full-text search and filtering for products
-- Returns: Products matching search criteria
CREATE OR REPLACE FUNCTION public.search_products(
  p_search_text TEXT DEFAULT '',
  p_category TEXT DEFAULT NULL,
  p_brand TEXT DEFAULT NULL,
  p_min_price INTEGER DEFAULT 0,
  p_max_price INTEGER DEFAULT 999999999,
  p_status TEXT DEFAULT 'active'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  handle TEXT,
  vendor TEXT,
  price INTEGER,
  compare_at_price INTEGER,
  image_url TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.handle,
    p.vendor,
    p.price,
    p.compare_at_price,
    (p.images[1])::TEXT,
    p.status
  FROM public.ecom_products p
  WHERE p.status = p_status
    AND p.price >= p_min_price
    AND p.price <= p_max_price
    AND (p_category IS NULL OR p.product_type = p_category)
    AND (p_brand IS NULL OR p.vendor = p_brand)
    AND (p_search_text = '' OR 
         p.name ILIKE '%' || p_search_text || '%' OR
         p.description ILIKE '%' || p_search_text || '%' OR
         p.vendor ILIKE '%' || p_search_text || '%')
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION: get_dashboard_stats
-- Purpose: Get quick statistics for admin dashboard
-- Returns: Total orders, revenue, product count, message count
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue INTEGER,
  total_products BIGINT,
  total_messages BIGINT,
  pending_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.ecom_orders)::BIGINT,
    (SELECT COALESCE(SUM(total), 0)::INTEGER FROM public.ecom_orders WHERE status != 'cancelled')::INTEGER,
    (SELECT COUNT(*) FROM public.ecom_products WHERE status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM public.chat_messages)::BIGINT,
    (SELECT COUNT(*) FROM public.ecom_orders WHERE status = 'pending')::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. INITIAL DATA (DEFAULTS & CONFIGURATION)
-- ============================================================================

-- Initialize shop settings with defaults
INSERT INTO public.shop_settings (id, shop_name, whatsapp, email, telegram_url, shipping_fee, promo_text)
VALUES (1, 'Original Watches Store', '', '', '', 999, '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5b. DATA MIGRATION: Fix vendor/brand naming
-- ============================================================================
-- Normalize any vendor values equal to 'tem' (case-insensitive, trimmed)
-- to the corrected brand name 'Tudor '. Run this when deploying the schema
-- to ensure existing product rows are updated.
UPDATE public.ecom_products
SET vendor = 'Tudor '
WHERE lower(trim(vendor)) = 'tem';

-- ============================================================================
-- 6. DOCUMENTATION & NOTES
-- ============================================================================

/*
DATABASE SCHEMA DOCUMENTATION
==============================

TABLE PURPOSES:
- ecom_products: All products in the store with pricing and metadata
- ecom_collections: Brand/category groupings for products
- ecom_product_collections: Bridge table for many-to-many product-collection relationship
- ecom_customers: Customer contact information
- ecom_orders: Orders/carts and checkout tracking
- ecom_order_items: Individual line items within orders
- admin_users: Admin authentication and user management
- chat_messages: Live chat messages between customers and admins
- shop_settings: Global store configuration (single row, id=1)
- contact_messages: Contact form submissions

KEY FEATURES:
1. PRICES IN CENTS: All prices are stored as integers (cents) to avoid float precision issues
   - Display: divide by 100
   - Store: multiply by 100

2. PRODUCT VARIANTS: Supports future variants via variant_id in order_items (currently unused)

3. STATUS TRACKING:
   - Products: active, draft, archived
   - Orders: pending (awaiting payment), paid, shipped, delivered, cancelled, refunded

4. IMAGES & TAGS:
   - Images: TEXT[] array of URLs (first image used as thumbnail)
   - Tags: TEXT[] array (e.g., ['sale', 'bestseller'])

5. DENORMALIZATION:
   - Order items store product_name, variant_title, sku for historical record keeping
   - Allows product deletion without losing order data

6. ADDRESSES:
   - Customer address: JSONB with optional fields
   - Shipping address: JSONB with required fields {name, line1, city, state, postal_code, country, phone, email}

SECURITY NOTES:
- Admin passwords: SHA-256 hash (should migrate to Supabase Auth in production)
- RLS policies: Not configured - implement for multi-tenant security
- Chat: Session-based, not tied to auth system
- All timestamps use timezone-aware TIMESTAMP WITH TIME ZONE

ADMIN ROUTES & FUNCTIONS:
- /admin → Login (verify_admin_login)
- /admin/dashboard → Dashboard stats (get_dashboard_stats)
- /admin/products → CRUD products
- /admin/orders → View/manage orders
- /admin/messages → Live chat sessions
- /admin/settings → Modify shop_settings
- /admin/admins → Manage admin_users

API INTEGRATION:
- famous.ai CRM: Email/SMS subscriptions via API (not database-driven)
- Stripe: Future payments (not in current schema)
- Email/SMS: Manual configuration via shop_settings
*/

-- ============================================================================
-- 7. GRANT PERMISSIONS (Optional - for multi-user access)
-- ============================================================================

-- If using Supabase, RLS should be configured via the dashboard.
-- For now, tables are accessible via Supabase client with appropriate auth.

-- Example: Grant anon role read access to products
-- GRANT SELECT ON public.ecom_products TO anon;
-- GRANT SELECT ON public.ecom_collections TO anon;

-- Example: Grant authenticated role full access to orders they own
-- (Implement with RLS policies instead)

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
