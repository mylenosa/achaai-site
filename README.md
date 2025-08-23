# AchaAí - Landing Page

Landing page completa para o AchaAí, plataforma que informa onde encontrar produtos em lojas físicas de Ariquemes-RO via WhatsApp.

## 🏗️ Arquitetura SOLID

Este projeto foi desenvolvido seguindo rigorosamente os princípios SOLID:

### Single Responsibility Principle (SRP)
- Cada componente tem uma única responsabilidade
- `HomePage.tsx` - Página para consumidores finais
- `StoresPage.tsx` - Página dedicada para lojistas
- `Hero.tsx` - Seção hero
- `Pricing.tsx` - Seção de preços
- `WhatsAppButton.tsx` - Botão específico para WhatsApp
- etc.

### Open/Closed Principle (OCP)
- Planos configuráveis via `data/plans.ts`
- Depoimentos via `data/testimonials.ts`
- FAQs via `data/faqs.ts`
- Adicione novos itens sem modificar componentes

### Liskov Substitution Principle (LSP)
- `CTAButton` e `WhatsAppButton` são intercambiáveis
- Interface `CTAButtonProps` garante compatibilidade

### Interface Segregation Principle (ISP)
- Props específicas e enxutas para cada componente
- `PricingCardProps`, `TestimonialProps`, etc.

### Dependency Inversion Principle (DIP)
- Configurações centralizadas em `lib/config.ts`
- URLs, cores e textos injetados via configuração
- Hook `useSEO` para gerenciar meta tags por página

## 🚀 Como usar

### Desenvolvimento
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

## ⚙️ Configuração

### Personalizar cidade, links e cores
Edite o arquivo `src/lib/config.ts`:

```typescript
export const config = {
  app: {
    name: 'AchaAí',
    city: 'Ariquemes', // Altere aqui
    whatsappUrl: 'https://bit.ly/AchaAi', // Altere aqui
    salesWhatsappUrl: 'https://bit.ly/AchaAi', // Para vendas
  },
  theme: {
    primary: 'emerald', // Altere as cores aqui
  }
}
```

### Adicionar/editar planos
Edite `src/data/plans.ts`:

```typescript
export const pricingPlans: PricingPlan[] = [
  {
    id: 'novo-plano',
    name: 'Novo Plano',
    price: 'R$ 99',
    features: ['Feature 1', 'Feature 2'],
    // ...
  }
]
```

### Adicionar/editar FAQs
Edite `src/data/faqs.ts`:

```typescript
export const faqs: FAQ[] = [
  {
    id: 'nova-pergunta',
    question: 'Nova pergunta?',
    answer: 'Nova resposta...'
  }
]
```

### Adicionar/editar FAQs para lojas
Edite `src/data/storesFaqs.ts`:

```typescript
export const storesFaqs: FAQ[] = [
  {
    id: 'nova-pergunta-loja',
    question: 'Nova pergunta para lojas?',
    answer: 'Nova resposta...'
  }
]
```

## 📊 Analytics

### Seletores para tracking
Todos os CTAs possuem `data-cta` attributes:

- `data-cta="whatsapp-hero"` - CTA principal do hero
- `data-cta="whatsapp-stores"` - CTA para lojistas na home
- `data-cta="whatsapp-stores-hero"` - CTA principal página lojas
- `data-cta="whatsapp-stores-final"` - CTA final página lojas
- `data-cta="whatsapp-final"` - CTA final
- `data-cta="ver-planos"` - Link para planos
- `data-cta="whatsapp-plan-{id}"` - CTAs dos planos

### Configurar IDs reais
1. Substitua `GA_MEASUREMENT_ID` pelo seu Google Analytics ID
2. Substitua `FB_PIXEL_ID` pelo seu Facebook Pixel ID
3. Atualize em `src/lib/config.ts` e `index.html`

## 🎨 Customização Visual

### Cores
As cores são baseadas no Tailwind CSS. Para alterar:
- Verde principal: `emerald-500`
- Azul secundário: `blue-500`
- Cinzas: `gray-50` a `gray-800`

### Animações
Usando Framer Motion para:
- Fade in ao scroll
- Hover effects
- Micro-interações

## 📱 Responsividade

- Mobile-first design
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Grid responsivo em todas as seções
- Botões e textos adaptáveis

## ♿ Acessibilidade

- Semântica HTML5 (`header`, `main`, `section`, `footer`)
- ARIA labels nos botões
- Contraste AA compliant
- Foco visível em todos os elementos interativos
- Navegação por teclado

## 🔧 Tecnologias

- **React 18** + TypeScript + React Router
- **Tailwind CSS** para styling
- **Framer Motion** para animações
- **Lucide React** para ícones
- **Vite** para build

## 📈 Performance

Otimizações implementadas:
- Lazy loading de componentes
- Preconnect para fonts
- CSS crítico inline
- Imagens otimizadas
- Bundle splitting automático

Meta Lighthouse:
- Performance: ≥ 90
- Accessibility: ≥ 95  
- SEO: ≥ 90

## 🔗 Links importantes

- WhatsApp consumidores: https://bit.ly/AchaAi
- WhatsApp vendas/lojas: https://bit.ly/AchaAi
- Todas as configurações em: `src/lib/config.ts`
- Dados editáveis em: `src/data/`

## 📱 Páginas

- `/` - Página principal para consumidores finais
- `/lojas` - Página dedicada para lojistas e fornecedores

Cada página tem SEO otimizado e conteúdo específico para seu público-alvo.