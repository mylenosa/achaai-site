// src/services/StoreService.ts
// Single Responsibility: Serviço para operações de loja
// Dependency Inversion: Usa cliente Supabase injetado
import { supabase } from '../lib/supabase';

export interface StoreProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string; // TORNADO OPCIONAL
  whatsapp: string;
  categories: string[];
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  address: string;
  opening_hours?: string; // TORNADO OPCIONAL
  created_at: string;
  updated_at: string;
}

export class StoreService {
  // Interface Segregation: Métodos específicos para perfil da loja
  
  async getProfile(userId: string): Promise<StoreProfile | null> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { data, error } = await supabase
      .from('store_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Perfil não encontrado - retornar null
        return null;
      }
      throw error;
    }

    return data;
  }

  async createProfile(profile: Partial<StoreProfile>): Promise<StoreProfile> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { data, error } = await supabase
      .from('store_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateProfile(profileId: string, updates: Partial<StoreProfile>): Promise<StoreProfile> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { data, error } = await supabase
      .from('store_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

// Singleton pattern para o serviço
export const storeService = new StoreService();