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

  // habilitar modo DEV via ?dev=1
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === '1') setDev(true);
  }, []);

  // helper: checa se o usuário tem loja
  async function refreshHasLoja(u?: User | null) {
    try {
      const uid = (u ?? user)?.id;
      if (!uid) { setHasLoja(false); return; }

      const { data, error } = await supabase
        .from('stores')               // <-- troque para 'lojas' se não houver view
        .select('id')
        .eq('owner_user_id', uid)
        .maybeSingle();

      if (error) throw error;
      setHasLoja(!!data?.id);
    } catch (e) {
      console.error('Erro ao checar loja:', e);
      setHasLoja(false);
    }
  }

  // bootstrap + eventos de auth
  useEffect(() => {
    if (!configured) { 
      setLoading(false); 
      return; 
    }

    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const u = session?.user ?? null;
        setUser(u);
        setIsAuth(!!u);
        await refreshHasLoja(u);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        if (mounted) {
          setUser(null);
          setIsAuth(false);
          setHasLoja(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      const u = session?.user ?? null;
      setUser(u);
      setIsAuth(event === 'SIGNED_IN' && !!u);
      await refreshHasLoja(u);

      // Redirecionamentos mais suaves
      if (event === 'SIGNED_IN') {
        const path = window.location.pathname;
        if (path === '/login' || path === '/acesso') {
          // Usar navigate ao invés de window.location.href para evitar reload
          setTimeout(() => {
            if (mounted) window.location.href = '/portal/dashboard';
          }, 100);
        }
      }
      if (event === 'SIGNED_OUT') {
        setHasLoja(false);
        const path = window.location.pathname;
        if (path.startsWith('/portal')) {
          setTimeout(() => {
            if (mounted) window.location.href = '/acesso';
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
