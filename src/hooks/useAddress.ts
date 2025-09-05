// Single Responsibility: Hook específico para operações de endereço
import { useState, useCallback } from 'react';
import { AddressService, AddressData, createAddressService } from '../services/AddressService';

interface UseAddressReturn {
  searchByCep: (cep: string) => Promise<AddressData | null>;
  isLoading: boolean;
  error: string | null;
}

// Dependency Inversion: Usa abstração do serviço
export const useAddress = (): UseAddressReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Singleton service instance
  const addressService = createAddressService();

  const searchByCep = useCallback(async (cep: string): Promise<AddressData | null> => {
    if (!cep || cep.length !== 8) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await addressService.searchByCep(cep);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CEP';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addressService]);

  return {
    searchByCep,
    isLoading,
    error
  };
};