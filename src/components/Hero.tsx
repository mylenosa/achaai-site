// Single Responsibility: Seção hero da landing page
import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, MapPin } from 'lucide-react';
import { WhatsAppButton } from './ui/WhatsAppButton';
import { config } from '../lib/config';

export const Hero: React.FC = () => {
  const examples = [
    "Onde encontro garrafa com tampa hermética em Ariquemes?",
    "Onde encontro WD-40 hoje?"
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-emerald-500 rounded-full p-4 mr-4">
              <Search className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800">
              {config.app.name}
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Procurando algo em {config.app.city}? <br />
            <span className="text-emerald-600">Pergunte no zap</span> 🔍
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Receba endereço e telefone das lojas que têm o que você procura — direto no WhatsApp 💬
          </p>

          {/* Trust Badge */}
          <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <MessageCircle className="w-4 h-4 mr-2" />
            100% no WhatsApp • Sem app • Gratuito
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          {/* CTA Button */}
          <WhatsAppButton data-cta="whatsapp-hero" className="mb-8">
            Abrir no WhatsApp
          </WhatsAppButton>

          {/* Example Queries */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Pergunte assim:</span>
            </div>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="text-gray-700 italic text-lg"
                >
                  "{example}"
                </motion.div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-emerald-600 font-medium">
                📍 Você recebe endereço e telefone das lojas
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};