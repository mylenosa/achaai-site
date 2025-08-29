// Single Responsibility: Serviço para operações de loja
// Dependency Inversion: Usa cliente Supabase injetado
import { supabase } from '../lib/supabase';

export interface StoreProfile {
  id: string;
  name: string;
  phone: string;
  hours: string;
  maps_url: string;
  user_id: string;
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

  async createProfile(profile: Omit<StoreProfile, 'id' | 'created_at' | 'updated_at'>): Promise<StoreProfile> {
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

  async updateProfile(userId: string, updates: Partial<Pick<StoreProfile, 'name' | 'phone' | 'hours' | 'maps_url'>>): Promise<StoreProfile> {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    const { data, error } = await supabase
      .from('store_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
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