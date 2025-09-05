import React from 'react';
import { useAuthContext } from '../hooks/useAuth';
import { EstoqueTab } from '../components/dashboard/EstoqueTab';

export const EstoquePage: React.FC = () => {
  const { user } = useAuthContext();
  
  // TODO: Buscar loja_id real do usuário via Supabase
  const lojaId = user?.id || 'temp-loja-id';

  return <EstoqueTab lojaId={lojaId} />;
};