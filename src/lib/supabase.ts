// Single Responsibility: Cliente Supabase configurado
// Dependency Inversion: Usa variáveis de ambiente
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente existem
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para debug (remover em produção)
console.log('Supabase URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
console.log('Supabase Key:', supabaseAnonKey ? 'Configurada' : 'Não configurada');

// Só criar o cliente se as variáveis existirem
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// Helper para mostrar mensagem de erro amigável
export const getSupabaseErrorMessage = (): string => {
  if (!supabaseUrl) {
    return 'VITE_SUPABASE_URL não configurada';
  }
  if (!supabaseAnonKey) {
    return 'VITE_SUPABASE_ANON_KEY não configurada';
  }
  return 'Configuração do Supabase incompleta';
};
