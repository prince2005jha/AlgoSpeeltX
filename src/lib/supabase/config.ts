import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 0;

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  console.warn('Current values:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
    key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'missing'
  });
}

// Create Supabase client (will work even with empty strings, but will fail on actual requests)
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

// Export a helper to check if Supabase is configured
export const isSupabaseReady = isSupabaseConfigured;

// Log configuration status in development
if (import.meta.env.DEV) {
  console.log('Supabase Configuration:', {
    isReady: isSupabaseReady,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0
  });
}

