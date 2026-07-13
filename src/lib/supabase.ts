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
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: customFetch,
  },
});

export { supabase };