import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuth';
import { getSupabaseErrorMessage } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isConfigured } = useAuthContext();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};