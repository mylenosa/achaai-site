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

  // Timeout de 12 segundos
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: operação demorou mais de 12 segundos')), 12000);
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

    // 3. Sincronizar categorias
    console.log('saveStoreProfile: ANTES - Sincronizando categorias...');
    
    // Buscar categorias atuais
    const categoriasAtuaisPromise = supabase
      .from("loja_categories")
      .select(`
        category_id,
        categories (
          name
        )
      `)
      .eq("loja_id", lojaId);

    const { data: categoriasAtuais, error: categoriasAtuaisError } = await Promise.race([categoriasAtuaisPromise, timeoutPromise]);
    console.log('saveStoreProfile: DEPOIS - Categorias atuais carregadas:', categoriasAtuais, 'error:', categoriasAtuaisError);

    if (categoriasAtuaisError) {
      console.error('saveStoreProfile: Erro ao carregar categorias atuais:', categoriasAtuaisError);
      return { ok: false, error: categoriasAtuaisError.message };
    }

    const categoriasAtuaisNomes = categoriasAtuais?.map((item: any) => item.categories?.name).filter(Boolean) || [];
    const categoriasNovas = form.categories.filter(cat => !categoriasAtuaisNomes.includes(cat));
    const categoriasParaRemover = categoriasAtuaisNomes.filter((cat: string) => !form.categories.includes(cat));

    console.log('saveStoreProfile: Categorias atuais:', categoriasAtuaisNomes);
    console.log('saveStoreProfile: Categorias novas:', categoriasNovas);
    console.log('saveStoreProfile: Categorias para remover:', categoriasParaRemover);

    // Adicionar novas categorias
    for (const categoriaNome of categoriasNovas) {
      const slug = categoriaNome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Upsert categoria
      const categoriaUpsertPromise = supabase
        .from("categories")
        .upsert({ name: categoriaNome, slug }, { onConflict: "slug" })
        .select("id")
        .single();

      const { data: categoriaData, error: categoriaError } = await Promise.race([categoriaUpsertPromise, timeoutPromise]);
      
      if (categoriaError) {
        console.error('saveStoreProfile: Erro ao upsert categoria:', categoriaError);
        return { ok: false, error: categoriaError.message };
      }

      // Inserir relação loja_categories
      const relacaoInsertPromise = supabase
        .from("loja_categories")
        .insert({ loja_id: lojaId, category_id: categoriaData.id });

      const { error: relacaoError } = await Promise.race([relacaoInsertPromise, timeoutPromise]);
      
      if (relacaoError) {
        console.error('saveStoreProfile: Erro ao inserir relação categoria:', relacaoError);
        return { ok: false, error: relacaoError.message };
      }
    }

    // Remover categorias que saíram
    if (categoriasParaRemover.length > 0) {
      const categoriasParaRemoverIds = categoriasAtuais
        ?.filter((item: any) => categoriasParaRemover.includes(item.categories?.name))
        ?.map((item: any) => item.category_id) || [];

      if (categoriasParaRemoverIds.length > 0) {
        const deletePromise = supabase
          .from("loja_categories")
          .delete()
          .eq("loja_id", lojaId)
          .in("category_id", categoriasParaRemoverIds);

        const { error: deleteError } = await Promise.race([deletePromise, timeoutPromise]);
        
        if (deleteError) {
          console.error('saveStoreProfile: Erro ao remover categorias:', deleteError);
          return { ok: false, error: deleteError.message };
        }
      }
    }

    console.log('saveStoreProfile: SALVAMENTO CONCLUÍDO COM SUCESSO');
    return { ok: true, data: lojaData };
  } catch (error) {
    console.error('saveStoreProfile: Erro ou timeout:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function loadStoreProfile() {
  console.log('loadStoreProfile: INICIANDO CARREGAMENTO');
  
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    console.error('loadStoreProfile: Sem sessão de usuário');
    return { ok: false, error: "sem_sessao" };
  }

  console.log('loadStoreProfile: Usuário autenticado:', userId);

  // Timeout de 12 segundos
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: operação demorou mais de 12 segundos')), 12000);
  });

  try {
    console.log('loadStoreProfile: ANTES - Buscando loja...');
    const lojaPromise = supabase
      .from("lojas")
      .select("id, nome, whatsapp")
      .eq("owner_user_id", userId)
      .maybeSingle();

    const { data: loja, error: lojaError } = await Promise.race([lojaPromise, timeoutPromise]);
    console.log('loadStoreProfile: DEPOIS - Busca da loja concluída, loja:', loja, 'error:', lojaError);

    if (lojaError) {
      console.error('loadStoreProfile: Erro na busca da loja:', lojaError);
      return { ok: false, error: lojaError.message };
    }

    if (!loja) {
      console.log('loadStoreProfile: Loja não encontrada');
      return { ok: false, error: "loja_nao_encontrada" };
    }

    // Buscar endereço em paralelo
    console.log('loadStoreProfile: ANTES - Buscando endereço...');
    const enderecoPromise = supabase
      .from("lojas_endereco")
      .select("cep, street, number, bairro, cidade, uf, complemento")
      .eq("loja_id", loja.id)
      .maybeSingle();

    // Buscar categorias em paralelo
    console.log('loadStoreProfile: ANTES - Buscando categorias...');
    const categoriasPromise = supabase
      .from("loja_categories")
      .select(`
        categories (
          name
        )
      `)
      .eq("loja_id", loja.id);

    const [
      { data: endereco, error: enderecoError },
      { data: categorias, error: categoriasError }
    ] = await Promise.race([
      Promise.all([enderecoPromise, categoriasPromise]),
      timeoutPromise
    ]);

    console.log('loadStoreProfile: DEPOIS - Busca do endereço concluída, endereco:', endereco, 'error:', enderecoError);
    console.log('loadStoreProfile: DEPOIS - Busca das categorias concluída, categorias:', categorias, 'error:', categoriasError);

    if (enderecoError) {
      console.error('loadStoreProfile: Erro na busca do endereço:', enderecoError);
      return { ok: false, error: enderecoError.message };
    }

    if (categoriasError) {
      console.error('loadStoreProfile: Erro na busca das categorias:', categoriasError);
      return { ok: false, error: categoriasError.message };
    }

    // Extrair nomes das categorias
    const categoryNames = categorias?.map((item: any) => item.categories?.name).filter(Boolean) || [];

    const result = {
      ok: true,
      data: {
        name: loja.nome || '',
        whatsapp: loja.whatsapp || '',
        categories: categoryNames,
        address: {
          cep: endereco?.cep || '',
          street: endereco?.street || '',
          number: endereco?.number || '',
          bairro: endereco?.bairro || '',
          cidade: endereco?.cidade || '',
          uf: endereco?.uf || '',
          complemento: endereco?.complemento || '',
        }
      }
    };

    console.log('loadStoreProfile: Resultado final:', result);
    return result;
  } catch (error) {
    console.error('loadStoreProfile: Erro ou timeout:', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}
