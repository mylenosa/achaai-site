import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  RotateCcw, 
  Store, 
  MapPin, 
  Phone,
  CheckCircle,
  X
} from 'lucide-react';

interface StoreProfile {
  nomeLoja: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  whatsapp: string; // Stored as "55" + national digits
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const initialProfile: StoreProfile = {
  nomeLoja: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: 'Ariquemes',
  estado: 'RO',
  whatsapp: ''
};

export const PerfilPage: React.FC = () => {
  const [profile, setProfile] = useState<StoreProfile>(initialProfile);
  const [whatsappInput, setWhatsappInput] = useState(''); // National digits only for display
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('storeProfile');
    if (saved) {
      try {
        const savedProfile = JSON.parse(saved);
        setProfile(savedProfile);
        // Extract national digits from stored whatsapp (remove "55" prefix)
        if (savedProfile.whatsapp && savedProfile.whatsapp.startsWith('55')) {
          setWhatsappInput(savedProfile.whatsapp.substring(2));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  // Helper functions
  const onlyDigits = (s: string): string => s.replace(/\D/g, '');

  // Toast management
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Validation
  const validateForm = (): boolean => {
    const nacionalDigits = onlyDigits(whatsappInput);
    
    return (
      profile.nomeLoja.trim().length >= 2 &&
      /^\d{8}$/.test(profile.cep) &&
      profile.rua.trim().length > 0 &&
      profile.numero.trim().length > 0 &&
      profile.bairro.trim().length > 0 &&
      nacionalDigits.length >= 10 &&
      nacionalDigits.length <= 11
    );
  };

  const isFormValid = validateForm();

  // Handlers
  const handleInputChange = (field: keyof StoreProfile, value: string) => {
    if (field === 'cep') {
      // Only allow digits for CEP, max 8
      const digits = onlyDigits(value);
      if (digits.length <= 8) {
        setProfile(prev => ({ ...prev, [field]: digits }));
      }
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleWhatsappChange = (value: string) => {
    const digits = onlyDigits(value);
    // Limit to 11 digits (max for Brazilian mobile)
    if (digits.length <= 11) {
      setWhatsappInput(digits);
    }
  };

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    
    try {
      const nacionalDigits = onlyDigits(whatsappInput);
      const fullWhatsapp = '55' + nacionalDigits;
      
      const profileToSave = {
        ...profile,
        whatsapp: fullWhatsapp
      };

      // Save to localStorage
      localStorage.setItem('storeProfile', JSON.stringify(profileToSave));
      setProfile(profileToSave);
      
      addToast({ type: 'success', message: 'Perfil salvo com sucesso!' });
    } catch (error) {
      addToast({ type: 'error', message: 'Erro ao salvar perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setProfile(initialProfile);
    setWhatsappInput('');
  };

  // Format WhatsApp for display (add spacing)
  const formatWhatsappDisplay = (digits: string): string => {
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Perfil da Loja</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Configure as informações básicas da sua loja
        </p>
      </div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`p-4 rounded-lg shadow-lg border max-w-sm flex items-center gap-3 ${
              toast.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
      >
        <div className="space-y-6">
          {/* Store Info Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Informações da Loja</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="nomeLoja" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Loja *
                </label>
                <input
                  type="text"
                  id="nomeLoja"
                  value={profile.nomeLoja}
                  onChange={(e) => handleInputChange('nomeLoja', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                    profile.nomeLoja.trim().length >= 2 || profile.nomeLoja === ''
                      ? 'border-gray-300' 
                      : 'border-red-300 bg-red-50'
                  }`}
                  placeholder="Digite o nome da sua loja"
                />
                {profile.nomeLoja.trim().length > 0 && profile.nomeLoja.trim().length < 2 && (
                  <p className="text-red-600 text-sm mt-1">Nome deve ter pelo menos 2 caracteres</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Endereço</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  id="cep"
                  value={profile.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                    /^\d{8}$/.test(profile.cep) || profile.cep === ''
                      ? 'border-gray-300' 
                      : 'border-red-300 bg-red-50'
                  }`}
                  placeholder="00000000"
                  maxLength={8}
                />
                {profile.cep.length > 0 && !/^\d{8}$/.test(profile.cep) && (
                  <p className="text-red-600 text-sm mt-1">CEP deve ter 8 dígitos</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="rua" className="block text-sm font-medium text-gray-700 mb-2">
                  Rua *
                </label>
                <input
                  type="text"
                  id="rua"
                  value={profile.rua}
                  onChange={(e) => handleInputChange('rua', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                    profile.rua.trim().length > 0 || profile.rua === ''
                      ? 'border-gray-300' 
                      : 'border-red-300 bg-red-50'
                  }`}
                  placeholder="Nome da rua"
                />
              </div>

              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  id="numero"
                  value={profile.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                    profile.numero.trim().length > 0 || profile.numero === ''
                      ? 'border-gray-300' 
                      : 'border-red-300 bg-red-50'
                  }`}
                  placeholder="123"
                />
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  id="bairro"
                  value={profile.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                    profile.bairro.trim().length > 0 || profile.bairro === ''
                      ? 'border-gray-300' 
                      : 'border-red-300 bg-red-50'
                  }`}
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  id="cidade"
                  value={profile.cidade}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <input
                  type="text"
                  id="estado"
                  value={profile.estado}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Phone className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Contato</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-base">+55</span>
                  </div>
                  <input
                    type="text"
                    id="whatsapp"
                    value={formatWhatsappDisplay(whatsappInput)}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      (whatsappInput.length >= 10 && whatsappInput.length <= 11) || whatsappInput === ''
                        ? 'border-gray-300' 
                        : 'border-red-300 bg-red-50'
                    }`}
                    placeholder="69 99999-9999"
                  />
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  WhatsApp só números (DDD + número)
                </p>
                {whatsappInput.length > 0 && (whatsappInput.length < 10 || whatsappInput.length > 11) && (
                  <p className="text-red-600 text-sm mt-1">
                    WhatsApp deve ter 10-11 dígitos (DDD + número)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={!isFormValid || isLoading}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>

            <button
              onClick={handleClear}
              className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Limpar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};