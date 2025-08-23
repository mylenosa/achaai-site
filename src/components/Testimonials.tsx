// Single Responsibility: Seção de depoimentos
import React from 'react';
import { motion } from 'framer-motion';
import { Star, User, Store } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { testimonials } from '../data/testimonials';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-emerald-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            O que nossos usuários dizem
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Depoimentos reais de quem já usa o AchaAí
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic text-lg">
                "{testimonial.content}"
              </blockquote>
              
              <div className="flex items-center">
                <div className="relative mr-4">
                  <Avatar 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12"
                    fallback={testimonial.name.charAt(0)}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                    {testimonial.type === 'customer' ? 
                      <User className="w-3 h-3 text-white" /> : 
                      <Store className="w-3 h-3 text-white" />
                    }
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};