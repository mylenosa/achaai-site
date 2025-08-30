// Single Responsibility: Cliente Supabase configurado
// Dependency Inversion: Usa variáveis de ambiente
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente existem
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis de ambiente
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('supabase.co') || url.includes('localhost');
  } catch {
    return false;
  }
};

const isValidKey = (key: string): boolean => {
  return key && key.length > 20; // Chaves Supabase são longas
};

// Só criar o cliente se as variáveis existirem e forem válidas
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce' // Mais seguro para SPAs
        }
      })
    : null;

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// Helper para mostrar mensagem de erro específica
export const getSupabaseErrorMessage = (): string => {
  if (!supabaseUrl) {
    return 'VITE_SUPABASE_URL não configurada no arquivo .env';
  }
  if (!supabaseAnonKey) {
    return 'VITE_SUPABASE_ANON_KEY não configurada no arquivo .env';
  }
  if (!isValidUrl(supabaseUrl)) {
    return 'VITE_SUPABASE_URL inválida - deve ser uma URL do Supabase';
  }
  if (!isValidKey(supabaseAnonKey)) {
    return 'VITE_SUPABASE_ANON_KEY inválida - verifique a chave no painel do Supabase';
  }
  return 'Configuração do Supabase incompleta';
};

// Helper para obter URL de redirecionamento baseada no ambiente
export const getRedirectUrl = (path: string = '/dashboard'): string => {
  // Em produção, usar o domínio configurado
  if (import.meta.env.PROD) {
    return `https://achai.arikeme.com${path}`;
  }
  
  // Em desenvolvimento, usar localhost
  return `${window.location.origin}${path}`;
};

// Log para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Config:', {
    url: supabaseUrl ? '✅ Configurada' : '❌ Não configurada',
    key: supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada',
    client: supabase ? '✅ Inicializado' : '❌ Não inicializado'
  });
}