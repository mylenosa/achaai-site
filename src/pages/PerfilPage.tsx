// Single Responsibility: Página de perfil da loja
import React, { useState, useEffect } from 'react';
import { StoreProfileForm, StoreProfile } from '../components/forms/StoreProfileForm';
import { useAuthContext } from '../hooks/useAuth';

export const PerfilPage: React.FC = () => {
  const [initialProfile, setInitialProfile] = useState<Partial<StoreProfile>>({});
  const { setHasLoja } = useAuthContext();

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('storeProfile');
    if (saved) {
      try {
        const savedProfile = JSON.parse(saved);
        setInitialProfile(savedProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  const handleSave = async (profile: StoreProfile): Promise<void> => {
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem('storeProfile', JSON.stringify(profile));
    
    // Mark that user has a store profile
    setHasLoja(true);
    
    // Update initial profile to reflect saved changes
    setInitialProfile(profile);
  };

  const handleClear = () => {
    localStorage.removeItem('storeProfile');
    setHasLoja(false);
    setInitialProfile({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Perfil da Loja</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Configure as informações básicas da sua loja
        </p>
      </div>

      {/* Form */}
      <StoreProfileForm
        initialProfile={initialProfile}
        onSave={handleSave}
        onClear={handleClear}
      />
    </div>
  );
};