import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

interface RequireLojaProps {
  children: React.ReactNode;
}

export const RequireLoja: React.FC<RequireLojaProps> = ({ children }) => {
  const { loading, hasLoja, dev } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // Se Supabase não está configurado (ou DEV on), não bloqueie
  if (!isSupabaseConfigured || dev || hasLoja) {
    return <>{children}</>;
  }

  // Sem loja → vai para o perfil, guardando origem
  return <Navigate to="/portal/perfil" replace state={{ from: location }} />;
};
