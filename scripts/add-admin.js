#!/usr/bin/env node

/**
 * Script to add an admin user to the Supabase database
 * Run with: node scripts/add-admin.js
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials (same as in src/lib/supabase.ts)
const supabaseUrl = 'https://vxxqfscppyianbqkkllr.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJiZWM2OTM4LWJiYTQtNGMyNS04ZmQwLThhOWUxOTE5NTNjZCJ9.eyJwcm9qZWN0SWQiOiJ2eHhxZnNjcHB5aWFuYnFra2xsciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5MTExNzc0LCJleHAiOjIwOTQ0NzE3NzQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.3xJYSKJ9pLajFZ-P6RUnLedCwoev5eYQKtXcOi73638';

const supabase = createClient(supabaseUrl, supabaseKey);

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
