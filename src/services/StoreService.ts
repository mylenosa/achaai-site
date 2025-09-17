// src/services/StoreService.ts
import { supabase } from '../lib/supabase';
import { cacheService, CACHE_KEYS } from './CacheService';

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

/** Tipo de retorno do loadStoreProfile */
export interface StoreProfileData {
  name: string;
  whatsapp: string;
  categories: string[];
  address: {
    cep: string;
    street: string;
    number: string;
    bairro: string;
    cidade: string;
    uf: string;
    complemento: string;
  };
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
    console.log('StoreService.createProfile: INICIANDO CRIAÇÃO', {
      profile: {
        name: profile.name,
        whatsapp: profile.whatsapp,
        categories: profile.categories,
        address: profile.address,
        cep: profile.cep,
        street: profile.street,
        number: profile.number,
        neighborhood: profile.neighborhood,
        city: profile.city,
        state: profile.state
      }
    });

    const { data: s } = await supabase.auth.getSession();
    if (!s?.session?.user) {
      console.error('StoreService.createProfile: Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('StoreService.createProfile: Usuário autenticado:', s.session.user.id);

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

    console.log('StoreService.createProfile: Dados para inserir:', payload);

    console.log('StoreService.createProfile: Executando INSERT no Supabase...');
    const { data, error } = await supabase
      .from('lojas')
      .insert([payload])
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .single();

    if (error) {
      console.error('StoreService.createProfile: Erro no INSERT:', error);
      throw error;
    }

    console.log('StoreService.createProfile: INSERT CONCLUÍDO COM SUCESSO:', data);
    const result = dbToProfile(data as LojaRow);
    console.log('StoreService.createProfile: Perfil convertido:', result);
    return result;
  }

  async updateProfile(profileId: string, updates: Partial<StoreProfile>): Promise<StoreProfile> {
    console.log('StoreService.updateProfile: INICIANDO UPDATE', {
      profileId,
      updates: {
        name: updates.name,
        whatsapp: updates.whatsapp,
        categories: updates.categories,
        address: updates.address,
        cep: updates.cep,
        street: updates.street,
        number: updates.number,
        neighborhood: updates.neighborhood,
        city: updates.city,
        state: updates.state
      }
    });

    console.log('StoreService.updateProfile: Buscando perfil atual...');
    const cur = await supabase
      .from('lojas')
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .eq('id', Number(profileId))
      .single();

    if (cur.error) {
      console.error('StoreService.updateProfile: Erro ao buscar perfil atual:', cur.error);
      throw cur.error;
    }
    const row = cur.data as LojaRow;
    console.log('StoreService.updateProfile: Perfil atual encontrado:', {
      id: row.id,
      nome: row.nome,
      whatsapp: row.whatsapp,
      attrs: row.attrs
    });

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

    console.log('StoreService.updateProfile: Dados para atualizar:', patch);

    console.log('StoreService.updateProfile: Executando UPDATE no Supabase...');
    const { data, error } = await supabase
      .from('lojas')
      .update(patch)
      .eq('id', Number(profileId))
      .select('id, owner_user_id, nome, whatsapp, googlemapslink, attrs, created_at, updated_at')
      .single();

    if (error) {
      console.error('StoreService.updateProfile: Erro no UPDATE:', error);
      throw error;
    }

    console.log('StoreService.updateProfile: UPDATE CONCLUÍDO COM SUCESSO:', data);
    const result = dbToProfile(data as LojaRow);
    console.log('StoreService.updateProfile: Perfil convertido:', result);
    return result;
  }
}

export async function getMyStoreId(): Promise<number | null> {
  const { data: s } = await supabase.auth.getSession();
  const userId = s?.session?.user?.id;
  if (!userId) return null;

  const prof = await storeService.getProfile(userId);
  return prof?.id ? Number(prof.id) : null;
}

export const storeService = new StoreService();

// ===================== Novas funções simplificadas =====================

// lê/salva perfil da LOJA do usuário logado
export async function saveStoreProfile(form: {
  name: string;
  categories: string[];
  whatsapp?: string;
  address: {
  cep?: string; street?: string; number?: string;
  bairro?: string; cidade?: string; uf?: string; complemento?: string;
  };
}) {
  console.log('saveStoreProfile: INICIANDO SALVAMENTO', form);
  
  console.log('saveStoreProfile: ANTES - Chamando supabase.auth.getSession()...');
  const { data: { session } } = await supabase.auth.getSession();
  console.log('saveStoreProfile: DEPOIS - getSession() concluído, session:', !!session);
  
  const userId = session?.user?.id;
  if (!userId) {
    console.error('saveStoreProfile: Sem sessão de usuário - userId vazio');
    return { ok: false, error: "sem_sessao" };
  }

  console.log('saveStoreProfile: Usuário autenticado:', userId);

  // Timeout aumentado para 20 segundos para evitar throttling
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: operação demorou mais de 20 segundos')), 20000);
  });

  try {
    console.log('saveStoreProfile: ANTES - Buscando loja existente (SELECT)...');
    const lojaPromise = supabase
      .from("lojas")
      .select("id, nome, whatsapp")
      .eq("owner_user_id", userId)
      .maybeSingle();

    const { data: loja, error: selectError } = await Promise.race([lojaPromise, timeoutPromise]);
    console.log('saveStoreProfile: DEPOIS - SELECT concluído, loja:', loja, 'selectError:', selectError);
    
    if (selectError) {
      console.error('saveStoreProfile: Erro no SELECT:', selectError);
      return { ok: false, error: selectError.message };
    }

    // Normalizar whatsapp (apenas dígitos)
    const whatsappNormalizado = form.whatsapp?.replace(/\D/g, '') || null;

    // 1. Atualizar dados da loja
    console.log('saveStoreProfile: ANTES - Atualizando dados da loja...');
    const lojaPayload = {
      owner_user_id: userId,
      nome: form.name?.trim() || null,
      whatsapp: whatsappNormalizado,
    };

    const lojaUpsertPromise = supabase
      .from("lojas")
      .upsert(lojaPayload, { onConflict: "owner_user_id" })
      .select("id, nome, whatsapp, created_at, updated_at")
      .single();

    const { data: lojaData, error: lojaError } = await Promise.race([lojaUpsertPromise, timeoutPromise]);
    console.log('saveStoreProfile: DEPOIS - Loja atualizada, data:', lojaData, 'error:', lojaError);

    if (lojaError) {
      console.error('saveStoreProfile: Erro ao atualizar loja:', lojaError);
      return { ok: false, error: lojaError.message };
    }

    const lojaId = lojaData.id;

    // 2. Upsert endereço
    console.log('saveStoreProfile: ANTES - Atualizando endereço...');
    const enderecoPayload = {
      loja_id: lojaId,
      cep: form.address.cep || null,
      street: form.address.street || null,
      number: form.address.number || null,
      bairro: form.address.bairro || null,
      cidade: form.address.cidade || null,
      uf: form.address.uf || null,
      complemento: form.address.complemento || null,
    };

    const enderecoUpsertPromise = supabase
      .from("lojas_endereco")
      .upsert(enderecoPayload, { onConflict: "loja_id" })
      .select("*");

    const { data: enderecoData, error: enderecoError } = await Promise.race([enderecoUpsertPromise, timeoutPromise]);
    console.log('saveStoreProfile: DEPOIS - Endereço atualizado, data:', enderecoData, 'error:', enderecoError);

    if (enderecoError) {
      console.error('saveStoreProfile: Erro ao atualizar endereço:', enderecoError);
      return { ok: false, error: enderecoError.message };
    }

    // 3. Sincronizar categorias (apenas relacionar, não criar)
    console.log('saveStoreProfile: ANTES - Sincronizando categorias...');
    
    let categoriasExistentes: any[] = [];
    
    // Validar se todas as categorias existem
    if (form.categories.length > 0) {
      console.log('saveStoreProfile: Validando categorias existentes...');
      const categoriasExistentesPromise = supabase
        .from("categories")
        .select("id, name")
        .in("name", form.categories);

      const { data: categoriasExistentesData, error: categoriasExistentesError } = await Promise.race([categoriasExistentesPromise, timeoutPromise]);
      console.log('saveStoreProfile: Categorias existentes encontradas:', categoriasExistentesData, 'error:', categoriasExistentesError);

      if (categoriasExistentesError) {
        console.error('saveStoreProfile: Erro ao validar categorias:', categoriasExistentesError);
        return { ok: false, error: categoriasExistentesError.message };
      }

      categoriasExistentes = categoriasExistentesData || [];

      // Verificar se todas as categorias solicitadas existem
      const nomesExistentes = categoriasExistentes?.map((cat: any) => cat.name) || [];
      const categoriasInvalidas = form.categories.filter(nome => !nomesExistentes.includes(nome));
      
      if (categoriasInvalidas.length > 0) {
        console.error('saveStoreProfile: Categorias inválidas:', categoriasInvalidas);
        return { ok: false, error: "Categoria inválida" };
      }
    }

    // Buscar categorias atuais da loja
    console.log('saveStoreProfile: Buscando categorias atuais da loja...');
    const categoriasAtuaisPromise = supabase
      .from("loja_categories")
      .select("category_id")
      .eq("loja_id", lojaId);

    const { data: categoriasAtuais, error: categoriasAtuaisError } = await Promise.race([categoriasAtuaisPromise, timeoutPromise]);
    console.log('saveStoreProfile: Categorias atuais da loja:', categoriasAtuais, 'error:', categoriasAtuaisError);

    if (categoriasAtuaisError) {
      console.error('saveStoreProfile: Erro ao carregar categorias atuais:', categoriasAtuaisError);
      return { ok: false, error: categoriasAtuaisError.message };
    }

    // Calcular toAdd/toRemove
    const categoriasAtuaisIds = categoriasAtuais?.map((item: any) => item.category_id) || [];
    const categoriasSolicitadasIds = categoriasExistentes?.map((cat: any) => cat.id) || [];
    
    const toAdd = categoriasSolicitadasIds.filter((id: any) => !categoriasAtuaisIds.includes(id));
    const toRemove = categoriasAtuaisIds.filter((id: any) => !categoriasSolicitadasIds.includes(id));

    console.log('saveStoreProfile: Categorias para adicionar:', toAdd);
    console.log('saveStoreProfile: Categorias para remover:', toRemove);

    // Adicionar novas relações
    if (toAdd.length > 0) {
      console.log('saveStoreProfile: Adicionando novas relações...');
      const toAddData = toAdd.map((categoryId: any) => ({ loja_id: lojaId, category_id: categoryId }));
      
      const insertPromise = supabase
        .from("loja_categories")
        .insert(toAddData);

      const { error: insertError } = await Promise.race([insertPromise, timeoutPromise]);
      
      if (insertError) {
        console.error('saveStoreProfile: Erro ao adicionar relações:', insertError);
        return { ok: false, error: insertError.message };
      }
    }

    // Remover relações desnecessárias
    if (toRemove.length > 0) {
      console.log('saveStoreProfile: Removendo relações desnecessárias...');
      const deletePromise = supabase
        .from("loja_categories")
        .delete()
        .eq("loja_id", lojaId)
        .in("category_id", toRemove);

      const { error: deleteError } = await Promise.race([deletePromise, timeoutPromise]);
      
      if (deleteError) {
        console.error('saveStoreProfile: Erro ao remover relações:', deleteError);
        return { ok: false, error: deleteError.message };
      }
    }

    console.log('saveStoreProfile: SALVAMENTO CONCLUÍDO COM SUCESSO');
    
    // Invalidar cache do perfil
    const cacheKey = CACHE_KEYS.STORE_PROFILE(userId);
    cacheService.delete(cacheKey);
    console.log('saveStoreProfile: Cache invalidado');
    
    return { ok: true, data: lojaData };
  } catch (error) {
    console.error('saveStoreProfile: Erro ou timeout:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function loadStoreProfile(): Promise<{ ok: true; data: StoreProfileData } | { ok: false; error: string }> {
  console.log('loadStoreProfile: INICIANDO CARREGAMENTO');
  
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    console.error('loadStoreProfile: Sem sessão de usuário');
    return { ok: false, error: "sem_sessao" };
  }

  console.log('loadStoreProfile: Usuário autenticado:', userId);

  // Verificar cache primeiro
  const cacheKey = CACHE_KEYS.STORE_PROFILE(userId);
  const cachedData = cacheService.get<StoreProfileData>(cacheKey);
  if (cachedData) {
    console.log('loadStoreProfile: Dados encontrados no cache');
    return { ok: true, data: cachedData };
  }

  // Timeout aumentado para 15 segundos para evitar throttling
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: operação demorou mais de 15 segundos')), 15000);
  });

  try {
    console.log('loadStoreProfile: ANTES - Buscando dados completos da loja...');
    
    // Consulta otimizada: buscar tudo em uma única query com joins
    const lojaPromise = supabase
      .from("lojas")
      .select(`
        id, 
        nome, 
        whatsapp,
        lojas_endereco (
          cep, 
          street, 
          number, 
          bairro, 
          cidade, 
          uf, 
          complemento
        ),
        loja_categories (
          categories (
            name
          )
        )
      `)
      .eq("owner_user_id", userId)
      .maybeSingle();

    const { data: loja, error: lojaError } = await Promise.race([lojaPromise, timeoutPromise]);
    console.log('loadStoreProfile: DEPOIS - Busca completa concluída, loja:', loja, 'error:', lojaError);

    if (lojaError) {
      console.error('loadStoreProfile: Erro na busca da loja:', lojaError);
      return { ok: false, error: lojaError.message };
    }

    if (!loja) {
      console.log('loadStoreProfile: Loja não encontrada');
      return { ok: false, error: "loja_nao_encontrada" };
    }

    // Extrair dados das relações
    const endereco = loja.lojas_endereco || null;
    const categorias = loja.loja_categories || [];
    
    console.log('loadStoreProfile: Endereço extraído:', endereco);
    console.log('loadStoreProfile: Categorias extraídas:', categorias);

    // Extrair nomes das categorias
    const categoryNames = categorias?.map((item: any) => item.categories?.name).filter(Boolean) || [];

    const result: { ok: true; data: StoreProfileData } = {
      ok: true,
      data: {
        name: loja.nome || '',
        whatsapp: loja.whatsapp || '',
        categories: categoryNames,
        address: {
          cep: (endereco as any)?.cep || '',
          street: (endereco as any)?.street || '',
          number: (endereco as any)?.number || '',
          bairro: (endereco as any)?.bairro || '',
          cidade: (endereco as any)?.cidade || '',
          uf: (endereco as any)?.uf || '',
          complemento: (endereco as any)?.complemento || '',
        }
      }
    };

    console.log('loadStoreProfile: Resultado final:', result);
    
    // Salvar no cache (TTL de 5 minutos)
    if (result.ok && 'data' in result) {
      cacheService.set(cacheKey, result.data, 5 * 60 * 1000);
      console.log('loadStoreProfile: Dados salvos no cache');
    }
    
    return result;
  } catch (error) {
    console.error('loadStoreProfile: Erro ou timeout:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
