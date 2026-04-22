import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key) {
    console.warn('Supabase not available');
    return null;
  }

  try {
    return createBrowserClient(url, key);
  } catch (err) {
    console.warn('Supabase not available', err);
    return null;
  }
}
