// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { user, session, loading, dev } = useAuthContext() as any;

  // Bypass DEV (persiste se você salvar 'portalDev' em outro lugar; não é obrigatório p/ corrigir tela branca)
  const devFlag = dev || (typeof window !== 'undefined' && localStorage.getItem('portalDev') === '1');

  const isLoading =
    typeof loading === 'boolean'
      ? loading
      : user === undefined && session === undefined; // estado inicial “indefinido” = carregando

  const isAuthed = Boolean(session || user);

  if (isLoading) return <div className="p-6">Carregando…</div>;
  if (!isAuthed && !devFlag) return <Navigate to="/acesso" replace />;
  return <>{children}</>;
}
