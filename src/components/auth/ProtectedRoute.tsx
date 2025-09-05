import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, isAuth, dev } = useAuthContext();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Se modo DEV ativo ou autenticado, permitir acesso
  if (dev || isAuth) {
    return <>{children}</>;
  }

  // Se não estiver logado, redirecionar para login com redirect
  const redirectUrl = `/acesso?redirect=${encodeURIComponent(location.pathname)}`;
  return <Navigate to={redirectUrl} replace />;
};