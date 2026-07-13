#!/usr/bin/env node

/**
 * Script to add an admin user to the Supabase database
 * Run with: node scripts/add-admin.js
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Supabase credentials (from .env.local)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: ws,
  },
});

// Simple hash function using SHA256 (better security with bcrypt, but this is portable)
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + 'admin_salt_2024')
    .digest('hex');
}

async function addAdmin(username, password, email) {
  try {
    console.log(`Adding admin user: ${username}...`);

    const passwordHash = hashPassword(password);

    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        {
          username,
          password_hash: passwordHash,
          email: email || null,
          is_active: true,
        },
      ])
      .select();

    if (error) {
      console.error('Error adding admin user:', error);
      return false;
    }

    console.log('✓ Admin user added successfully!');
    console.log(`  Username: ${username}`);
    console.log(`  Email: ${email || 'Not provided'}`);
    console.log(`  Status: Active`);
    return true;
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return false;
  }
}

// Main execution
const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';
const email = process.argv[4] || null;

console.log('🔧 Original Watches Store - Admin User Setup\n');
console.log(`Username: ${username}`);
console.log(`Password: ${password}`);
console.log(`Email: ${email || 'Not provided'}\n`);

addAdmin(username, password, email).then((success) => {
  process.exit(success ? 0 : 1);
});