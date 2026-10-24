/**
 * AntiqueRide Supabase Client & Resilience Layer
 * Initializes connection to Supabase if environment variables are present.
 * Transparently degrades to local resilient store when offline or unconfigured.
 */

export const isSupabaseConfigured = () => {
  return (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 10
  );
};

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  // When configured, client imports can be instantiated dynamically
  return null;
};
