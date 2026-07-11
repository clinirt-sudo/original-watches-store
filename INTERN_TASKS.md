# Intern Tasks - Original Watches Store Project

## Overview

Welcome to the Original Watches Store project! This is your first assignment as a developer intern. Your task is to **migrate the entire project from the old Supabase account to a new Supabase account** and ensure all functionality works perfectly.

**Timeline: 2 Days**

---

## 🎯 Assignment Objective

You will be responsible for:
1. ✅ Setting up a new Supabase project and configuring the database
2. ✅ Migrating the project codebase to use the new Supabase credentials
3. ✅ Testing all CRUD operations (Create, Read, Update, Delete)
4. ✅ Ensuring the entire application works without any connection issues
5. ✅ Submitting your work via a Git branch for code review

This is a **critical task** as it demonstrates your ability to work with databases, version control, and full-stack development.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Git installed and configured
- ✅ Node.js and npm installed
- ✅ Access to a **new Supabase account** (should have been provisioned by your team lead)
- ✅ Developer access to the new Supabase project
- ✅ A code editor (VS Code recommended)
- ✅ This repository cloned locally

---

## 🚀 Step-by-Step Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/clinirt-sudo/original-watches-store
cd original-watches-store
```

### Step 2: Create Your Feature Branch

Create a new branch with your name for all changes:

```bash
git checkout -b intern-{your-name}
```

**Example:**
```bash
git checkout -b intern-john-smith
```

This branch will contain all your work for code review.

---

### Step 3: Set Up the New Supabase Project

#### 3.1 Access Your New Supabase Account

1. Navigate to: https://app.supabase.com/
2. you have already been added as a developer on the new supabase account so you have access
3. Note down:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **Anon Key** (the public key)
   - **Service Role Key** (the private key)

#### 3.2 Deploy the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Open the file: `scripts/003_complete_database_schema.sql`
4. Copy **ALL** the contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. ✅ Wait for the query to complete successfully
8. Verify in **Table Editor** that all 10 tables are created:
   - ecom_products
   - ecom_collections
   - ecom_product_collections
   - ecom_customers
   - ecom_orders
   - ecom_order_items
   - admin_users
   - chat_messages
   - shop_settings
   - contact_messages

#### 3.3 Set Up Your First Admin User

See `scripts/COMPLETE_SCHEMA_README.md` for detailed instructions on:
- How to generate an admin password hash
- How to insert your first admin user
- Testing admin login

**Quick version:**
1. Generate SHA-256 hash: `SHA256("admin_salt_2024" + your_password)`
2. Run this SQL in Supabase:
```sql
INSERT INTO admin_users (username, password_hash, email, is_active)
VALUES (
  'admin',
  'YOUR_SHA256_HASH_HERE',
  'admin@example.com',
  true
);
```

---

### Step 4: Update Project Credentials

#### 4.1 Create Environment Variables File

In the project root, create a `.env.local` file:

```bash
touch .env.local
```

Add the following (replace with YOUR actual Supabase credentials):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Do NOT commit this file to Git. It should be in `.gitignore`.

#### 4.2 Update the Code

Edit `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const normalizePostgrestUrl = (input: string) => {
  try {
    const url = new URL(input);
    if (!url.search || !url.pathname.includes('/rest/v1/')) return input;
    const normalized = Array.from(url.searchParams.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    url.search = normalized;
    return url.toString();
  } catch {
    return input;
  }
};

const customFetch: typeof fetch = async (input, init) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
  const normalizedUrl = normalizePostgrestUrl(requestUrl);
  return fetch(normalizedUrl, init);
};

// ============================================================================
// UPDATE THESE VALUES WITH YOUR NEW SUPABASE CREDENTIALS
// ============================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_NEW_SUPABASE_URL_HERE';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_NEW_ANON_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch,
  },
});

