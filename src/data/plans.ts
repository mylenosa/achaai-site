// Open/Closed: Planos configuráveis via dados
import { PricingPlan } from '../lib/types';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Ideal para começar a receber pedidos',
    features: [
      'Até 50 itens no catálogo',
      'Receber pedidos via WhatsApp',
      'Aparecer em buscas próximas',
      'Suporte por email',
      'Perfil básico da loja'
    ],
    ctaText: 'Começar Grátis',
    ctaType: 'whatsapp'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 79',
    period: '/mês',
    description: 'Para lojas que querem se destacar',
    features: [
      'Itens ilimitados no catálogo',
      'Destaque nas buscas',
      'Relatórios de demanda',
      'Integração com planilhas',
      'API para sistemas próprios',
      'Suporte prioritário',
      'Analytics detalhados'
    ],
    highlighted: true,
    ctaText: 'Assinar Pro',
    ctaType: 'whatsapp'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    description: 'Soluções personalizadas para grandes redes',
    features: [
      'Integração com ERP',
      'SLA garantido',
      'Multi-lojas e equipes',
      'Treinamento personalizado',
      'Gerente de conta dedicado',
      'Relatórios customizados',
      'Suporte 24/7'
    ],
    ctaText: 'Falar com Vendas',
    ctaType: 'contact'
  }
];