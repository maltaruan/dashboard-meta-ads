import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

export function getAdminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'dashboard' },
  });
}

export function getUserClient(authHeader: string) {
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env');
  }

  return createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'dashboard' },
  });
}
