import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, isAuth, dev } = useAuthContext();
  const location = useLocation();

  // Enquanto o AuthContext resolve a sessão, mostre um loader curto
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // Se o Supabase não está configurado, NÃO bloqueie o portal (modo demo)
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  // Em ambiente configurado: DEV libera, senão precisa estar autenticado
  if (dev || isAuth) {
    return <>{children}</>;
  }

  // Redireciona para login, guardando a rota de origem no state
  return <Navigate to="/acesso" replace state={{ from: location }} />;
};
