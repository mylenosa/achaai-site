// Single Responsibility: Card individual de preço
// Interface Segregation: Props específicas para pricing
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PricingPlan } from '../../lib/types';
import { WhatsAppButton } from '../ui/WhatsAppButton';
import { CTAButton } from '../ui/CTAButton';

interface PricingCardProps {
  plan: PricingPlan;
  index: number;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 relative ${
        plan.highlighted ? 'ring-2 ring-emerald-500 scale-105' : ''
      } flex flex-col min-h-[500px] w-full text-gray-800`}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            Mais Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6 md:mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
          {plan.period && (
            <span className="text-gray-600 ml-1">{plan.period}</span>
          )}
        </div>
        <p className="text-gray-600">{plan.description}</p>
      </div>

      <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start">
            <Check className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="text-center">
        {plan.ctaType === 'whatsapp' ? (
          <WhatsAppButton
            size="md"
            className="w-full"
            data-cta={`whatsapp-plan-${plan.id}`}
          >
            {plan.ctaText}
          </WhatsAppButton>
        ) : (
          <CTAButton
            size="md"
            className="w-full"
            data-cta={`contact-plan-${plan.id}`}
          >
            {plan.ctaText}
          </CTAButton>
        )}
      </div>
    </motion.div>
  );
};
