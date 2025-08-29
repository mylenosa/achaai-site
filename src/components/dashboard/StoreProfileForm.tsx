import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Phone, Clock, MapPin } from 'lucide-react';
import { storeService, StoreProfile } from '../../services/StoreService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/useAuth';

export const StoreProfileForm: React.FC = () => {
  const [profile, setProfile] = useState<StoreProfile>({
    id: '',
    name: '',
    description: '',
    phone: '',
    address: '',
    opening_hours: '',
    user_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { user, isConfigured } = useAuthContext();

  useEffect(() => {
    if (user && isConfigured && isSupabaseConfigured()) {
      loadProfile();
    }
  }, [user, isConfigured]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const data = await storeService.getProfile(user.id);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isConfigured || !isSupabaseConfigured()) {
      setMessage({ type: 'error', text: 'Supabase não configurado' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);

    try {
      const profileData = {
        ...profile,
        user_id: user.id
      };

      if (profile.id) {
        await storeService.updateProfile(profile.id, profileData);
      } else {
        const newProfile = await storeService.createProfile(profileData);
        setProfile(newProfile);
      }

      setMessage({ type: 'success', text: 'Perfil salvo com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <Store className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Perfil da Loja</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Loja
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite o nome da sua loja"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={profile.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva sua loja e produtos"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Horário de Funcionamento
            </label>
            <input
              type="text"
              id="opening_hours"
              name="opening_hours"
              value={profile.opening_hours}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Seg-Sex: 9h-18h"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Endereço
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={profile.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rua, número, bairro, cidade"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-5 h-5" />
          {isLoading ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </motion.div>
  );
};