// Single Responsibility: Página dedicada para lojistas/fornecedores
import React from 'react';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Users, BarChart3, FileSpreadsheet, MessageCircle, Zap } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { Pricing } from '../components/Pricing/Pricing';
import { WhatsAppButton } from '../components/ui/WhatsAppButton';
import { storesFaqs } from '../data/storesFaqs';
import { config } from '../lib/config';

export const StoresPage: React.FC = () => {
  useSEO({
    title: config.seo.stores.title,
    description: config.seo.stores.description,
    keywords: config.seo.keywords,
  });

  const benefits = [
    {
      icon: Users,
      title: 'Clientes Qualificados',
      description: 'Receba apenas pessoas que já sabem que você tem o produto'
    },
    {
      icon: TrendingUp,
      title: 'Aumento de Vendas',
      description: 'Lojas parceiras relatam 30-40% mais movimento'
    },
    {
      icon: BarChart3,
      title: 'Impacto Comunitário',
      description: 'Fortaleça o comércio local de Ariquemes'
    }
  ];

  const howToRegister = [
    {
      icon: MessageCircle,
      title: 'Via WhatsApp',
      description: 'Envie uma lista simples dos seus produtos pelo WhatsApp'
    },
    {
      icon: FileSpreadsheet,
      title: 'Planilha Excel',
      description: 'Baixe nosso modelo e envie sua planilha completa'
    },
    {
      icon: Zap,
      title: 'Integração API',
      description: 'Conecte seu sistema diretamente com nossa API'
    }
  ];

  const [openFaqs, setOpenFaqs] = React.useState<string[]>([]);

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="pt-16">
      {/* Hero para Lojas */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8">
              <Store className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Conecte sua Loja ao {config.app.name}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Apareça quando clientes procurarem seus produtos em {config.app.city}. 
              Cadastro simples, impacto real no seu negócio.
            </p>
            
            <WhatsAppButton 
              href={config.app.salesWhatsappUrl}
              data-cta="whatsapp-stores-hero"
              className="mb-6"
            >
              Falar com Nossa Equipe
            </WhatsAppButton>
            
            <p className="text-emerald-600 font-medium">
              📈 Lojas parceiras aumentaram vendas em 30-40%
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Por que se conectar ao {config.app.name}?
            </h2>
            <p className="text-xl text-gray-600">
              Transforme buscas em vendas e fortaleça o comércio local
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Cadastrar */}
      <section className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Como Cadastrar seus Produtos
            </h2>
            <p className="text-xl text-gray-600">
              Escolha a forma mais fácil para você
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howToRegister.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 text-center shadow-lg"
              >
                <div className="bg-emerald-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {method.title}
                </h3>
                <p className="text-gray-600">
                  {method.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <Pricing />

      {/* FAQ para Lojas */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Dúvidas Frequentes - Lojas
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa saber para começar
            </p>
          </motion.div>

          <div className="space-y-4">
            {storesFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                  aria-expanded={openFaqs.includes(faq.id)}
                >
                  <span className="font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaqs.includes(faq.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                
                {openFaqs.includes(faq.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-700">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final para Lojas */}
      <section className="py-20 bg-gradient-to-br from-emerald-500 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pronto para Crescer?
            </h2>
            
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Conecte sua loja ao {config.app.name} e apareça quando clientes procurarem seus produtos
            </p>
            
            <WhatsAppButton 
              href={config.app.salesWhatsappUrl}
              variant="secondary"
              size="lg"
              data-cta="whatsapp-stores-final"
              className="bg-white text-emerald-600 hover:bg-gray-50"
            >
              Começar Agora
            </WhatsAppButton>
            
            <p className="text-emerald-100 mt-6 text-sm">
              Plano gratuito disponível • Suporte completo • Resultados em dias
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};