// Dependency Inversion: Configurações centralizadas
export const config = {
  app: {
    name: 'AchaAí',
    teamName: 'Arikeme',
    city: 'Ariquemes',
    state: 'RO',
    domain: 'achai.arikeme.com',
    whatsappUrl: 'http://zap.arikeme.com',
    contactEmail: 'contato@arikeme.com',
  },
  theme: {
    primary: 'emerald',
    secondary: 'blue',
    accent: 'green',
  },
  seo: {
    title: 'AchaAí - Encontre Produtos em Ariquemes via WhatsApp',
    description: 'Encontre produtos em lojas físicas de Ariquemes-RO usando apenas o WhatsApp. Conecte consumidores e lojistas de forma simples e direta.',
    keywords: 'busca local, produtos, Ariquemes, WhatsApp, lojas físicas, comércio local, Rondônia',
  },
  analytics: {
    gtag: '%VITE_GA_MEASUREMENT_ID%',
    fbPixel: 'FB_PIXEL_ID', // Substituir pelo ID real
  }
} as const;

export type Config = typeof config;
