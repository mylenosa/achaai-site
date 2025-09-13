// src/services/productService.ts
import { supabase } from '../lib/supabase';

export type ProductRow = {
  id: number;
  nome: string | null;
  preco: number | null;
  loja_id: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

// Se você mantiver a VIEW "products", mude para 'products'
const PRODUCTS_TABLE = 'produtos';

export async function listProducts(lojaId: number): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('id, nome, preco, loja_id, ativo, created_at, updated_at')
    .eq('loja_id', lojaId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

export async function createProduct(
  lojaId: number,
  nome: string,
  preco: number | null
): Promise<ProductRow> {
  const payload = { loja_id: lojaId, nome, preco, ativo: true };
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .insert(payload)
    .select('id, nome, preco, loja_id, ativo, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as ProductRow;
}

export async function updateProduct(
  id: number,
  nome: string,
  preco: number | null
): Promise<ProductRow> {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .update({ nome, preco })
    .eq('id', id)
    .select('id, nome, preco, loja_id, ativo, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as ProductRow;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
}
