// Single Responsibility: Hook específico para gerenciar estado do inventário
// Interface Segregation: Expõe apenas o que é necessário
import { useState, useEffect, useCallback } from 'react';
import { 
  InventoryService, 
  InventoryItem, 
  ImportResult,
  LocalStorageInventoryRepository,
  DefaultInventoryValidator,
  BrazilianCurrencyParser
} from '../services/InventoryService';

// Dependency Inversion: Usa abstrações
const inventoryService = new InventoryService(
  new LocalStorageInventoryRepository(),
  new DefaultInventoryValidator(),
  new BrazilianCurrencyParser()
);

export interface UseInventoryReturn {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  saveItem: (item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  confirmAvailability: (itemIds: string[]) => Promise<number>;
  importFromData: (data: { title: string; price: number | null }[], markAsAvailable: boolean) => Promise<ImportResult>;
  refreshItems: () => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allItems = await inventoryService.getAllItems();
      setItems(allItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveItem = useCallback(async (item: Partial<InventoryItem>) => {
    try {
      setError(null);
      await inventoryService.saveItem(item);
      await refreshItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshItems]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      setError(null);
      await inventoryService.deleteItem(id);
      await refreshItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshItems]);

  const confirmAvailability = useCallback(async (itemIds: string[]) => {
    try {
      setError(null);
      const updated = await inventoryService.confirmAvailability(itemIds);
      await refreshItems();
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao confirmar disponibilidade';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshItems]);

  const importFromData = useCallback(async (
    data: { title: string; price: number | null }[], 
    markAsAvailable: boolean
  ) => {
    try {
      setError(null);
      const result = await inventoryService.importFromData(data, markAsAvailable);
      await refreshItems();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar dados';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [refreshItems]);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  return {
    items,
    loading,
    error,
    saveItem,
    deleteItem,
    confirmAvailability,
    importFromData,
    refreshItems
  };
};