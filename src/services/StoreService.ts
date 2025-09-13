// src/services/StoreService.ts
import { supabase } from '../lib/supabase';

/** Modelo usado pelo app */
export interface StoreProfile {
  id: string;
  user_id: string;
  name: string;
  whatsapp: string;
  categories: string[];
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  address: string;
  created_at: string;
  updated_at: string;
}

// Linha física (tabela `lojas`)
type LojaRow = {
  id: number;
  owner_user_id: string | null;
  nome: string | null;
  whatsapp: string | null;
  googlemapslink: string | null;
  attrs: any | null;
  created_at: string;
  updated_at: string;
};

function buildMapsLink(address?: string | null) {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function dbToProfile(row: LojaRow): StoreProfile {
  const addr = row.attrs?.address ?? {};
  return {
    id: String(row.id),
    user_id: row.owner_user_id ?? '',
    name: row.nome ?? '',
    whatsapp: row.whatsapp ?? '',
    categories: Array.isArray(row.attrs?.categories) ? row.attrs.categories : [],
    cep: addr.cep ?? '',
    street: addr.street ?? '',
    number: addr.number ?? '',
    neighborhood: addr.neighborhood ?? '',
    city: addr.city ?? '',
    state: addr.state ?? '',
    address: addr.full ?? '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mergeAttrs(oldAttrs: any, p: Partial<StoreProfile>) {
  const prev = oldAttrs ?? {};
  return {
    ...prev,
    categories: p.categories ?? prev.categories ?? [],
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

class StoreService {
  async getProfile(userId: string): Promise<StoreProfile | null> {
    const { data, error } = await supabase
      .from('lojas') // use 'stores' se você tiver a view com esse nome
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .eq('owner_user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return dbToProfile(data as LojaRow);
  }

  async createProfile(profile: Partial<StoreProfile>): Promise<StoreProfile> {
    const { data: s } = await supabase.auth.getSession();
    if (!s?.session?.user) throw new Error('Usuário não autenticado');

    const attrs = mergeAttrs(null, profile);
    const nome = profile.name?.trim() || '';
    const whatsapp = profile.whatsapp?.trim() || null;
    const googlemapslink = buildMapsLink(profile.address);

    const payload = {
      owner_user_id: s.session.user.id, // ajuda a passar na RLS
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

    const nextAddressFull = updates.address ?? mergedAttrs.address?.full ?? undefined;
    const nextMaps = updates.address !== undefined ? buildMapsLink(nextAddressFull) : row.googlemapslink;

    const patch = {
      nome: nextNome,
      whatsapp: nextWhatsapp,
      googlemapslink: nextMaps,
      attrs: mergedAttrs,
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
