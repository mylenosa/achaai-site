// Single Responsibility: Seção de preços
// Open/Closed: Usa dados configuráveis dos planos
import React from 'react';
import { motion } from 'framer-motion';
import { pricingPlans } from '../../data/plans';
import { PricingCard } from './PricingCard';

export const Pricing: React.FC = () => {
  return (
    <section id="planos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Planos para sua Loja
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho do seu negócio
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div key={plan.id} className="flex">
              <PricingCard plan={plan} index={index} />
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Todos os planos incluem suporte técnico e atualizações gratuitas
          </p>
        </motion.div>
      </div>
    </section>
  );
};