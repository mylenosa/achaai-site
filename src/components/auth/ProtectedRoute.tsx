import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, isAuth, dev, isConfigured } = useAuthContext();
  const location = useLocation();

  // DEV libera tudo
  if (dev) return <>{children}</>;

  // Se Supabase não está configurado, mostra erro
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Supabase não configurado</div>
          <div className="text-gray-600">Verifique as variáveis de ambiente</div>
        </div>
      </div>
    );
  }

  // Enquanto verifica sessão - NÃO redireciona
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
          <div className="text-gray-600">Verificando autenticação...</div>
        </div>
      </div>
    );
  }

  // Autenticado → ok
  if (isAuth) return <>{children}</>;

  // Senão, manda pro login com redirect de volta
  const redirectUrl = `/acesso?redirect=${encodeURIComponent(location.pathname)}`;
  return <Navigate to={redirectUrl} replace />;
};
