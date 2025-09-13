import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

// Opcional: centralize flags no futuro em src/lib/env.ts
const SHOW_DEV_TOOLS = import.meta.env.VITE_SHOW_DEV_TOOLS === 'true';
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, isAuth, dev } = useAuthContext();
  const location = useLocation();

  // 1) Se estiver em modo DEMO ou Supabase não configurado -> libera
  if (DEMO_MODE || !isSupabaseConfigured) {
    return <>{children}</>;
  }

  // 2) Se o app está carregando sessão -> spinner curto e controlado
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // 3) Se DEV toggle estiver ativo E botões estão habilitados no build -> libera
  const devAllowed = (import.meta.env.DEV || SHOW_DEV_TOOLS) && dev;
  if (devAllowed || isAuth) {
    return <>{children}</>;
  }

  // 4) Não autenticado: manda pro login com redirect
  const redirectUrl = `/acesso?redirect=${encodeURIComponent(location.pathname)}`;
  return <Navigate to={redirectUrl} replace />;
};
