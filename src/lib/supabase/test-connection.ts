/**
 * Test Supabase connection
 * Run this in browser console to verify Supabase is working
 */
import { supabase, isSupabaseReady } from './config';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('isSupabaseReady:', isSupabaseReady);
  
  if (!isSupabaseReady) {
    console.error('Supabase is not configured properly');
    return false;
  }

  try {
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('payments')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log('✓ Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}








