// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getRedirectUrl } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  isAuth: boolean;
  hasLoja: boolean;
  dev: boolean;
  setIsAuth: (value: boolean) => void;
  setHasLoja: (value: boolean) => void;
  setDev: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configured = isSupabaseConfigured;

  const [user, setUser]       = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [isAuth, setIsAuth]   = React.useState(false);
  const [hasLoja, setHasLoja] = React.useState(false);
  const [dev, setDev]         = React.useState(false);

  // Controle de chamadas duplicadas
  const lastCheckedUserId = React.useRef<string | null>(null);
  const refreshInFlight = React.useRef<boolean>(false);

  // habilitar modo DEV via ?dev=1
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === '1') setDev(true);
  }, []);

  // helper: checa se o usuário tem loja
  async function refreshHasLoja(u?: User | null) {
    // Evitar chamadas concorrentes
    if (refreshInFlight.current) {
      console.log('refreshHasLoja: Já em execução, ignorando chamada duplicada');
      return;
    }

    try {
      refreshInFlight.current = true;
      const uid = (u ?? user)?.id;
      
      // Só verifica se o user ID mudou
      if (uid === lastCheckedUserId.current) {
        console.log('refreshHasLoja: User ID não mudou, ignorando:', uid);
        return;
      }

      console.log('refreshHasLoja: Verificando loja para user ID:', uid);
      if (!uid) { 
        console.log('refreshHasLoja: Sem user ID, setando hasLoja=false');
        setHasLoja(false);
        lastCheckedUserId.current = null;
        return; 
      }

      lastCheckedUserId.current = uid;

      console.log('refreshHasLoja: Consultando tabela lojas...');
      const { data, error } = await supabase
        .from('lojas')
        .select('id')
        .eq('owner_user_id', uid)
        .maybeSingle();

      if (error) {
        console.error('refreshHasLoja: Erro na consulta:', error);
        throw error;
      }
      
      const hasLoja = !!data?.id;
      console.log('refreshHasLoja: Resultado:', hasLoja, 'data:', data);
      setHasLoja(hasLoja);
    } catch (e) {
      console.error('refreshHasLoja: Erro ao checar loja:', e);
      setHasLoja(false);
    } finally {
      refreshInFlight.current = false;
    }
  }

  // bootstrap + eventos de auth
  useEffect(() => {
    if (!configured) { 
      console.log('AuthContext: Supabase não configurado, setando loading=false');
      setLoading(false); 
      return; 
    }

    let mounted = true;
    console.log('AuthContext: Iniciando verificação de sessão...');

    (async () => {
      try {
        console.log('AuthContext: Chamando supabase.auth.getSession()...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) {
          console.log('AuthContext: Componente desmontado, cancelando...');
          return;
        }
        
        console.log('AuthContext: Sessão obtida:', !!session?.user);
        const u = session?.user ?? null;
        setUser(u);
        setIsAuth(!!u);
        
        // loading=false assim que getSession() resolver
        console.log('AuthContext: Setando loading=false');
        setLoading(false);
        
        // refreshHasLoja roda em paralelo (não bloqueia loading)
        console.log('AuthContext: Verificando loja em paralelo...');
        refreshHasLoja(u).then(() => {
          console.log('AuthContext: Verificação de loja concluída');
        }).catch((error) => {
          console.error('AuthContext: Erro ao verificar loja:', error);
        });
      } catch (error) {
        console.error('AuthContext: Erro ao verificar sessão:', error);
        if (mounted) {
          setUser(null);
          setIsAuth(false);
          setHasLoja(false);
          setLoading(false);
        }
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const u = session?.user ?? null;
      const prevUserId = user?.id;
      setUser(u);
      setIsAuth(event === 'SIGNED_IN' && !!u);
      
      // refreshHasLoja só roda quando user?.id mudar
      if (u?.id !== prevUserId) {
        console.log('AuthContext: User ID mudou, verificando loja...');
        refreshHasLoja(u).catch((error) => {
          console.error('AuthContext: Erro ao verificar loja no onAuthStateChange:', error);
        });
      }

      // Redirecionamentos mais suaves
      if (event === 'SIGNED_IN') {
        const path = window.location.pathname;
        if (path === '/login' || path === '/acesso') {
          // Usar replace para evitar throttling de navegação
          setTimeout(() => {
            if (mounted) window.location.replace('/portal/dashboard');
          }, 100);
        }
      }
      if (event === 'SIGNED_OUT') {
        setHasLoja(false);
        const path = window.location.pathname;
        if (path.startsWith('/portal')) {
          setTimeout(() => {
            if (mounted) window.location.replace('/acesso');
          }, 100);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]); // não inclua setters aqui

  // métodos de autenticação
  const signIn = async (email: string, password: string) => {
    if (!configured) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithMagicLink = async (email: string) => {
    if (!configured) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getRedirectUrl('/acesso') },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    if (!configured) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl('/acesso') },
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!configured) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: getRedirectUrl('/portal/dashboard') },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!configured) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    if (!configured) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectUrl('/reset-password'),
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    if (!configured) throw new Error('Supabase não configurado');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    isConfigured: configured,
    isAuth,
    hasLoja,
    dev,
    setIsAuth,
    setHasLoja,
    setDev,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }), [user, loading, configured, isAuth, hasLoja, dev]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
