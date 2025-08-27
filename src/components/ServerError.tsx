// Single Responsibility: Página de erro de servidor (5xx)
import React from 'react';
import { motion } from 'framer-motion';
import { Home, RefreshCw, MessageCircle } from 'lucide-react';
import { CTAButton } from './ui/CTAButton';
import { WhatsAppButton } from './ui/WhatsAppButton';
import { config } from '../lib/config';

export const ServerError: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Imagem de erro 500 */}
          <div className="mb-8">
            <img
              src="https://http.cat/500"
              alt="Erro 500 - Erro interno do servidor"
              className="mx-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 max-w-md w-full"
              loading="lazy"
            />
          </div>

          {/* Título e descrição */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Ops! Algo deu errado
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Nossos servidores estão com problemas temporários. 
            Tente novamente em alguns instantes ou entre em contato conosco.
          </p>

          {/* Botões de ação */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <CTAButton
              onClick={handleRefresh}
              variant="primary"
              data-cta="500-refresh"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar Novamente
            </CTAButton>
            
            <CTAButton
              href="/"
              variant="secondary"
              data-cta="500-home"
              className="w-full sm:w-auto"
            >
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Início
            </CTAButton>
          </div>

          {/* Contato alternativo */}
          <div className="mt-8">
            <p className="text-gray-600 mb-4">
              Se o problema persistir, entre em contato:
            </p>
            <WhatsAppButton
              variant="secondary"
              size="md"
              data-cta="500-whatsapp"
              className="w-full sm:w-auto"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar no WhatsApp
            </WhatsAppButton>
          </div>

          {/* Informações técnicas */}
          <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="font-semibold text-gray-800 mb-4">
              Código do Erro: 500
            </h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Erro interno do servidor</li>
              <li>• Nossa equipe foi notificada automaticamente</li>
              <li>• Geralmente é resolvido em poucos minutos</li>
              <li>• Seus dados estão seguros</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};