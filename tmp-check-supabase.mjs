import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://vxxqfscppyianbqkkllr.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJ2eHhxZnNjcHB5aWFuYnFra2xsciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5MTExNzc0LCJleHAiOjIwOTQ0NzE3NzQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.3xJYSKJ9pLajFZ-P6RUnLedCwoev5eYQKtXcOi73638';
const supabase = createClient(supabaseUrl, supabaseKey);
const { data, error } = await supabase.from('ecom_products').select('id, new_arrival').limit(1);
console.log(JSON.stringify({ error, data }, null, 2));
