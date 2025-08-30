// Single Responsibility: Contexto de autenticação
// Dependency Inversion: Usa cliente Supabase injetado
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, getRedirectUrl } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    // Verificar sessão atual
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erro ao obter sessão:', error);
        }
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        setUser(session?.user ?? null);
        setLoading(false);

        // Redirecionamentos automáticos baseados no evento
        if (event === 'SIGNED_IN' && session?.user) {
          // Usuário fez login com sucesso
          const currentPath = window.location.pathname;
          if (currentPath === '/login') {
            window.location.href = '/dashboard';
          }
        } else if (event === 'SIGNED_OUT') {
          // Usuário fez logout
          const currentPath = window.location.pathname;
          if (currentPath === '/dashboard') {
            window.location.href = '/login';
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [configured]);

  // Login com email e senha
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  // Login com Magic Link
  const signInWithMagicLink = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl('/dashboard'),
      },
    });

    if (error) {
      throw error;
    }
  };

  // Login com GitHub
  const signInWithGitHub = async () => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: getRedirectUrl('/dashboard'),
      },
    });

    if (error) {
      throw error;
    }
  };

  // Login com Google
  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl('/dashboard'),
      },
    });

    if (error) {
      throw error;
    }
  };

  // Cadastro com email e senha
  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl('/dashboard'),
      },
    });

    if (error) {
      throw error;
    }
  };

  // Logout
  const signOut = async () => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isConfigured: configured,
    signIn,
    signInWithMagicLink,
    signInWithGitHub,
    signInWithGoogle,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};