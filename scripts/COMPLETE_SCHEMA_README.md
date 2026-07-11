# Complete Database Schema - Usage Guide

## Overview

The file **`003_complete_database_schema.sql`** contains the ENTIRE database schema needed for your Original Watches Store e-commerce application. This single SQL file includes:

- ✅ 10 fully normalized database tables
- ✅ All relationships and foreign keys
- ✅ 5 indexes for performance optimization
- ✅ 4 RPC functions for backend operations
- ✅ Initial default configuration
- ✅ Complete documentation

## How to Use This File

### Option 1: Supabase Web Dashboard (Easiest)

1. Log in to your **Supabase project**
2. Go to **SQL Editor**
3. Click **"New Query"**
4. **Copy and paste the entire contents** of `003_complete_database_schema.sql`
5. Click **"Run"** (or Cmd/Ctrl + Enter)
6. ✅ Your database is now fully configured

### Option 2: Supabase CLI

```bash
# From your project root
supabase db push < scripts/003_complete_database_schema.sql
```

### Option 3: psql Command Line

```bash
# Using your Supabase connection string
psql "$DATABASE_URL" -f scripts/003_complete_database_schema.sql
```

---

## What Gets Created

### Tables (10 total)

| Table | Purpose | Records |
|-------|---------|---------|
| `ecom_products` | All store products with pricing, images, inventory | Product catalog |
| `ecom_collections` | Brand/category groupings | Brand categorization |
| `ecom_product_collections` | Many-to-many relationship | Product-to-brand mappings |
| `ecom_customers` | Customer contact information | Customer directory |
| `ecom_orders` | Orders and checkout records | Order tracking |
| `ecom_order_items` | Line items within orders | Order details |
| `admin_users` | Admin authentication | Admin accounts |
| `chat_messages` | Live chat transcripts | Support conversations |
| `shop_settings` | Store configuration (single row) | Store metadata |
| `contact_messages` | Contact form submissions | Inquiry logs |

### RPC Functions (4 total)

| Function | Purpose | Usage |
|----------|---------|-------|
| `verify_admin_login(username, password)` | Admin authentication | Called during admin login |
| `get_order_summary(order_id)` | Fetch order with customer and items | Admin dashboard |
| `search_products(text, category, brand, price_range)` | Full-text product search | Product filtering/search |
| `get_dashboard_stats()` | Quick stats for dashboard | Admin dashboard stats |

### Indexes (10 total)

Created for common queries:
- Products by: handle, vendor, status, new_arrival, creation date
- Orders by: customer_id, status, creation date
- Orders items by: order_id, product_id
- Chat by: session_id + creation date
- Collections by: product_id, collection_id

---

## Critical Information

### ⚠️ PRICES ARE IN CENTS

All prices in the database are stored as **integers representing cents**:

```
$99.99 → 9999 (cents)
$15.00 → 1500 (cents)
$0.99 → 99 (cents)

// Frontend display
const displayPrice = priceInCents / 100; // = $99.99
```

This avoids floating-point precision issues.

### 🔐 Admin Password Hashing

Admin passwords use SHA-256:

```javascript
// Frontend hashing (from your code)
const salt = "admin_salt_2024";
const passwordHash = SHA256(salt + password);

// Store in database: passwordHash
// Later: compare SHA256(salt + userInput) with stored passwordHash
```

### 📦 Product Images & Tags

Images and tags are stored as **PostgreSQL arrays**:

```sql
-- Images (first one is thumbnail)
images = ['https://cdn.example.com/watch1.jpg', 'https://cdn.example.com/watch2.jpg']

-- Tags (for filtering)
tags = ['sale', 'bestseller', 'new']
```

### 📍 Addresses (JSONB Format)

Customer and shipping addresses are stored as **JSON objects**:

```json
{
  "line1": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "United States",
  "phone": "+1-555-0123",
  "email": "customer@example.com"
}
```

### 📋 Order Status Flow

Orders progress through these statuses:
- `pending` → Customer placed order, awaiting payment
- `paid` → Payment received
- `shipped` → Order dispatched
- `delivered` → Received by customer
- `cancelled` → Customer cancelled
- `refunded` → Money returned to customer

---

## Setting Up Your First Admin

### 1. Hash Your Admin Password

```javascript
// In browser console or Node.js:
import { SHA256 } from "crypto-js"; // or use crypto library

const salt = "admin_salt_2024";
const adminPassword = "your_secure_password";
const passwordHash = SHA256(salt + adminPassword).toString();
console.log(passwordHash); // Copy this
```

### 2. Insert Admin User in Supabase

Go to **SQL Editor** and run:

```sql
INSERT INTO admin_users (username, password_hash, email, is_active)
VALUES (
  'admin',
  'YOUR_SHA256_HASH_HERE', -- Replace with hash from step 1
  'admin@example.com',
  true
);
```

### 3. Test Admin Login

Visit `/admin` → Enter:
- Username: `admin`
- Password: `your_secure_password`

---

## Adding Your First Product

