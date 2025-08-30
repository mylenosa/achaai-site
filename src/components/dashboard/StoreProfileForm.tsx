import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Store, 
  Phone, 
  Clock, 
  MapPin, 
  Tag,
  Instagram,
  Facebook,
  MessageCircle,
  Search,
  Loader2
} from 'lucide-react';
import { storeService, StoreProfile } from '../../services/StoreService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useAuthContext } from '../../hooks/useAuth';

interface WeekDay {
  id: string;
  name: string;
  shortName: string;
}

interface DaySchedule {
  isOpen: boolean;
  schedules: {
    openTime: string;
    closeTime: string;
  }[];
}

type WeekSchedule = Record<string, DaySchedule>;

export const StoreProfileForm: React.FC = () => {
  const [profile, setProfile] = useState<StoreProfile>({
    id: '',
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    categories: [],
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: 'Ariquemes',
    state: 'RO',
    address: '',
    opening_hours: '',
    user_id: ''
  });

  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { isOpen: true, schedules: [{ openTime: '08:00', closeTime: '18:00' }] },
    tuesday: { isOpen: true, schedules: [{ openTime: '08:00', closeTime: '18:00' }] },
    wednesday: { isOpen: true, schedules: [{ openTime: '08:00', closeTime: '18:00' }] },
    thursday: { isOpen: true, schedules: [{ openTime: '08:00', closeTime: '18:00' }] },
    friday: { isOpen: true, schedules: [{ openTime: '08:00', closeTime: '18:00' }] },
    saturday: { isOpen: true, schedules: [{ openTime: '08:00', closeTime: '12:00' }] },
    sunday: { isOpen: false, schedules: [{ openTime: '08:00', closeTime: '18:00' }] }
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { user, isConfigured } = useAuthContext();

  const weekDays: WeekDay[] = [
    { id: 'monday', name: 'Segunda-feira', shortName: 'Seg' },
    { id: 'tuesday', name: 'Terça-feira', shortName: 'Ter' },
    { id: 'wednesday', name: 'Quarta-feira', shortName: 'Qua' },
    { id: 'thursday', name: 'Quinta-feira', shortName: 'Qui' },
    { id: 'friday', name: 'Sexta-feira', shortName: 'Sex' },
    { id: 'saturday', name: 'Sábado', shortName: 'Sáb' },
    { id: 'sunday', name: 'Domingo', shortName: 'Dom' }
  ];

  const availableCategories = [
    'Ferramentas', 'Tintas', 'Materiais de Construção', 'Elétrica', 
    'Hidráulica', 'Jardinagem', 'Automotivo', 'Casa e Decoração',
    'Roupas', 'Calçados', 'Eletrônicos', 'Informática', 'Celulares',
    'Farmácia', 'Cosméticos', 'Alimentação', 'Bebidas', 'Padaria',
    'Açougue', 'Hortifruti', 'Pet Shop', 'Livraria', 'Papelaria'
  ];

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
        setSelectedCategories(data.categories || []);
        
        // Carregar horários se existirem
        if (data.opening_hours) {
          try {
            const parsedSchedule = JSON.parse(data.opening_hours);
            // Migrar formato antigo para novo se necessário
            const migratedSchedule: WeekSchedule = {};
            Object.keys(parsedSchedule).forEach(day => {
              const dayData = parsedSchedule[day];
              if (dayData.openTime && dayData.closeTime) {
                // Formato antigo - migrar
                migratedSchedule[day] = {
                  isOpen: dayData.isOpen,
                  schedules: [{ openTime: dayData.openTime, closeTime: dayData.closeTime }]
                };
              } else {
                // Formato novo
                migratedSchedule[day] = dayData;
              }
            });
            setSchedule({ ...schedule, ...migratedSchedule });
          } catch (e) {
            console.log('Erro ao parsear horários, usando padrão');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const searchCep = async (cep: string) => {
    if (cep.length !== 8) return;
    
    setIsCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setProfile(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || 'Ariquemes',
          state: data.uf || 'RO'
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsCepLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setProfile(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
      searchCep(cep);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '');
    const formatted = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    setProfile(prev => ({ ...prev, phone: formatted }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const whatsapp = e.target.value.replace(/\D/g, '');
    const formatted = whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    setProfile(prev => ({ ...prev, whatsapp: formatted }));
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleScheduleChange = (dayId: string, field: keyof DaySchedule, value: boolean | string) => {
    if (field === 'isOpen') {
      setSchedule(prev => ({
        ...prev,
        [dayId]: {
          ...prev[dayId],
          [field]: value as boolean
        }
      }));
    }
  };

  const handleTimeChange = (dayId: string, scheduleIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        schedules: prev[dayId].schedules.map((schedule, index) =>
          index === scheduleIndex ? { ...schedule, [field]: value } : schedule
        )
      }
    }));
  };

  const addSchedule = (dayId: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        schedules: [...prev[dayId].schedules, { openTime: '14:00', closeTime: '18:00' }]
      }
    }));
  };

  const removeSchedule = (dayId: string, scheduleIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        schedules: prev[dayId].schedules.filter((_, index) => index !== scheduleIndex)
      }
    }));
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
      const fullAddress = `${profile.street}, ${profile.number} - ${profile.neighborhood}, ${profile.city}/${profile.state}`;
      
      const profileData = {
        ...profile,
        categories: selectedCategories,
        address: fullAddress,
        opening_hours: JSON.stringify(schedule),
        user_id: user.id
      };

      if (profile.id) {
        await storeService.updateProfile(profile.id, profileData);
      } else {
        const newProfile = await storeService.createProfile(profileData);
        setProfile(newProfile);
      }

      setMessage({ type: 'success', text: 'Perfil salvo com sucesso!' });
      
      // Scroll para o topo para mostrar a mensagem
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Perfil da Loja</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Mantenha as informações da sua loja sempre atualizadas</p>
      </div>

      {/* Mensagem de Feedback */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Store className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Informações Básicas</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Loja *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="Digite o nome da sua loja"
              />
            </div>

            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-2">
                Categorias/Tags
              </label>
              <div className="border border-gray-300 rounded-lg p-2 sm:p-3 max-h-32 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                  {availableCategories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer p-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selecione as categorias que melhor descrevem sua loja
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Loja
            </label>
            <textarea
              id="description"
              name="description"
              value={profile.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base resize-none"
              placeholder="Descreva sua loja, produtos principais e diferenciais..."
            />
          </div>
        </motion.div>

        {/* Endereço */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <MapPin className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Endereço</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                CEP *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cep"
                  name="cep"
                  value={profile.cep}
                  onChange={handleCepChange}
                  maxLength={8}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  placeholder="00000000"
                />
                {isCepLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Rua/Avenida *
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={profile.street}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="Nome da rua ou avenida"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                Número *
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={profile.number}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="123"
              />
            </div>

            <div className="sm:col-span-1 lg:col-span-2">
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                Bairro *
              </label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={profile.neighborhood}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="Nome do bairro"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={profile.city}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
                readOnly
              />
            </div>
          </div>
        </motion.div>

        {/* Horário de Funcionamento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Clock className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Horário de Funcionamento</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {weekDays.map(day => (
              <div key={day.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <div className="w-full sm:w-20 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-700">
                      <span className="sm:hidden">{day.name}</span>
                      <span className="hidden sm:inline">{day.shortName}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={schedule[day.id].isOpen}
                        onChange={(e) => handleScheduleChange(day.id, 'isOpen', e.target.checked)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700">Aberto</span>
                    </label>
                  </div>

                  <div className="flex-1">
                    {schedule[day.id].isOpen ? (
                      <div className="space-y-2">
                        {schedule[day.id].schedules.map((timeSlot, index) => (
                          <div key={index} className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <input
                              type="time"
                              value={timeSlot.openTime}
                              onChange={(e) => handleTimeChange(day.id, index, 'openTime', e.target.value)}
                              className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                            />
                            <span className="text-gray-500 text-xs sm:text-sm">às</span>
                            <input
                              type="time"
                              value={timeSlot.closeTime}
                              onChange={(e) => handleTimeChange(day.id, index, 'closeTime', e.target.value)}
                              className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                            />
                            {schedule[day.id].schedules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSchedule(day.id, index)}
                                className="text-red-500 hover:text-red-700 text-xs sm:text-sm px-1 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label="Remover horário"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {schedule[day.id].schedules.length < 3 && (
                          <button
                            type="button"
                            onClick={() => addSchedule(day.id)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1 py-1"
                          >
                            + Adicionar horário
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-500 italic">Fechado</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contatos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Phone className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Contatos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone Fixo
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handlePhoneChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="(69) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                WhatsApp *
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={profile.whatsapp}
                onChange={handleWhatsAppChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="(69) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram className="w-4 h-4 inline mr-1" />
                Instagram
              </label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={profile.instagram}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="@sualojainstagram"
              />
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook className="w-4 h-4 inline mr-1" />
                Facebook
              </label>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={profile.facebook}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="facebook.com/sualoja"
              />
            </div>
          </div>
        </motion.div>

        {/* Botão Salvar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center sm:justify-end"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </motion.div>
      </form>
    </div>
  );
};
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={profile.whatsapp}
                onChange={handleWhatsAppChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="(69) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram className="w-4 h-4 inline mr-1" />
                Instagram
              </label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={profile.instagram}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="@sualojainstagram"
              />
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook className="w-4 h-4 inline mr-1" />
                Facebook
              </label>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={profile.facebook}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="facebook.com/sualoja"
              />
            </div>
          </div>
        </motion.div>

        {/* Botão Salvar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center sm:justify-end"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </motion.div>
      </form>
    </div>
  );
};
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule[day.id].isOpen}
                      onChange={(e) => handleScheduleChange(day.id, 'isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-700">Aberto</span>
                  </label>
                </div>

                {schedule[day.id].isOpen && (
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <input
                      type="time"
                      value={schedule[day.id].openTime}
                      onChange={(e) => handleScheduleChange(day.id, 'openTime', e.target.value)}
                      className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                    />
                    <span className="text-gray-500 text-xs sm:text-sm">às</span>
                    <input
                      type="time"
                      value={schedule[day.id].closeTime}
                      onChange={(e) => handleScheduleChange(day.id, 'closeTime', e.target.value)}
                      className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                    />
                  </div>
                )}

                {!schedule[day.id].isOpen && (
                  <span className="text-xs sm:text-sm text-gray-500 italic">Fechado</span>
                )}
              </div>
                  
                  <div className="flex-1 mt-2 sm:mt-0">
                    {schedule[day.id].isOpen ? (
                      <div className="space-y-2">
                        {schedule[day.id].schedules.map((timeSlot, index) => (
                          <div key={index} className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <input
                              type="time"
                              value={timeSlot.openTime}
                              onChange={(e) => handleTimeChange(day.id, index, 'openTime', e.target.value)}
                              className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                            />
                            <span className="text-gray-500 text-xs sm:text-sm">às</span>
                            <input
                              type="time"
                              value={timeSlot.closeTime}
                              onChange={(e) => handleTimeChange(day.id, index, 'closeTime', e.target.value)}
                              className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                            />
                            {schedule[day.id].schedules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSchedule(day.id, index)}
                                className="text-red-500 hover:text-red-700 text-xs sm:text-sm px-1 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 ml-1"
                                aria-label="Remover horário"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {schedule[day.id].schedules.length < 3 && (
                          <button
                            type="button"
                            onClick={() => addSchedule(day.id)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1 py-1 mt-1"
                          >
                            + Adicionar horário
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-500 italic">Fechado</span>
                    )}
                  </div>
                </div>
              </div>
                  <span className="text-sm font-medium text-gray-700">
                    <span className="sm:hidden">{day.name}</span>
                    <span className="hidden sm:inline">{day.shortName}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule[day.id].isOpen}
                      onChange={(e) => handleScheduleChange(day.id, 'isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-700">Aberto</span>
                  </label>
                </div>

                {schedule[day.id].isOpen && (
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <input
                      type="time"
                      value={schedule[day.id].openTime}
                      onChange={(e) => handleScheduleChange(day.id, 'openTime', e.target.value)}
                      className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                    />
                    <span className="text-gray-500 text-xs sm:text-sm">às</span>
                    <input
                      type="time"
                      value={schedule[day.id].closeTime}
                      onChange={(e) => handleScheduleChange(day.id, 'closeTime', e.target.value)}
                      className="px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-20 sm:w-auto"
                    />
                  </div>
                )}

                {!schedule[day.id].isOpen && (
                  <span className="text-xs sm:text-sm text-gray-500 italic">Fechado</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contatos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Phone className="w-6 h-6 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Contatos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefone Fixo
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handlePhoneChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="(69) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                WhatsApp *
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={profile.whatsapp}
                onChange={handleWhatsAppChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="(69) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram className="w-4 h-4 inline mr-1" />
                Instagram
              </label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={profile.instagram}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="@sualojainstagram"
              />
            </div>

            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook className="w-4 h-4 inline mr-1" />
                Facebook
              </label>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={profile.facebook}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm sm:text-base"
                placeholder="facebook.com/sualoja"
              />
            </div>
          </div>
        </motion.div>

        {/* Botão Salvar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center sm:justify-end"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </motion.div>
      </form>
    </div>
  );
};