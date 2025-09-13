// Dependency Inversion: Configurações centralizadas
export const config = {
  app: {
    name: 'AchaAí',
    teamName: 'Arikeme',
    city: 'Ariquemes',
    state: 'RO',
    domain: 'achai.arikeme.com',
    whatsappUrl: 'http://chat.arikeme.com',
    contactEmail: 'contato@arikeme.com',
  },
  theme: {
    primary: 'emerald',
    secondary: 'blue',
    accent: 'green',
  },
  seo: {
    title: 'AchaAí — Encontre de tudo na sua cidade',
    description: 'Encontre produtos e lojas perto de você com o AchaAí.',
    keywords: 'achaai, lojas, produtos, perto de mim',
    canonicalUrl: 'https://achai.arikeme.com', // Altere para seu domínio real
  },
  analytics: {
    gtag: '%VITE_GA_MEASUREMENT_ID%',
    fbPixel: 'FB_PIXEL_ID', // Substituir pelo ID real
  }
} as const;

export type Config = typeof config;
