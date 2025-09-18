// Cache simples para dados que não mudam frequentemente
// Single Responsibility: Gerenciamento de cache em memória

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();

  // TTL padrão: 5 minutos
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Limpar itens expirados
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Estatísticas do cache
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired
    };
  }
}

// Instância singleton
export const cacheService = new CacheService();

// Limpar cache expirado a cada 10 minutos
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);

// Chaves de cache padronizadas
export const CACHE_KEYS = {
  STORE_PROFILE: (userId: string) => `store_profile_${userId}`,
  DASHBOARD_DATA: (userId: string, periodo: string) => `dashboard_${userId}_${periodo}`,
  MY_PRODUCTS: (storeId: number) => `my_products_${storeId}`,
  CATEGORIES: 'categorias_list',
} as const;
