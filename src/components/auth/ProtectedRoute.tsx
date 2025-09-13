import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, isAuth, dev } = useAuthContext();
  const location = useLocation();

  // DEV libera tudo
  if (dev) return <>{children}</>;

  // Enquanto verifica sessão
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // Autenticado → ok
  if (isAuth) return <>{children}</>;

  // Senão, manda pro login com redirect de volta
  const redirectUrl = `/acesso?redirect=${encodeURIComponent(location.pathname)}`;
  return <Navigate to={redirectUrl} replace />;
};
