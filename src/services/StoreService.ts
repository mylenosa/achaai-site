import { supabase } from '../lib/supabase';

export interface StoreProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  whatsapp: string;
  categories: string[];
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  address: string;
  opening_hours?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mapeamento para a tabela física `lojas` (PT) com extras em `attrs` (JSONB).
 * Mantém a API pública (SOLID) e minimiza impacto no resto do repo.
 */
type LojaRow = {
  id: number;
  owner_user_id: string;
  nome: string | null;
  whatsapp: string | null;
  googlemapslink: string | null;
  attrs: any | null;
  created_at: string;
  updated_at: string;
};

function buildMapsLink(address?: string) {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function dbToProfile(row: LojaRow): StoreProfile {
  const addr = row.attrs?.address ?? {};
  return {
    id: String(row.id),
    user_id: row.owner_user_id,
    name: row.nome ?? '',
    description: row.attrs?.description ?? undefined,
    whatsapp: row.whatsapp ?? '',
    categories: Array.isArray(row.attrs?.categories) ? row.attrs.categories : [],
    cep: addr.cep ?? '',
    street: addr.street ?? '',
    number: addr.number ?? '',
    neighborhood: addr.neighborhood ?? '',
    city: addr.city ?? '',
    state: addr.state ?? '',
    address: addr.full ?? '',
    opening_hours: row.attrs?.opening_hours ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mergeAttrs(oldAttrs: any, p: Partial<StoreProfile>) {
  const prev = oldAttrs ?? {};
  return {
    ...prev,
    description: p.description ?? prev.description ?? null,
    categories: p.categories ?? prev.categories ?? [],
    opening_hours: p.opening_hours ?? prev.opening_hours ?? null,
    address: {
      ...(prev.address ?? {}),
      cep: p.cep ?? prev.address?.cep ?? null,
      street: p.street ?? prev.address?.street ?? null,
      number: p.number ?? prev.address?.number ?? null,
      neighborhood: p.neighborhood ?? prev.address?.neighborhood ?? null,
      city: p.city ?? prev.address?.city ?? null,
      state: p.state ?? prev.address?.state ?? null,
      full: p.address ?? prev.address?.full ?? null,
    },
  };
}

export class StoreService {
  async getProfile(userId: string): Promise<StoreProfile | null> {
    const { data, error } = await supabase
      .from('lojas')
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .eq('owner_user_id', userId)
      .maybeSingle();

    if (error) {
      // PGRST116 = not found quando usa .single(), com maybeSingle não deve disparar
      // mas se vier erro inesperado, propaga:
      throw error;
    }
    if (!data) return null;
    return dbToProfile(data as LojaRow);
  }

  async createProfile(profile: Partial<StoreProfile>): Promise<StoreProfile> {
    // garante sessão
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) throw new Error('Supabase não configurado ou usuário não autenticado');

    // monta attrs e campos principais
    const attrs = mergeAttrs(null, profile);
    const nome = profile.name?.trim() || '';
    const whatsapp = profile.whatsapp?.trim() || null;
    const address = profile.address?.trim();
    const googlemapslink = buildMapsLink(address);

    const payload = {
      owner_user_id: s.session.user.id, // ajuda a passar na RLS mesmo que o DEFAULT já esteja no banco
      nome,
      whatsapp,
      googlemapslink,
      attrs,
    };

    const { data, error } = await supabase
      .from('lojas')
      .insert([payload])
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .single();

    if (error) throw error;
    return dbToProfile(data as LojaRow);
  }

  async updateProfile(profileId: string, updates: Partial<StoreProfile>): Promise<StoreProfile> {
    // pega a linha atual para mesclar JSON com segurança
    const cur = await supabase
      .from('lojas')
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .eq('id', Number(profileId))
      .single();

    if (cur.error) throw cur.error;
    const row = cur.data as LojaRow;

    const mergedAttrs = mergeAttrs(row.attrs, updates);
    const nextNome = updates.name !== undefined ? (updates.name?.trim() || '') : row.nome;
    const nextWhatsapp = updates.whatsapp !== undefined ? (updates.whatsapp?.trim() || null) : row.whatsapp;

    // googlemapslink: recalcula se veio address completo novo; senão mantém
    const nextAddressFull = updates.address ?? mergedAttrs.address?.full ?? undefined;
    const nextMaps = updates.address !== undefined ? buildMapsLink(nextAddressFull) : row.googlemapslink;

    const patch = {
      nome: nextNome,
      whatsapp: nextWhatsapp,
      googlemapslink: nextMaps,
      attrs: mergedAttrs,
      // updated_at é atualizado via trigger no banco
    };

    const { data, error } = await supabase
      .from('lojas')
      .update(patch)
      .eq('id', Number(profileId))
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .single();

    if (error) throw error;
    return dbToProfile(data as LojaRow);
  }
}

export const storeService = new StoreService();
