import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isConfigured } = useAuthContext();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Se Supabase não estiver configurado, permitir acesso (para desenvolvimento)
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Se não estiver logado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};