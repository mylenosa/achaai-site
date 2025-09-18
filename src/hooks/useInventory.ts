import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../hooks/useAuth';
import { getMyStoreId } from '../services/StoreService';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductRow,
} from '../services/productService';

/** ===== Tipos expostos pelo hook ===== */
export interface InventoryItem {
  id: string;
  title: string;
  price: number | null;
  available: boolean;      // mapeia 'ativo' do banco
  verifiedAt?: string;     // mantido por compatibilidade (não usamos no banco)
  updatedAt: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  ignored: number;
  errors: { line: number; reason: string }[];
}

export interface UseInventoryReturn {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  saveItem: (item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  confirmAvailability: (_itemIds: string[]) => Promise<number>; // no-op por enquanto
  importFromData: (
    data: { title: string; price: number | null }[],
    markAsAvailable: boolean
  ) => Promise<ImportResult>;
  refreshItems: () => Promise<void>;
}

/** ===== Helpers ===== */
function toInventoryItem(p: ProductRow): InventoryItem {
  return {
    id: String(p.id),
    title: p.nome ?? '',
    price: p.preco,
    available: p.ativo,
    updatedAt: p.updated_at,
  };
}

/** ===== Hook ===== */
export const useInventory = (): UseInventoryReturn => {
  const { user } = useAuthContext();
  const [storeId, setStoreId] = useState<number | null>(null);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Descobre a loja do usuário logado */
  const ensureStoreId = useCallback(async (): Promise<number | null> => {
    if (storeId) return storeId;
    if (!user) return null;

    const id = await getMyStoreId();
    setStoreId(id);
    return id;
  }, [storeId, user]);

  /** Carrega itens do Supabase */
  const refreshItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const id = await ensureStoreId();
      if (!id) {
        setItems([]);
        return;
      }

      const rows = await listProducts(id); // ProductRow[]
      const mapped = rows.map(toInventoryItem).sort(
        (a, b) => b.updatedAt.localeCompare(a.updatedAt)
      );
      setItems(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  }, [ensureStoreId]);

  /** Cria/atualiza item */
  const saveItem = useCallback(
    async (item: Partial<InventoryItem>) => {
      const id = await ensureStoreId();
      if (!id) throw new Error('Crie o perfil da loja antes de cadastrar produtos.');

      const title = (item.title ?? '').trim();
      if (title.length < 2) throw new Error('Nome deve ter pelo menos 2 caracteres');
      if (item.price != null && item.price < 0) {
        throw new Error('Preço deve ser maior ou igual a zero');
      }

      if (item.id) {
        await updateProduct(Number(item.id), title, item.price ?? null);
      } else {
        await createProduct(id, title, item.price ?? null);
      }
      await refreshItems();
    },
    [ensureStoreId, refreshItems]
  );

  /** Excluir item */
  const deleteItemFn = useCallback(
    async (id: string) => {
      await deleteProduct(Number(id));
      await refreshItems();
    },
    [refreshItems]
  );

  /** Confirmar disponibilidade — no-op no seu modelo atual */
  const confirmAvailability = useCallback(async (_itemIds: string[]) => {
    return 0;
  }, []);

  /** Importação simples via CRUD */
  const importFromData = useCallback(
    async (
      data: { title: string; price: number | null }[],
      _markAsAvailable: boolean
    ) => {
      const id = await ensureStoreId();
      if (!id) throw new Error('Crie o perfil da loja antes de importar produtos.');

      const current = await listProducts(id);
      const byName = new Map<string, ProductRow>();
      current.forEach((p) =>
        byName.set((p.nome ?? '').trim().toLowerCase(), p)
      );

      let imported = 0,
        updated = 0,
        ignored = 0;
      const errors: { line: number; reason: string }[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const line = i + 2; // linha no Excel (considera cabeçalho)

        try {
          const name = (row.title ?? '').trim();
          if (name.length < 2) {
            ignored++;
            errors.push({ line, reason: 'Nome muito curto' });
            continue;
          }
          if (row.price != null && row.price < 0) {
            ignored++;
            errors.push({ line, reason: 'Preço inválido' });
            continue;
          }

          const key = name.toLowerCase();
          const existing = byName.get(key);

          if (existing) {
            await updateProduct(existing.id, name, row.price ?? null);
            updated++;
          } else {
            await createProduct(id, name, row.price ?? null);
            imported++;
          }
        } catch (e) {
          ignored++;
          errors.push({
            line,
            reason: e instanceof Error ? e.message : 'Erro ao processar linha',
          });
        }
      }

      await refreshItems();
      return { imported, updated, ignored, errors };
    },
    [ensureStoreId, refreshItems]
  );

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  return {
    items,
    loading,
    error,
    saveItem,
    deleteItem: deleteItemFn,
    confirmAvailability,
    importFromData,
    refreshItems,
  };
};
