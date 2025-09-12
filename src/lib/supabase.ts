// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ATENÇÃO: use SEMPRE o padrão literal "import.meta.env.VITE_*"
// para que o Vite injete na build de produção.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Flag simples para a UI/Contexto
export const isSupabaseConfigured: boolean = !!(url && anon);

// Client não-nulo. Se faltar env, lança erro claro ao usar.
function createFailingClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(
        'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente.'
      );
    },
  });
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true } })
  : createFailingClient();

// --------- Helpers ---------
const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined) ?? '';

/** Monta URL absoluta para redirects de auth */
export function getRedirectUrl(path: string = '/auth/callback'): string {
  const base =
    siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${clean}` : clean;
}

/** Mensagens amigáveis de erro do Supabase */
export function getSupabaseErrorMessage(err: unknown): string {
  const e = (err ?? {}) as any;
  const code = e?.code ?? e?.error?.code ?? e?.name;
  const status = e?.status ?? e?.error?.status;
  const msg = (e?.message ?? e?.error?.message ?? '').toLowerCase();

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
  return e?.message || 'Algo deu errado. Tente novamente.';
}