```sql
INSERT INTO ecom_products (
  name, 
  handle, 
  vendor, 
  product_type, 
  description,
  price,
  compare_at_price,
  inventory_qty,
  images,
  tags,
  status,
  new_arrival
)
VALUES (
  'Classic Leather Watch',
  'classic-leather-watch',
  'Fossil',
  'Analog',
  'Timeless classic with genuine leather strap',
  9999, -- $99.99 in cents
  NULL,
  50,
  ARRAY['https://images.example.com/watch1.jpg'],
  ARRAY['bestseller'],
  'active',
  true
);
```

---

## Configuring Store Settings

All global settings (WhatsApp, email, shipping fee) are in the **single row** of `shop_settings`:

```sql
UPDATE shop_settings 
SET 
  shop_name = 'Original Watches Store',
  whatsapp = '+1-555-0123',
  email = 'support@watches.com',
  telegram_url = 'https://t.me/yourgroup',
  shipping_fee = 999, -- $9.99 in cents
  promo_text = '🎉 Summer Sale: 15% Off All Items!'
WHERE id = 1;
```

---

## Checking Your Schema

### View All Tables

```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
```

### View Table Structure

```sql
-- Example: View products table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ecom_products'
ORDER BY ordinal_position;
```

### Count Records in Each Table

```sql
SELECT 
  'ecom_products' as table_name, COUNT(*) as record_count FROM ecom_products
UNION ALL
SELECT 'ecom_orders', COUNT(*) FROM ecom_orders
UNION ALL
SELECT 'ecom_customers', COUNT(*) FROM ecom_customers
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages;
```

---

## Testing the Schema

### Test 1: Create a Product

```sql
INSERT INTO ecom_products (name, handle, vendor, price)
VALUES ('Test Watch', 'test-watch', 'Test Brand', 5000);
```

### Test 2: Create a Customer

```sql
INSERT INTO ecom_customers (email, name, phone)
VALUES ('customer@test.com', 'John Doe', '+1-555-0123');
```

### Test 3: Create an Order

```sql
INSERT INTO ecom_orders (customer_id, subtotal, shipping, total, shipping_address, status)
SELECT 
  id,
  5000, -- $50 subtotal
  999,  -- $9.99 shipping
  5999, -- Total
  jsonb_build_object(
    'name', 'John Doe',
    'line1', '123 Main St',
    'city', 'New York',
    'state', 'NY',
    'postal_code', '10001',
    'country', 'US',
    'phone', '+1-555-0123',
    'email', 'customer@test.com'
  ),
  'pending'
FROM ecom_customers WHERE email = 'customer@test.com';
```

### Test 4: Add Order Items

```sql
INSERT INTO ecom_order_items (order_id, product_id, product_name, quantity, unit_price, total)
SELECT 
  ecom_orders.id,
  ecom_products.id,
  ecom_products.name,
  1,
  5000,
  5000
FROM ecom_orders, ecom_products
WHERE ecom_orders.status = 'pending'
AND ecom_products.handle = 'test-watch'
LIMIT 1;
```

### Test 5: Verify Admin Login Function

```sql
-- Insert test admin
INSERT INTO admin_users (username, password_hash, is_active)
VALUES ('testadmin', 'test_hash_12345', true);

-- Test the function
SELECT * FROM verify_admin_login('testadmin', 'test_hash_12345');
-- Should return: success=true, user_id=<uuid>, message='Login successful'
```

---

## Migrating Existing Data (Optional)

If you have an existing database, you can export and import data:

### Export from Old Database

```bash
# Export as CSV
psql $OLD_DATABASE_URL -c "COPY ecom_products TO STDOUT WITH CSV HEADER" > products.csv
```

### Import to New Database

```bash
# Import from CSV
psql "$SUPABASE_DATABASE_URL" -c "COPY ecom_products FROM STDIN WITH CSV HEADER" < products.csv
```

---

## Troubleshooting

### Error: "relation already exists"

If tables already exist, the `CREATE TABLE IF NOT EXISTS` prevents errors. To rebuild:

```sql
-- Drop all tables (caution!)
DROP TABLE IF EXISTS ecom_order_items CASCADE;
DROP TABLE IF EXISTS ecom_orders CASCADE;
DROP TABLE IF EXISTS ecom_product_collections CASCADE;
DROP TABLE IF EXISTS ecom_products CASCADE;
DROP TABLE IF EXISTS ecom_collections CASCADE;
DROP TABLE IF EXISTS ecom_customers CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS shop_settings CASCADE;

-- Then re-run the schema file
```

### Error: "unknown type 'uuid'"

Make sure the UUID extension is enabled. Run first:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Slow Queries

Check that indexes were created:

```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

If missing, run the index creation part of the schema file again.

---

## Next Steps

1. ✅ **Run this schema** in your Supabase SQL editor
2. ✅ **Create your first admin user** (follow "Setting Up Your First Admin" section above)
3. ✅ **Add sample products** via the admin panel or SQL
4. ✅ **Configure store settings** (WhatsApp, email, shipping fee)
5. ✅ **Test the full workflow**: Browse → Add to Cart → Checkout → View Order

---

## Support & Questions

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Verify the schema by counting records: `SELECT COUNT(*) FROM ecom_products;`
3. Check Supabase logs for specific errors
4. Ensure all SQL syntax is correct (no extra semicolons)

---

**File**: `003_complete_database_schema.sql`
**Status**: ✅ Ready to use
**Last Updated**: 2026-07-11
