# Admin Authentication Setup Guide

This guide walks through setting up the new Supabase-based admin authentication system.

## Steps to Set Up

### 1. Create the Admin Users Table in Supabase

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy the contents of scripts/002_create_admin_users_table.sql
# and paste it into your Supabase SQL editor at:
# https://app.supabase.com -> Your Project -> SQL Editor -> New Query
```

Or run via CLI:
```bash
psql "$DATABASE_URL" < scripts/002_create_admin_users_table.sql
```

### 2. Add an Admin User

You can add admin users in two ways:

#### Option A: Using the Node.js Script (Recommended)

```bash
# Install dependencies (if needed)
npm install

# Run the script to add admin user
node scripts/add-admin.js

# Or specify custom credentials:
node scripts/add-admin.js admin admin123 admin@example.com
node scripts/add-admin.js [username] [password] [email]
```

#### Option B: Direct Database Insert

If you prefer to add manually via Supabase SQL editor:

```sql
-- SHA256 hash of "admin123" + salt "admin_salt_2024"
-- You can generate this hash using the provided script

INSERT INTO admin_users (username, password_hash, email, is_active)
VALUES ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin@example.com', true);
```

### 3. Test the Login

1. Go to `https://yoursite.com/admin`
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Sign in"

## Security Notes

- ✓ Passwords are hashed using SHA256 before storage
- ✓ All admin communications should use HTTPS
- ✓ The demo hint "Demo password: admin123" has been removed
- ⚠️ For production, consider upgrading to bcrypt or using Supabase Auth
- ⚠️ Keep your Supabase credentials secure

## Adding More Admin Users

To add additional admin users:

```bash
node scripts/add-admin.js [new_username] [new_password] [optional_email]
```

Or via SQL:
1. Generate password hash using the script
2. Insert directly into `admin_users` table

## Troubleshooting

**"Invalid username or password"**
- Ensure the `admin_users` table exists
- Verify the username and password match exactly (case-sensitive)
- Check that `is_active` is set to `true`

**Script errors**
- Ensure Supabase credentials in `scripts/add-admin.js` match your project
- Run `npm install` to ensure dependencies are installed

**CORS or connection issues**
- Verify your Supabase URL and API key are correct
- Check that your project allows the API key to access the `admin_users` table
