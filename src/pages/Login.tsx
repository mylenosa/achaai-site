import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Search, 
  AlertTriangle, 
  Chrome,
  Wand2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuthContext } from '../hooks/useAuth';
import { getSupabaseErrorMessage } from '../lib/supabase';
import { config } from '../lib/config';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [emailErrors, setEmailErrors] = useState('');
  const [passwordErrors, setPasswordErrors] = useState('');
  
  const { 
    user, 
    signIn, 
    signInWithMagicLink,
    signInWithGoogle,
    resetPassword,
    isConfigured 
  } = useAuthContext();

  // Redirecionar se já estiver logado
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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
              {getSupabaseErrorMessage()}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Para desenvolvedores:</strong>
              </p>
              <p className="text-xs text-gray-600">
                Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
              </p>
            </div>
            
            <a
              href="/"
              className="inline-flex items-center justify-center mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full transition-colors"
            >
              Voltar ao Site
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  // Validação de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'E-mail é obrigatório';
    }
    if (!emailRegex.test(email)) {
      return 'E-mail inválido';
    }
    return '';
  };

  // Validação de senha
  const validatePassword = (password: string) => {
    if (!password) {
      return 'Senha é obrigatória';
    }
    if (password.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return '';
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      // Redirecionamento será automático
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com Google');
      setIsGoogleLoading(false);
    }
  };

  // Login com email e senha
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setEmailErrors(emailError);
    setPasswordErrors(passwordError);
    
    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // Redirecionamento será automático via onAuthStateChange
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Magic Link
  const handleMagicLink = async () => {
    const emailError = validateEmail(email);
    setEmailErrors(emailError);
    
    if (emailError) {
      return;
    }

    setIsMagicLinkLoading(true);
    setError('');

    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar link de acesso');
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  // Reset de senha
  const handleResetPassword = async () => {
    const emailError = validateEmail(email);
    setEmailErrors(emailError);
    
    if (emailError) {
      return;
    }

    setIsResetLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setIsResetLoading(false);
    }
  };

  // Tela de confirmação Magic Link
  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Link de Acesso Enviado!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Enviamos um link de acesso para <strong>{email}</strong>. 
              Clique no link para fazer login automaticamente.
            </p>
            
            <button
              onClick={() => setMagicLinkSent(false)}
              className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors"
            >
              ← Voltar ao login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Tela de confirmação Reset Password
  if (resetEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              E-mail de Recuperação Enviado!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Enviamos um link para redefinir sua senha para <strong>{email}</strong>. 
              Verifique sua caixa de entrada e clique no link.
            </p>
            
            <button
              onClick={() => setResetEmailSent(false)}
              className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
            >
              ← Voltar ao login
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
              Portal {config.app.name}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Acesse sua conta de lojista
            </p>
          </div>

          {/* Mensagens de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Botão Google (Primário) */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg transition-all duration-200 text-lg border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-sm hover:shadow-md"
              aria-label="Entrar com conta do Google"
            >
              {isGoogleLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600" aria-hidden="true"></div>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Entrar com Google
                </>
              )}
            </button>
          </div>

          {/* Divisor */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Formulário de Email/Senha */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailErrors('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors focus:outline-none ${
                    emailErrors ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  aria-describedby={emailErrors ? "email-error" : undefined}
                  aria-invalid={emailErrors ? "true" : "false"}
                />
              </div>
              {emailErrors && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{emailErrors}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordErrors('');
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors focus:outline-none ${
                    passwordErrors ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              
              {/* Link Esqueci a Senha */}
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResetLoading}
                  className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1 py-1"
                >
                  {isResetLoading ? 'Enviando...' : 'Esqueci a senha'}
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center text-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              aria-label="Fazer login com email e senha"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" aria-hidden="true"></div>
              ) : (
                <>
                  <LogIn className="w-6 h-6 mr-3" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Seção Colapsável "Mais Opções" */}
          <div className="mt-6">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
              aria-expanded={showMoreOptions}
              aria-controls="more-options"
            >
              <span className="text-sm mr-2">Mais opções</span>
              {showMoreOptions ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {showMoreOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                  id="more-options"
                >
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <button
                      onClick={handleMagicLink}
                      disabled={isMagicLinkLoading}
                      className="w-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-gray-500/20"
                      aria-label="Entrar por link no email sem senha"
                    >
                      {isMagicLinkLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" aria-hidden="true"></div>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-2" />
                          Entrar por link no e-mail (sem senha)
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Link para voltar */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-emerald-600 hover:text-emerald-700 text-sm transition-colors"
            >
              ← Voltar ao site
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};