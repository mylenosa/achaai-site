import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  LogIn, 
  Search, 
  AlertTriangle, 
  Github,
  Chrome,
  Wand2
} from 'lucide-react';
import { useAuthContext } from '../hooks/useAuth';
import { getSupabaseErrorMessage } from '../lib/supabase';
import { config } from '../lib/config';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  const { 
    user, 
    signIn, 
    signInWithMagicLink,
    signInWithGitHub,
    signInWithGoogle,
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

  // Login com email e senha
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      // Redirecionamento será automático via onAuthStateChange
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Magic Link
  const handleMagicLink = async () => {
    if (!email) {
      setError('Digite seu e-mail primeiro');
      return;
    }

    setIsMagicLinkLoading(true);
    setError('');

    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar magic link');
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  // Login com GitHub
  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true);
    setError('');

    try {
      await signInWithGitHub();
      // Redirecionamento será automático
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login com GitHub');
      setIsGitHubLoading(false);
    }
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
              Magic Link Enviado!
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-emerald-500 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Portal {config.app.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Acesse sua conta de lojista
            </p>
          </div>

          {/* Mensagens de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Social */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGitHubLogin}
              disabled={isGitHubLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGitHubLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <>
                  <Github className="w-5 h-5 mr-3" />
                  Continuar com GitHub
                </>
              )}
            </button>

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <>
                  <Chrome className="w-5 h-5 mr-3" />
                  Continuar com Google
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
              <span className="px-2 bg-white text-gray-500">ou</span>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-3">
              {/* Botão de Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </button>

              {/* Botão Magic Link */}
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={isMagicLinkLoading || !email}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isMagicLinkLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Enviar Magic Link
                  </>
                )}
              </button>
            </div>
          </form>

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