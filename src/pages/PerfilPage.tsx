// src/pages/PerfilPage.tsx
// Single Responsibility: Página que renderiza o formulário de perfil da loja.

import React from 'react';
import { StoreProfileForm } from '../components/dashboard/StoreProfileForm';

export const PerfilPage: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Perfil da Loja</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Configure as informações básicas da sua loja
        </p>
      </div>

      {/* Form */}
      <StoreProfileForm />
    </div>
  );
};