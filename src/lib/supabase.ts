// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url =
  (import.meta as any)?.env?.VITE_SUPABASE_URL ?? process?.env?.NEXT_PUBLIC_SUPABASE_URL;
const anon =
  (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ?? process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Exporte este flag para os componentes que precisam saber se há Supabase
export const isSupabaseConfigured: boolean = Boolean(url && anon);

// Client que lança um erro amigável se alguém tentar usar Supabase sem configurar envs
function createFailingClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(
        'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_*) no ambiente.'
      );
    },
  });
}

// Exporte um client **não-nulo** (evita "possibly null" no TS).
// Se estiver configurado, cria de verdade; se não, cria um proxy que falha ao uso.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url as string, anon as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : createFailingClient();
