// Cliente Supabase canônico do dashboard.
// Aponta hardcoded para o projeto oficial xxzupolczwyrtnunzjhf
// e usa o schema 'dashboard' por default.
//
// URL/anon key são hardcoded de propósito: o Lovable Cloud injeta
// variáveis de ambiente apontando para outro projeto, e isso ignora
// o .env do repo. Hardcodando aqui, o preview do Lovable e o build
// local apontam para o mesmo Supabase (o nosso). Anon key é pública
// por design — não tem secret aqui.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://xxzupolczwyrtnunzjhf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4enVwb2xjend5cnRudW56amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MDA5OTgsImV4cCI6MjA2OTI3Njk5OH0.YURX65fJg4-FV35RInZnsh18zxpW4Lx3X9IN_McpkuU';

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
    db: {
      schema: 'dashboard',
    },
  }
);
