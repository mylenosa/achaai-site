import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';

export const RequireLoja: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, hasLoja, dev } = useAuthContext();

  if (dev) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (hasLoja) return <>{children}</>;

  // Redirecionar diretamente para configuração (só se não estiver já na página de perfil)
  if (window.location.pathname === '/portal/perfil') {
    return null; // Evitar loop infinito
  }
  return <Navigate to="/portal/perfil" replace />;
};