export { supabase };
```

**Alternative (Direct Update - NOT Recommended):**
If you don't want to use environment variables, directly replace the old values:

```typescript
const supabaseUrl = 'https://your-new-project.supabase.co';
const supabaseKey = 'your-new-anon-key';
```

---

### Step 5: Install Dependencies & Start Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application should open at `http://localhost:5173`

---

### Step 6: Test All Functionality

#### ✅ Test Checklist

Complete the following tests and verify each works:

##### A. **Product Browsing**
- [ ] Homepage loads without errors
- [ ] "Shop" page displays products
- [ ] Can search for products
- [ ] Can filter by brand/category
- [ ] Product detail page loads correctly
- [ ] Images display properly

##### B. **Cart Operations**
- [ ] Can add products to cart
- [ ] Cart persists in localStorage
- [ ] Can update product quantities
- [ ] Can remove items from cart
- [ ] Cart total calculates correctly

##### C. **Checkout & Orders**
- [ ] Checkout form displays
- [ ] Can enter shipping address
- [ ] Can select payment method
- [ ] Order is created in database (check `ecom_orders` table)
- [ ] Order items are saved (check `ecom_order_items` table)
- [ ] Customer is created (check `ecom_customers` table)
- [ ] Order confirmation page shows

##### D. **Admin Dashboard**
- [ ] Navigate to `/admin`
- [ ] Login with admin credentials
- [ ] Dashboard loads with stats
- [ ] Can view products list
- [ ] Can create new product
- [ ] Can edit product (mark as new_arrival, etc.)
- [ ] Can delete product
- [ ] Can view orders
- [ ] Can update order status
- [ ] Can view chat messages

##### E. **Live Chat**
- [ ] Chat widget appears on product page
- [ ] Can send messages as customer
- [ ] Messages persist in database
- [ ] Admin can receive messages

##### F. **Database Operations**
- [ ] Check `ecom_products` table has data
- [ ] Check `ecom_orders` table has orders
- [ ] Check `ecom_order_items` linked correctly
- [ ] Check `admin_users` table has admin
- [ ] Check indexes are created (performance)

**Testing Commands:**
```sql
-- Check data
SELECT COUNT(*) FROM ecom_products;
SELECT COUNT(*) FROM ecom_orders;
SELECT COUNT(*) FROM ecom_customers;
SELECT COUNT(*) FROM admin_users;

-- Check recent order
SELECT * FROM ecom_orders ORDER BY created_at DESC LIMIT 1;
```

---

### Step 7: Commit Your Changes

```bash
# Stage all changes
git add .

# Commit with a clear message
git commit -m "feat: migrate project to new supabase account

- Updated supabase credentials in src/lib/supabase.ts
- Added environment variables for secure credential storage
- Deployed complete database schema
- Tested all CRUD operations
- Verified admin login and dashboard functionality"

# Push to your branch
git push origin intern-{your-name}
```

---

### Step 8: Create Pull Request (Code Review)

1. Go to GitHub/GitLab
2. You should see a prompt to create a Pull Request for your branch
3. Click **"Create Pull Request"**
4. Add a clear description:

```markdown
# Supabase Migration - Complete

## Summary
Successfully migrated the Original Watches Store project from the old Supabase account to the new development account.

## Changes
- ✅ Updated Supabase credentials in src/lib/supabase.ts
- ✅ Deployed complete database schema (10 tables, 4 functions)
- ✅ Created admin user for testing
- ✅ Tested all CRUD operations

## Testing
- ✅ Product browsing and search
- ✅ Cart operations
- ✅ Checkout and order creation
- ✅ Admin dashboard (products, orders, chat)
- ✅ Live chat functionality
- ✅ Database connectivity verified

## Deployment Notes
- Environment variables configured in .env.local
- All database migrations successful
- No connection errors observed
```

5. Request code review from your team lead

---

## 📁 Important Files Reference

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase connection configuration (UPDATE THIS) |
| `scripts/003_complete_database_schema.sql` | Complete database schema (RUN IN SUPABASE) |
| `scripts/COMPLETE_SCHEMA_README.md` | Detailed setup documentation |
| `.env.local` | Environment variables (CREATE THIS - NOT COMMITTED) |
| `package.json` | Project dependencies |
| `src/pages/Admin.tsx` | Admin dashboard |
| `src/components/CartDrawer.tsx` | Cart functionality |

