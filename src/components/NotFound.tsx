// Single Responsibility: Página de erro 404
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { CTAButton } from './ui/CTAButton';
import { WhatsAppButton } from './ui/WhatsAppButton';
import { config } from '../lib/config';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Imagem de erro 404 */}
          <div className="mb-8">
            <img
              src="https://http.cat/404"
              alt="Erro 404 - Página não encontrada"
              className="mx-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 max-w-md w-full"
              loading="lazy"
            />
          </div>

          {/* Título e descrição */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Ops! Página não encontrada
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A página que você procura não existe ou foi movida. 
            Que tal procurar produtos no {config.app.name}?
          </p>

          {/* Botões de ação */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <CTAButton
              href="/"
              variant="primary"
              data-cta="404-home"
              className="w-full sm:w-auto"
            >
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Início
            </CTAButton>
            
            <WhatsAppButton
              variant="secondary"
              data-cta="404-whatsapp"
              className="w-full sm:w-auto"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar Produtos
            </WhatsAppButton>
          </div>

          {/* Sugestões */}
          <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="font-semibold text-gray-800 mb-4">
              Sugestões do que você pode fazer:
            </h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Verificar se o endereço está correto</li>
              <li>• Voltar à página inicial</li>
              <li>• Procurar produtos via WhatsApp</li>
              <li>• Entrar em contato conosco</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};