import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';

interface RequireLojaProps {
  children: React.ReactNode;
}

export const RequireLoja: React.FC<RequireLojaProps> = ({ children }) => {
  const { loading, hasLoja, dev } = useAuthContext();

  // Mostrar loading enquanto verifica
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Se modo DEV ativo ou tem loja, permitir acesso
  if (dev || hasLoja) {
    return <>{children}</>;
  }

  // Se não tem loja, redirecionar para perfil
  return <Navigate to="/portal/perfil" replace />;
};