---

## 🔐 Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Never push API keys to Git** - Use environment variables
3. **Keep your Supabase credentials private**
4. **Use the Anon Key for frontend** (not the Service Role Key)
5. **Verify `.gitignore` includes `.env.local`**

---

## 🆘 Troubleshooting

### Issue: "Database connection failed"
- ✅ Verify Supabase URL and Key are correct
- ✅ Check internet connection
- ✅ Ensure `.env.local` is in project root
- ✅ Restart dev server: `npm run dev`

### Issue: "Table does not exist"
- ✅ Re-run the database schema in Supabase SQL Editor
- ✅ Verify all tables appear in Table Editor
- ✅ Check for SQL errors in the editor

### Issue: "Admin login fails"
- ✅ Verify admin_users table has data: `SELECT * FROM admin_users;`
- ✅ Confirm password hash is correct
- ✅ Check username matches exactly

### Issue: "Products not showing"
- ✅ Add test product via SQL or Admin panel
- ✅ Check `ecom_products` table has data
- ✅ Verify product status is 'active'

### Issue: "Orders not saving"
- ✅ Check browser console for errors (F12)
- ✅ Verify customer is created first
- ✅ Check order_items are linked to order_id

---

## 📞 Support & Questions

If you get stuck:

1. **Check the documentation:** `scripts/COMPLETE_SCHEMA_README.md`
2. **Review console errors:** Open browser DevTools (F12) → Console
3. **Check Supabase logs:** Supabase Dashboard → Logs
4. **Ask your team lead:** Slack/Email

---

## ✅ Deliverables Checklist

By the end of 2 days, ensure:

- [ ] New Supabase project is created and configured
- [ ] Database schema is deployed (all 10 tables)
- [ ] Admin user is created
- [ ] `src/lib/supabase.ts` updated with new credentials
- [ ] `.env.local` file created (not committed)
- [ ] Development server runs without errors
- [ ] All CRUD operations tested and working
- [ ] Branch `intern-{your-name}` created with all changes
- [ ] Pull Request submitted for code review
- [ ] Project fully disconnected from old Supabase account

---

## 🎓 Learning Outcomes

After completing this task, you will have:

✅ Experience setting up a Supabase project  
✅ Understanding of database schema deployment  
✅ Skills in environment variable management  
✅ Knowledge of Git branching and pull requests  
✅ Experience testing full-stack applications  
✅ Confidence with CRUD operations  
✅ Understanding of secure credential handling  

---

## 📊 Success Metrics

Your work will be evaluated on:

| Criteria | Points |
|----------|--------|
| Database schema deployed correctly | 20% |
| Supabase credentials updated properly | 20% |
| All CRUD operations tested and working | 30% |
| Admin dashboard functionality verified | 15% |
| Clean git commit history and PR | 10% |
| Code quality and documentation | 5% |

**Target: 90%+ for excellent performance**

---

## ⏰ Timeline

| Day | Task | Status |
|-----|------|--------|
| Day 1 | Setup new Supabase account, deploy schema, update credentials | [ ] |
| Day 1 | Verify all CRUD operations, admin login | [ ] |
| Day 2 | Complete testing checklist, commit changes | [ ] |
| Day 2 | Submit PR for code review | [ ] |

---

## Final Notes

- 🎯 This is a real-world scenario you'll encounter as a developer
- 💡 Pay attention to details - small mistakes can break the app
- 📝 Document any issues you encounter for future reference
- 🤝 Don't hesitate to ask questions - learning is the goal
- ⭐ Successful completion demonstrates readiness for more complex tasks

---

**Good luck! We're excited to see your work! 🚀**

---

*Generated: 2026-07-11*  
*Project: Original Watches Store*  
*Intern Assignment: Supabase Migration*
