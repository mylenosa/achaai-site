// Single Responsibility: Seção de métricas/KPIs
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Store, Target } from 'lucide-react';
import { kpis } from '../data/kpis';

const iconMap = {
  search: Search,
  clock: Clock,
  store: Store,
  target: Target,
};

export const KPIs: React.FC = () => {
  return (
    <section className="py-16 bg-emerald-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Números que comprovam nossa eficiência
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {kpis.map((kpi, index) => {
            const IconComponent = kpi.icon ? iconMap[kpi.icon as keyof typeof iconMap] : null;
            
            return (
              <motion.div
                key={kpi.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                {IconComponent && (
                  <div className="bg-emerald-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  {kpi.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">
                  {kpi.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};