import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://vxxqfscppyianbqkkllr.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJiZWM2OTM4LWJiYTQtNGMyNS04ZmQwLThhOWUxOTE5NTNjZCJ9.eyJwcm9qZWN0SWQiOiJ2eHhxZnNjcHB5aWFuYnFra2xsciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5MTExNzc0LCJleHAiOjIwOTQ0NzE3NzQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.3xJYSKJ9pLajFZ-P6RUnLedCwoev5eYQKtXcOi73638';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };