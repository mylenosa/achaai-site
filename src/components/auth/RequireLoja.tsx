import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';
import { storeService } from '../../services/StoreService';

interface RequireLojaProps {
  children: React.ReactNode;
}

export const RequireLoja: React.FC<RequireLojaProps> = ({ children }) => {
  const { user, isConfigured } = useAuthContext();
  const [hasStore, setHasStore] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStore = async () => {
      if (!user || !isConfigured) {
        setLoading(false);
        return;
      }

      try {
        const profile = await storeService.getProfile(user.id);
        setHasStore(!!profile);
      } catch (error) {
        console.error('Erro ao verificar loja:', error);
        setHasStore(false);
      } finally {
        setLoading(false);
      }
    };

    checkStore();
  }, [user, isConfigured]);

  // Mostrar loading enquanto verifica
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Se não tem loja, redirecionar para perfil
  if (!hasStore) {
    return <Navigate to="/portal/perfil" replace />;
  }

  return <>{children}</>;
};