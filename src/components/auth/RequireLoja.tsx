import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

interface RequireLojaProps {
  children: React.ReactNode;
}

export const RequireLoja: React.FC<RequireLojaProps> = ({ children }) => {
  const { loading, hasLoja, dev } = useAuthContext();

  if (DEMO_MODE || !isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const devAllowed = (import.meta.env.DEV || (import.meta.env.VITE_SHOW_DEV_TOOLS === 'true')) && dev;
  if (devAllowed || hasLoja) {
    return <>{children}</>;
  }

  return <Navigate to="/portal/perfil" replace />;
};
