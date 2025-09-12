// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lê as envs tanto em Vite (VITE_*) quanto em Next (NEXT_PUBLIC_*)
const url =
  (import.meta as any)?.env?.VITE_SUPABASE_URL ??
  (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);

const anon =
  (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY ??
  (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined);

// Exporte um flag simples (boolean) para saber se o Supabase está configurado
export const isSupabaseConfigured: boolean = Boolean(url && anon);

// Se alguém tentar usar o client sem envs, mostramos erro claro
function createFailingClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(
        'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_*) no ambiente.'
      );
    },
  });
}

// Client **não-nulo** (evita "possibly null" do TypeScript)
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url as string, anon as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : createFailingClient();

// --------- Helper de redirect (usado pelo AuthContext) ----------
const envSiteUrl =
  (import.meta as any)?.env?.VITE_SITE_URL ??
  (typeof process !== 'undefined' ? (process as any)?.env?.NEXT_PUBLIC_SITE_URL : undefined) ??
  '';

/**
 * Monta a URL absoluta de redirect para fluxos de Auth.
 * - Usa VITE_SITE_URL / NEXT_PUBLIC_SITE_URL se existirem (produção/preview).
 * - Senão, em runtime usa window.location.origin (dev/local).
 * - Em build (sem window), devolve apenas o path.
 */
export function getRedirectUrl(path: string = '/auth/callback'): string {
  const base =
    envSiteUrl ||
    (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${clean}` : clean;
}

// --- helper: normaliza mensagens de erro do Supabase para UX amigável ---
export function getSupabaseErrorMessage(err: unknown): string {
  const e = (err ?? {}) as any;
  const code = e?.code ?? e?.error?.code ?? e?.name;
  const status = e?.status ?? e?.error?.status;
  const msg = (e?.message ?? e?.error?.message ?? '').toLowerCase();

  // Casos comuns de Auth
  if (code === 'invalid_credentials' || status === 400 || msg.includes('invalid login credentials')) {
    return 'E-mail ou senha inválidos.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.';
  }
  if (code === 'otp_expired' || msg.includes('token has expired') || msg.includes('link expired')) {
    return 'Link expirado. Solicite um novo e-mail.';
  }
  if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }
  if (status === 401 || msg.includes('not authorized') || msg.includes('jwt')) {
    return 'Sessão expirada ou não autorizada. Faça login novamente.';
  }
  if (status === 403) {
    return 'Ação não permitida para sua conta.';
  }

  // Fallback genérico
  return e?.message || 'Algo deu errado. Tente novamente.';
}
