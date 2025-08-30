import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Search, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { config } from '../lib/config';

export const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState('');
  const [confirmPasswordErrors, setConfirmPasswordErrors] = useState('');

  const { updatePassword, isConfigured } = useAuthContext();

  useEffect(() => {
    // Verificar se estamos em uma sessão de recuperação de senha
    const checkRecoverySession = async () => {
      if (!supabase) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Verificar se há parâmetros de recuperação na URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        if (type === 'recovery' && accessToken && refreshToken) {
          setIsRecoverySession(true);
        } else if (session?.user) {
          // Se há sessão mas não é recovery, redirecionar para dashboard
          window.location.href = '/dashboard';
        } else {
          // Se não há sessão nem recovery, redirecionar para login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        window.location.href = '/login';
      }
    };

    if (isConfigured) {
      checkRecoverySession();
    }
  }, [isConfigured]);

  // Validação de senha
  const validatePassword = (password: string) => {
    if (!password) {
      return 'Nova senha é obrigatória';
    }
    if (password.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  };

  // Validação de confirmação de senha
  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) {
      return 'Confirmação de senha é obrigatória';
    }
    if (password !== confirmPassword) {
      return 'Senhas não coincidem';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);
    
    setPasswordErrors(passwordError);
    setConfirmPasswordErrors(confirmPasswordError);
    
    if (passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updatePassword(newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/login';
  };

  // Mostrar erro se Supabase não estiver configurado
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Configuração Necessária
            </h1>
            
            <p className="text-gray-600 mb-6">
              Supabase não configurado. Configure as variáveis de ambiente.
            </p>
            
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full transition-colors"
            >
              Voltar ao Site
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  // Tela de sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Senha Redefinida com Sucesso!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
            </p>
            
            <button
              onClick={handleGoToLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ir para o Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <div className="bg-emerald-500 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Redefinir Senha
            </h1>
            <p className="text-gray-600 mt-2">
              Digite sua nova senha
            </p>
          </div>

          {/* Mensagens de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordErrors('');
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors focus:outline-none ${
                    passwordErrors ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Digite sua nova senha"
                  autoComplete="new-password"
                  aria-describedby={passwordErrors ? "password-error" : undefined}
                  aria-invalid={passwordErrors ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordErrors && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">{passwordErrors}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordErrors('');
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors focus:outline-none ${
                    confirmPasswordErrors ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirme sua nova senha"
                  autoComplete="new-password"
                  aria-describedby={confirmPasswordErrors ? "confirm-password-error" : undefined}
                  aria-invalid={confirmPasswordErrors ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                  aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPasswordErrors && (
                <p id="confirm-password-error" className="mt-1 text-sm text-red-600" role="alert">{confirmPasswordErrors}</p>
              )}
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              aria-label="Redefinir senha"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                'Redefinir Senha'
              )}
            </button>
          </form>

          {/* Link para voltar */}
          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors"
            >
              ← Voltar ao login
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};