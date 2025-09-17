import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, MapPin, MessageCircle, Loader2, Tag } from 'lucide-react';
import { PhoneInput } from '../ui';
import { saveStoreProfile, loadStoreProfile } from '../../services/StoreService';
import { useAuthContext } from '../../hooks/useAuth'; // alias de useAuth

export const StoreProfileForm: React.FC = () => {
  const { user, isConfigured, setHasLoja } = useAuthContext();

  const [profile, setProfile] = useState({
    name: '',
    categories: [] as string[],
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: 'Ariquemes',
    state: 'RO',
    whatsapp: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // categorias
  const availableCategories = [
    'Casa e Construção','Automotivo','Moda e Vestuário','Eletrônicos e Informática',
    'Saúde e Beleza','Supermercado e Alimentos','Pet Shop','Livraria e Papelaria','Casa e Decoração'
  ];

  useEffect(() => {
    if (user && isConfigured) loadProfile();
  }, [user, isConfigured]);

  async function loadProfile() {
    if (!user) {
      console.log('StoreProfileForm.loadProfile: Sem usuário, cancelando...');
      return;
    }
    
    console.log('StoreProfileForm.loadProfile: Carregando perfil para user:', user.id);
    try {
      const result = await loadStoreProfile();
      console.log('StoreProfileForm.loadProfile: Resultado recebido:', result);
      
      if (result.ok && 'data' in result) {
        const data = result.data;
        setProfile({
          name: data.name || '',
          categories: data.categories || [],
          cep: data.address?.cep || '',
          street: data.address?.street || '',
          number: data.address?.number || '',
          neighborhood: data.address?.bairro || '',
          city: data.address?.cidade || 'Ariquemes',
          state: data.address?.uf || 'RO',
          whatsapp: data.whatsapp || '',
        });
        setSelectedCategories(data.categories || []);
        console.log('StoreProfileForm.loadProfile: Perfil carregado com sucesso');
      } else {
        console.log('StoreProfileForm.loadProfile: Nenhum perfil encontrado (primeira vez)');
      }
    } catch (err) {
      console.error('StoreProfileForm.loadProfile: Erro ao carregar perfil:', err);
    }
  }

  async function searchCep(cep: string) {
    if (cep.length !== 8) return;
    setIsCepLoading(true);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();
      if (!data.erro) {
        setProfile((prev) => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || 'Ariquemes',
          state: data.uf || 'RO',
        }));
      }
    } catch (e) {
      console.error('Erro ao buscar CEP:', e);
    } finally {
      setIsCepLoading(false);
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    const limitedCep = cep.slice(0, 8); // Limitar a 8 dígitos
    
    // Aplicar máscara visual: 00000-000
    let formatted = limitedCep;
    if (limitedCep.length > 5) {
      formatted = `${limitedCep.slice(0, 5)}-${limitedCep.slice(5)}`;
    }
    
    setProfile(prev => ({ ...prev, cep: formatted }));
    if (limitedCep.length === 8) searchCep(limitedCep);
  };


  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('StoreProfileForm.handleSubmit: INICIANDO SUBMIT');
    setMessage(null);

    // bloqueia se não estiver configurado ou sem usuário
    if (!isConfigured || !user) {
      console.error('StoreProfileForm.handleSubmit: Não configurado ou sem usuário', { isConfigured, user: !!user });
      setMessage({ type: 'error', text: 'Autenticação/Supabase não configurado. Faça login e tente novamente.' });
      return;
    }

    // Validar WhatsApp (11 dígitos)
    const whatsappDigits = profile.whatsapp?.replace(/\D/g, '') || '';
    if (whatsappDigits && !/^\d{11}$/.test(whatsappDigits)) {
      setMessage({ type: 'error', text: 'Informe DDD + número com 11 dígitos' });
      return;
    }

    console.log('StoreProfileForm.handleSubmit: Validações passaram, iniciando salvamento...');
    setIsSaving(true);
    try {
      const formPayload = {
        name: profile.name,
        categories: selectedCategories,
        whatsapp: whatsappDigits || undefined, // Enviar apenas dígitos ou undefined
        address: {
          cep: profile.cep,
          street: profile.street,
          number: profile.number,
          bairro: profile.neighborhood,
          cidade: profile.city,
          uf: profile.state,
          complemento: '', // não temos campo para complemento ainda
        }
      };

      console.log('StoreProfileForm.handleSubmit: Payload preparado:', formPayload);

      console.log('StoreProfileForm.handleSubmit: Chamando saveStoreProfile...');
      const res = await saveStoreProfile(formPayload);
      console.log('StoreProfileForm.handleSubmit: Resultado do saveStoreProfile:', res);

      if (!res.ok) {
        console.error('StoreProfileForm.handleSubmit: Erro ao salvar:', res.error);
        setMessage({ type: 'error', text: `Erro ao salvar: ${res.error}` });
        return;
      }

      console.log('StoreProfileForm.handleSubmit: Salvamento concluído, atualizando estado...');
      setHasLoja(true);
      setMessage({ type: 'success', text: 'Perfil salvo com sucesso!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('StoreProfileForm.handleSubmit: SUBMIT CONCLUÍDO COM SUCESSO');
    } catch (err) {
      console.error('StoreProfileForm.handleSubmit: ERRO NO SUBMIT:', err);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <div className="p-4 rounded-lg border bg-yellow-50 text-yellow-800">
          Supabase não configurado. Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
        </div>
      )}

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
        {/* Card 1: Informações */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Store className="w-6 h-6 text-emerald-600" /><h2 className="text-xl font-semibold text-gray-900">Sua Loja</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome da Loja *</label>
              <input 
                id="name" 
                name="name" 
                type="text"
                value={profile.name ?? ''} 
                onChange={handleChange} 
                required
                autoComplete="organization"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">Categorias da sua Loja*</label>
              </div>
              <p className="text-xs text-gray-500 mb-3">Selecione suas categorias. Isso melhora seus insights no dashboard.</p>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableCategories.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-50">
                      <input type="checkbox"
                             checked={selectedCategories.includes(category)}
                             onChange={() => handleCategoryToggle(category)}
                             className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Endereço */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-emerald-600" /><h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">CEP *</label>
              <div className="relative">
                <input 
                  id="cep" 
                  name="cep" 
                  type="text"
                  inputMode="numeric"
                  value={profile.cep ?? ''} 
                  onChange={handleCepChange} 
                  maxLength={9} 
                  required
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                />
                {isCepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">Rua/Avenida *</label>
              <input 
                id="street" 
                name="street" 
                type="text"
                value={profile.street ?? ''} 
                onChange={handleChange} 
                required
                autoComplete="address-line1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
              <input 
                id="number" 
                name="number" 
                type="text"
                inputMode="numeric"
                value={profile.number ?? ''} 
                onChange={handleChange} 
                required
                autoComplete="address-line2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div className="sm:col-span-1 lg:col-span-2">
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
              <input 
                id="neighborhood" 
                name="neighborhood" 
                type="text"
                value={profile.neighborhood ?? ''} 
                onChange={handleChange} 
                required
                autoComplete="address-level2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input 
                id="city" 
                name="city" 
                type="text"
                value={profile.city ?? 'Ariquemes'}
                autoComplete="address-level1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" 
                readOnly 
              />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Contato */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-emerald-600" /><h2 className="text-xl font-semibold text-gray-900">Contato</h2>
          </div>
          <div className="max-w-md">
            <PhoneInput
              value={profile.whatsapp ?? ''}
              onChange={(value) => setProfile(prev => ({ ...prev, whatsapp: value }))}
              placeholder="(69) 99999-9999"
              label="WhatsApp"
              required
              id="whatsapp"
              name="whatsapp"
            />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-end">
          <button type="submit" disabled={isSaving}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-3 text-lg shadow-lg">
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            {isSaving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </motion.div>
      </form>
    </div>
  );
};
