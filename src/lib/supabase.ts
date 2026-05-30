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

// Initialize database client
const supabaseUrl = 'https://vxxqfscppyianbqkkllr.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjJiZWM2OTM4LWJiYTQtNGMyNS04ZmQwLThhOWUxOTE5NTNjZCJ9.eyJwcm9qZWN0SWQiOiJ2eHhxZnNjcHB5aWFuYnFra2xsciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc5MTExNzc0LCJleHAiOjIwOTQ0NzE3NzQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.3xJYSKJ9pLajFZ-P6RUnLedCwoev5eYQKtXcOi73638';
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch,
  },
});

export { supabase };