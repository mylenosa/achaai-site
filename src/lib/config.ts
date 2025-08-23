// Dependency Inversion: Configurações centralizadas
export const config = {
  app: {
    name: 'AchaAí',
    city: 'Ariquemes',
    state: 'RO',
    whatsappUrl: 'https://bit.ly/AchaAi',
    salesWhatsappUrl: 'https://bit.ly/AchaAi', // Para vendas/fornecedores
  },
  theme: {
    primary: 'emerald',
    secondary: 'blue',
    accent: 'green',
  },
  seo: {
    title: 'AchaAí - Encontre Produtos em Ariquemes via WhatsApp',
    description: 'Descubra onde encontrar qualquer produto em Ariquemes-RO. Receba endereço e telefone das lojas direto no WhatsApp.',
    keywords: 'busca local, produtos, Ariquemes, WhatsApp, lojas físicas',
    stores: {
      title: 'AchaAí para Lojas - Conecte seu Estoque',
      description: 'Cadastre seus produtos no AchaAí e apareça quando clientes procurarem. Impacto econômico e visibilidade local.',
    }
  },
  analytics: {
    gtag: 'GA_MEASUREMENT_ID', // Substituir pelo ID real
    fbPixel: 'FB_PIXEL_ID', // Substituir pelo ID real
  }
} as const;

export type Config = typeof config;