// Hook para gerenciar cache e invalidação
import { useCallback } from 'react';
import { cacheService, CACHE_KEYS } from '../services/CacheService';

export const useCache = () => {
  // Invalidar cache do perfil da loja
  const invalidateStoreProfile = useCallback((userId: string) => {
    const cacheKey = CACHE_KEYS.STORE_PROFILE(userId);
    cacheService.delete(cacheKey);
    console.log('Cache do perfil da loja invalidado');
  }, []);

  // Invalidar cache do dashboard
  const invalidateDashboard = useCallback((userId: string, periodo: string) => {
    const cacheKey = CACHE_KEYS.DASHBOARD_DATA(userId, periodo);
    cacheService.delete(cacheKey);
    console.log('Cache do dashboard invalidado');
  }, []);

  // Invalidar cache dos produtos
  const invalidateProducts = useCallback((storeId: number) => {
    const cacheKey = CACHE_KEYS.MY_PRODUCTS(storeId);
    cacheService.delete(cacheKey);
    console.log('Cache dos produtos invalidado');
  }, []);

  // Limpar todo o cache
  const clearAllCache = useCallback(() => {
    cacheService.clear();
    console.log('Todo o cache foi limpo');
  }, []);

  // Obter estatísticas do cache
  const getCacheStats = useCallback(() => {
    return cacheService.getStats();
  }, []);

  return {
    invalidateStoreProfile,
    invalidateDashboard,
    invalidateProducts,
    clearAllCache,
    getCacheStats,
  };
};
