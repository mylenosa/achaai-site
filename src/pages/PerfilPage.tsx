// src/pages/PerfilPage.tsx
import React from 'react';
import { StoreProfileForm } from '../components/dashboard/StoreProfileForm';

export const PerfilPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Título principal da página */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Perfil da Loja</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Configure as informações que seus clientes verão.
        </p>
      </div>

      {/* Formulário renderizado sem lógica extra */}
      <StoreProfileForm />
    </div>
  );
};