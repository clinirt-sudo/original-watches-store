const { createClient } = await import(new URL('../node_modules/@supabase/supabase-js/dist/module/index.js', import.meta.url).href);

const supabaseUrl = 'https://vxxqfscppyianbqkkllr.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJiZWM2OTM4LWJiYTQtNGMyNS04ZmQwLThhOWUxOTE5NTNjZCJ9.eyJwcm9qZWN0SWQiOiJ2eHhxZnNjcHB5cHB5YW5iam1yZXcib3JlbG8iOiJhbm9uIiwiaWF0IjoxNzc5MTExNzc0LCJleHAiOjIwOTQ0NzE3NzQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.3xJYSKJ9pLajFZ-P6RUnLedCwoev5eYQKtXcOi73638';
const supabase = createClient(supabaseUrl, supabaseKey);

const brandHandle = 'patek-philippe';
const vendorName = brandHandle.replace(/-/g, ' ');
console.log('vendorName', vendorName);

const q1 = await supabase.from('ecom_collections').select('*').eq('handle', brandHandle).limit(1);
console.log('collection query error', q1.error);
console.log('collection query data', q1.data);

const q2 = await supabase.from('ecom_products').select('id,name,vendor,handle').eq('status', 'active').ilike('vendor', `%${vendorName}%`).limit(10);
console.log('vendor query error', q2.error);
console.log('vendor query len', q2.data?.length);
console.log('vendor query data', q2.data?.slice(0, 5));
