// src/services/StoreService.ts
import { supabase } from '../lib/supabase';
import { cacheService, CACHE_KEYS } from './CacheService';

// Interface StoreProfile removida - usar StoreProfileData em vez disso

/** Tipo de retorno do loadStoreProfile */
export interface StoreProfileData {
  name: string;
  whatsapp: string;
  categories: string[];
  address: {
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    complemento: string;
  };
}

// Tipo LojaRow removido - não usado mais

function buildMapsLink(address?: string | null) {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// Função removida - usar loadStoreProfile() em vez de dbToProfile()

// Função removida - usar saveStoreProfile() em vez de mergeAttrs()

// Classe StoreService removida - usar loadStoreProfile() e saveStoreProfile() em vez disso

export async function getMyStoreId(): Promise<number | null> {
  const { data: s } = await supabase.auth.getSession();
  const userId = s?.session?.user?.id;
  if (!userId) return null;

  // Buscar loja usando a nova estrutura
  const { data: loja, error } = await supabase
    .from('lojas_v')
    .select('id')
    .eq('owner_user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getMyStoreId: Erro ao buscar loja:', error);
    return null;
  }

  return loja?.id ? Number(loja.id) : null;
}

// ===================== Novas funções simplificadas =====================

// lê/salva perfil da LOJA do usuário logado
export async function saveStoreProfile(form: {
  name: string;
  categories: string[];
  whatsapp?: string;
  address: {
  cep?: string; logradouro?: string; numero?: string;
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
      nome: form.name?.trim() || null,
      whatsapp: whatsappNormalizado,
    };

    const lojaUpdatePromise = supabase
      .from("lojas")
      .update(lojaPayload)
      .eq("id", loja?.id)
      .select("id, nome, whatsapp, created_at, updated_at")
      .single();

    const { data: lojaData, error: lojaError } = await Promise.race([lojaUpdatePromise, timeoutPromise]);
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
      logradouro: form.address.logradouro || null,
      numero: form.address.numero || null,
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
        .from("categorias")
        .select("id, nome")
        .in("nome", form.categories);

      const { data: categoriasExistentesData, error: categoriasExistentesError } = await Promise.race([categoriasExistentesPromise, timeoutPromise]);
      console.log('saveStoreProfile: Categorias existentes encontradas:', categoriasExistentesData, 'error:', categoriasExistentesError);

      if (categoriasExistentesError) {
        console.error('saveStoreProfile: Erro ao validar categorias:', categoriasExistentesError);
        return { ok: false, error: categoriasExistentesError.message };
      }

      categoriasExistentes = categoriasExistentesData || [];

      // Verificar se todas as categorias solicitadas existem
      const nomesExistentes = categoriasExistentes?.map((cat: any) => cat.nome) || [];
      const categoriasInvalidas = form.categories.filter(nome => !nomesExistentes.includes(nome));
      
      if (categoriasInvalidas.length > 0) {
        console.error('saveStoreProfile: Categorias inválidas:', categoriasInvalidas);
        return { ok: false, error: "Categoria inválida" };
      }
    }

    // Buscar categorias atuais da loja
    console.log('saveStoreProfile: Buscando categorias atuais da loja...');
    const categoriasAtuaisPromise = supabase
      .from("lojas_categorias")
      .select("categoria_id")
      .eq("loja_id", lojaId);

    const { data: categoriasAtuais, error: categoriasAtuaisError } = await Promise.race([categoriasAtuaisPromise, timeoutPromise]);
    console.log('saveStoreProfile: Categorias atuais da loja:', categoriasAtuais, 'error:', categoriasAtuaisError);

    if (categoriasAtuaisError) {
      console.error('saveStoreProfile: Erro ao carregar categorias atuais:', categoriasAtuaisError);
      return { ok: false, error: categoriasAtuaisError.message };
    }

    // Calcular toAdd/toRemove
    const categoriasAtuaisIds = categoriasAtuais?.map((item: any) => item.categoria_id) || [];
    const categoriasSolicitadasIds = categoriasExistentes?.map((cat: any) => cat.id) || [];
    
    const toAdd = categoriasSolicitadasIds.filter((id: any) => !categoriasAtuaisIds.includes(id));
    const toRemove = categoriasAtuaisIds.filter((id: any) => !categoriasSolicitadasIds.includes(id));

    console.log('saveStoreProfile: Categorias para adicionar:', toAdd);
    console.log('saveStoreProfile: Categorias para remover:', toRemove);

    // Adicionar novas relações
    if (toAdd.length > 0) {
      console.log('saveStoreProfile: Adicionando novas relações...');
      const toAddData = toAdd.map((categoryId: any) => ({ loja_id: lojaId, categoria_id: categoryId }));
      
      const insertPromise = supabase
        .from("lojas_categorias")
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
        .from("lojas_categorias")
        .delete()
        .eq("loja_id", lojaId)
        .in("categoria_id", toRemove);

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
      .from("lojas_v")
      .select(`
        id, 
        nome, 
        whatsapp,
        cidade,
        uf,
        lojas_endereco (
          cep, 
          logradouro, 
          numero, 
          bairro, 
          cidade, 
          uf, 
          complemento
        ),
        lojas_categorias (
          categorias (
            nome
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
    const categorias = loja.lojas_categorias || [];
    
    console.log('loadStoreProfile: Endereço extraído:', endereco);
    console.log('loadStoreProfile: Categorias extraídas:', categorias);

    // Extrair nomes das categorias
    const categoryNames = categorias?.map((item: any) => item.categorias?.nome).filter(Boolean) || [];

    const result: { ok: true; data: StoreProfileData } = {
      ok: true,
      data: {
        name: loja.nome || '',
        whatsapp: loja.whatsapp || '',
        categories: categoryNames,
        address: {
          cep: (endereco as any)?.cep || '',
          logradouro: (endereco as any)?.logradouro || '',
          numero: (endereco as any)?.numero || '',
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
