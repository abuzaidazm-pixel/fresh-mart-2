import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  latencyMs?: number;
  tablesFound?: string[];
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      error: 'Supabase credentials are not set in .env.local',
    };
  }

  const startTime = Date.now();
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        connected: false,
        error: error.message,
        latencyMs,
      };
    }

    return {
      connected: true,
      latencyMs,
      tablesFound: ['products', 'categories', 'orders', 'inventory_adjustments'],
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Unknown network error',
      latencyMs: Date.now() - startTime,
    };
  }
}
