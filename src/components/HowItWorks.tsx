// Single Responsibility: Seção "Como funciona"
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, List, MapPin } from 'lucide-react';
import { howItWorksSteps } from '../data/steps';

const iconMap = {
  'message-circle': MessageCircle,
  'list': List,
  'map-pin': MapPin,
};

export const HowItWorks: React.FC = () => {
  return (
    <section id="como-funciona" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Como funciona?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Em 3 passos simples você encontra o que precisa
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {howItWorksSteps.map((step, index) => {
            const IconComponent = iconMap[step.icon as keyof typeof iconMap];
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="bg-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};