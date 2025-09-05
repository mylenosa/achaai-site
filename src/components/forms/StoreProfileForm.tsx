// Single Responsibility: Componente específico para formulário de perfil da loja
// Interface Segregation: Props específicas e enxutas
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  RotateCcw, 
  Store, 
  MapPin, 
  Phone,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { useAddress } from '../../hooks/useAddress';

export interface StoreProfile {
  nomeLoja: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  whatsapp: string;
}

interface StoreProfileFormProps {
  initialProfile?: Partial<StoreProfile>;
  onSave: (profile: StoreProfile) => Promise<void>;
  onClear?: () => void;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const defaultProfile: StoreProfile = {
  nomeLoja: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: 'Ariquemes',
  estado: 'RO',
  whatsapp: ''
};

// Open/Closed: Extensível para diferentes tipos de validação
class StoreProfileValidator {
  static validateNomeLoja(nome: string): boolean {
    return nome.trim().length >= 2;
  }

  static validateCep(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  static validateWhatsapp(whatsapp: string): boolean {
    const digits = whatsapp.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }

  static validateRequired(value: string): boolean {
    return value.trim().length > 0;
  }

  static validateProfile(profile: StoreProfile, whatsappInput: string): boolean {
    return (
      this.validateNomeLoja(profile.nomeLoja) &&
      this.validateCep(profile.cep) &&
      this.validateRequired(profile.rua) &&
      this.validateRequired(profile.numero) &&
      this.validateRequired(profile.bairro) &&
      this.validateWhatsapp(whatsappInput)
    );
  }
}

// Single Responsibility: Formatação de WhatsApp
class WhatsAppFormatter {
  static onlyDigits(s: string): string {
    return s.replace(/\D/g, '');
  }

  static formatDisplay(digits: string): string {
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  static toStorageFormat(nationalDigits: string): string {
    return '55' + nationalDigits;
  }

  static fromStorageFormat(fullWhatsapp: string): string {
    return fullWhatsapp.startsWith('55') ? fullWhatsapp.substring(2) : fullWhatsapp;
  }
}

export const StoreProfileForm: React.FC<StoreProfileFormProps> = ({
  initialProfile = {},
  onSave,
  onClear
}) => {
  const [profile, setProfile] = useState<StoreProfile>({ ...defaultProfile, ...initialProfile });
  const [whatsappInput, setWhatsappInput] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { searchByCep, isLoading: isCepLoading } = useAddress();

  // Initialize WhatsApp input from profile
  useEffect(() => {
    if (profile.whatsapp) {
      const nationalDigits = WhatsAppFormatter.fromStorageFormat(profile.whatsapp);
      setWhatsappInput(nationalDigits);
    }
  }, [profile.whatsapp]);

  // Toast management
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Form validation
  const isFormValid = StoreProfileValidator.validateProfile(profile, whatsappInput);

  // Handlers
  const handleInputChange = async (field: keyof StoreProfile, value: string) => {
    if (field === 'cep') {
      const digits = WhatsAppFormatter.onlyDigits(value);
      if (digits.length <= 8) {
        setProfile(prev => ({ ...prev, [field]: digits }));
        
        // Auto-search when CEP is complete
        if (digits.length === 8) {
          const addressData = await searchByCep(digits);
          if (addressData) {
            setProfile(prev => ({
              ...prev,
              rua: addressData.street,
              bairro: addressData.neighborhood,
              cidade: addressData.city || 'Ariquemes',
              estado: addressData.state || 'RO'
            }));
          }
        }
      }
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleWhatsappChange = (value: string) => {
    const digits = WhatsAppFormatter.onlyDigits(value);
    if (digits.length <= 11) {
      setWhatsappInput(digits);
    }
  };

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    
    try {
      const nationalDigits = WhatsAppFormatter.onlyDigits(whatsappInput);
      const fullWhatsapp = WhatsAppFormatter.toStorageFormat(nationalDigits);
      
      const profileToSave = {
        ...profile,
        whatsapp: fullWhatsapp
      };

      await onSave(profileToSave);
      addToast({ type: 'success', message: 'Perfil salvo com sucesso!' });
    } catch (error) {
      addToast({ type: 'error', message: 'Erro ao salvar perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setProfile(defaultProfile);
    setWhatsappInput('');
    onClear?.();
  };

  return (
    <div className="space-y-6">
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
                    StoreProfileValidator.validateNomeLoja(profile.nomeLoja) || profile.nomeLoja === ''
                      ? 'border-gray-300' 
                      : 'border-red-300 bg-red-50'
                  }`}
                  placeholder="Digite o nome da sua loja"
                />
                {profile.nomeLoja.trim().length > 0 && !StoreProfileValidator.validateNomeLoja(profile.nomeLoja) && (
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
                <div className="relative">
                  <input
                    type="text"
                    id="cep"
                    value={profile.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      StoreProfileValidator.validateCep(profile.cep) || profile.cep === ''
                        ? 'border-gray-300' 
                        : 'border-red-300 bg-red-50'
                    }`}
                    placeholder="00000000"
                    maxLength={8}
                  />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>
                {profile.cep.length > 0 && !StoreProfileValidator.validateCep(profile.cep) && (
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
                    StoreProfileValidator.validateRequired(profile.rua) || profile.rua === ''
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
                    StoreProfileValidator.validateRequired(profile.numero) || profile.numero === ''
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
                    StoreProfileValidator.validateRequired(profile.bairro) || profile.bairro === ''
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
                    value={WhatsAppFormatter.formatDisplay(whatsappInput)}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      StoreProfileValidator.validateWhatsapp(whatsappInput) || whatsappInput === ''
                        ? 'border-gray-300' 
                        : 'border-red-300 bg-red-50'
                    }`}
                    placeholder="69 99999-9999"
                  />
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  WhatsApp só números (DDD + número)
                </p>
                {whatsappInput.length > 0 && !StoreProfileValidator.validateWhatsapp(whatsappInput) && (
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