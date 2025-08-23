// Single Responsibility: Seção de impacto na comunidade
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Leaf, Users, Clock } from 'lucide-react';
import { communityImpacts } from '../data/community-impact';

const iconMap = {
  'trending-up': TrendingUp,
  'leaf': Leaf,
  'users': Users,
  'clock': Clock,
};

export const CommunityImpact: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Impacto na Comunidade
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Mais que uma plataforma de busca, somos um motor de desenvolvimento local
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {communityImpacts.map((impact, index) => {
            const IconComponent = iconMap[impact.icon as keyof typeof iconMap];
            
            return (
              <motion.div
                key={impact.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:scale-105"
              >
                <div className="bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                  {impact.value}
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {impact.label}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  {impact.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {impact.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Juntos, fortalecemos Ariquemes
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Cada busca realizada no AchaAí contribui para o crescimento do comércio local, 
              reduz o impacto ambiental e gera oportunidades de emprego na nossa cidade. 
              Somos mais que uma ferramenta - somos parte da solução para um futuro mais sustentável e próspero.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};