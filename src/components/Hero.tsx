// Single Responsibility: Seção hero da landing page
import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle } from 'lucide-react';
import { WhatsAppButton } from './ui/WhatsAppButton';
import { PhoneMockup } from './ui/PhoneMockup';
import { ExampleCarousel } from './ui/ExampleCarousel';
import { TrustBadge } from './ui/TrustBadge';
import { config } from '../lib/config';

export const Hero: React.FC = () => {
  const examples = [
    "Onde encontro garrafa com tampa hermética em Ariquemes?",
    "Tem WD-40 disponível hoje?",
    "Preciso de parafuso M8 x 50mm",
    "Onde vende tinta spray vermelha?"
  ];

  return (
    <section id="hero" className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Logo/Brand */}
            <div className="flex items-center justify-center lg:justify-start mb-8">
              <div className="bg-emerald-500 rounded-full p-4 mr-4">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white">
                {config.app.name}
              </h1>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
              Procurando algo em {config.app.city}? <br />
              <span className="text-emerald-600">Pergunte no zap</span> 🔍
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              O {config.app.name} encontra pra você onde tem o que você procura — direto no WhatsApp 💬
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              <TrustBadge text="Funciona 100% no WhatsApp" />
              <TrustBadge text="Lojas verificadas" icon="shield" />
              <TrustBadge text="Sem cadastro necessário" />
            </div>

            {/* CTA Button */}
            <div className="mb-8">
              <WhatsAppButton 
                data-cta="whatsapp-hero" 
                className="mb-4 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Abrir no WhatsApp
              </WhatsAppButton>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gratuito • Sem cadastro • Resposta em minutos
              </p>
            </div>

            {/* Example Queries */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <MessageCircle className="h-5 w-5 text-emerald-600 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Exemplos de busca:</span>
              </div>
              <ExampleCarousel examples={examples} />
            </div>
          </motion.div>

          {/* Right Column - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <PhoneMockup />
              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
              >
                ⚡ Resposta rápida
              </motion.div>
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-4 -right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
              >
                📍 Lojas próximas
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};