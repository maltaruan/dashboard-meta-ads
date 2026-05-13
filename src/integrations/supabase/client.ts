// Cliente Supabase canônico do dashboard.
// Aponta para o schema 'dashboard' por default — todas as queries
// supabase.from('accounts') resolvem para dashboard.accounts.
//
// Não há um segundo client neste projeto. Importações em qualquer
// arquivo devem usar exclusivamente '@/integrations/supabase/client'.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    // schema 'public' (default) — schema 'dashboard' não existe mais após reset do backend
  }
);
