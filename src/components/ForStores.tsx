// Single Responsibility: Seção para lojistas
import React from 'react';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { WhatsAppButton } from './ui/WhatsAppButton';
import { CTAButton } from './ui/CTAButton';
import { config } from '../lib/config';

export const ForStores: React.FC = () => {
  const benefits = [
    {
      icon: Users,
      title: 'Pedidos Qualificados',
      description: 'Receba apenas clientes que realmente querem comprar seus produtos'
    },
    {
      icon: TrendingUp,
      title: 'Destaque nas Buscas',
      description: 'Apareça primeiro quando alguém procurar seus produtos'
    },
    {
      icon: Store,
      title: 'Gestão Simples',
      description: 'Atualize seu estoque via planilha, API ou painel web'
    },
    {
      icon: BarChart3,
      title: 'Relatórios de Demanda',
      description: 'Saiba quais produtos seus clientes mais procuram'
    }
  ];

  const salesMailtoLink = `mailto:${config.app.contactEmail}?subject=${encodeURIComponent('Interesse Comercial - AchaAí para Lojas')}`;

  return (
    <section id="para-lojas" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Para Lojas e Fornecedores
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conecte seu estoque ao AchaAí e receba pedidos qualificados direto no seu WhatsApp
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-center text-sm">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
        >
          <CTAButton
            href="#planos"
            variant="secondary"
            data-cta="ver-planos"
          >
            Ver Planos
          </CTAButton>
          <CTAButton
            href={salesMailtoLink}
            data-cta="contact-stores"
            variant="primary"
          >
            Falar com Vendas
          </CTAButton>
        </motion.div>
      </div>
    </section>
  );
};
