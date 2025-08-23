// Single Responsibility: CTA final da landing page
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { WhatsAppButton } from './ui/WhatsAppButton';
import { config } from '../lib/config';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-500 to-emerald-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Encontre qualquer produto em {config.app.city}
          </h2>
          
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Descubra onde tem o que você procura. Receba endereço e telefone das lojas direto no WhatsApp
          </p>
          
          <WhatsAppButton 
            variant="secondary"
            size="lg"
            data-cta="whatsapp-final"
            className="bg-white text-emerald-600 hover:bg-gray-50"
          >
            Fazer uma Busca
          </WhatsAppButton>
          
          <p className="text-emerald-100 mt-6 text-sm">
            Gratuito • Sem app • Resposta em minutos
          </p>
        </motion.div>
      </div>
    </section>
  );
};