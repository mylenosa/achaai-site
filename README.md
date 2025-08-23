# AchaAí - Landing Page

Landing page completa e moderna para o AchaAí, plataforma que conecta consumidores e lojistas em Ariquemes-RO via WhatsApp.

## ✨ Novos Recursos

### Visual e UX Aprimorados
- 📱 **Mockup de celular** no hero com exemplo real de conversa
- 🎠 **Carrossel de frases** de exemplo com transições suaves
- 🌙 **Dark mode** opcional com toggle no header
- 🎯 **Scrollspy** para navegação inteligente
- 👤 **Avatars reais** nos depoimentos
- 🏆 **Seção de Impacto na Comunidade** com métricas de sustentabilidade
- ✨ **Animações aprimoradas** com Framer Motion
- 🎨 **Estados de hover/focus** bem definidos e acessíveis
- 📱 **FAQ colapsável** com animações suaves
- 🛡️ **Selos de confiança** ("Lojas verificadas", etc.)

## 🏗️ Arquitetura SOLID

Este projeto foi desenvolvido seguindo rigorosamente os princípios SOLID:

### Single Responsibility Principle (SRP)
- Cada componente tem uma única responsabilidade
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

### Adicionar/editar impactos da comunidade
Edite `src/data/community-impact.ts`:

```typescript
export const communityImpacts: CommunityImpact[] = [
  {
    id: 'novo-impacto',
    title: 'Novo Impacto',
    description: 'Descrição do impacto...',
    value: '100%',
    label: 'melhoria alcançada',
    icon: 'trending-up'
  }
]
```

## 📊 Analytics

### Seletores para tracking
Todos os CTAs possuem `data-cta` attributes:

- `data-cta="whatsapp-hero"` - CTA principal do hero
- `data-cta="whatsapp-stores"` - CTA para lojistas
- `data-cta="whatsapp-final"` - CTA final
- `data-cta="ver-planos"` - Link para planos
- `data-cta="whatsapp-plan-{id}"` - CTAs dos planos

### Configurar IDs reais
1. Substitua `GA_MEASUREMENT_ID` pelo seu Google Analytics ID
2. Substitua `FB_PIXEL_ID` pelo seu Facebook Pixel ID
3. Atualize em `src/lib/config.ts` e `index.html`

## 🎨 Customização Visual

### Dark Mode
O dark mode é ativado automaticamente baseado na preferência do sistema ou pode ser alternado manualmente via toggle no header.

### Cores
As cores são baseadas no Tailwind CSS. Para alterar:
- Verde principal: `emerald-500`
- Azul secundário: `blue-500`
- Cinzas: `gray-50` a `gray-800`

### Animações
Usando Framer Motion e CSS para:
- Fade in ao scroll
- Hover effects
- Micro-interações
- Carrossel de exemplos
- FAQ colapsável
- Elementos flutuantes no hero

### Componentes Interativos
- **PhoneMockup**: Simulação realista de conversa no WhatsApp
- **ExampleCarousel**: Rotação automática de frases de exemplo
- **TrustBadge**: Selos de confiança configuráveis
- **Avatar**: Componente de avatar com fallback
- **DarkModeToggle**: Alternador de tema

## 📱 Responsividade

- Mobile-first design
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Grid responsivo em todas as seções
- Botões e textos adaptáveis

## ♿ Acessibilidade

Melhorias implementadas:
- Semântica HTML5 (`header`, `main`, `section`, `footer`)
- ARIA labels nos botões
- Estados de foco visíveis e bem definidos
- Contraste AA compliant
- Suporte a navegação por teclado
- Indicadores de estado para elementos interativos
- Navegação por teclado
- Textos alternativos em imagens
- Roles ARIA apropriados

## 🎭 Funcionalidades Avançadas

### Scrollspy
O menu do header destaca automaticamente a seção atual baseada na posição do scroll.

### Dark Mode
- Detecção automática da preferência do sistema
- Persistência da escolha no localStorage
- Transições suaves entre temas
- Todos os componentes adaptados

### Carrossel de Exemplos
- Rotação automática a cada 3 segundos
- Indicadores visuais
- Controle manual via clique
- Animações suaves de entrada/saída

## 🔧 Tecnologias

- **React 18** + TypeScript
- **Tailwind CSS** para styling
- **Framer Motion** para animações
- **Lucide React** para ícones
- **Radix UI** para componentes acessíveis
- **Vite** para build
- **class-variance-authority** para variantes de componentes

## 📈 Performance

Otimizações implementadas:
- Lazy loading de componentes
- Preconnect para fonts
- Otimização de imagens via Pexels
- CSS crítico inline
- Bundle splitting automático
- Animações otimizadas com GPU
- Debounce em eventos de scroll

Meta Lighthouse:
- Performance: ≥ 90
- Accessibility: ≥ 95  
- SEO: ≥ 90

## 🔗 Links importantes

- **WhatsApp principal**: https://bit.ly/AchaAi
- Todas as configurações em: `src/lib/config.ts`
- Dados editáveis em: `src/data/`
- Hooks customizados em: `src/hooks/`
- Componentes UI em: `src/components/ui/`

## 🚀 Novos Hooks

### useScrollSpy
```typescript
const activeSection = useScrollSpy(['hero', 'about', 'contact']);
```

### useDarkMode
```typescript
const [isDark, setIsDark] = useDarkMode();
```

## 🎨 Novos Componentes UI

- **PhoneMockup**: Mockup realista de celular com conversa
- **ExampleCarousel**: Carrossel animado de exemplos
- **TrustBadge**: Selos de confiança
- **Avatar**: Avatar com fallback automático
- **DarkModeToggle**: Toggle de tema

## 📝 Melhorias de Conteúdo

### Bot Esclarecido
Agora fica claro que o bot apenas informa endereço e contato das lojas, não faz pedidos nem entregas.

### Microcopy de Confiança
- "Lojas verificadas"
- "Sem cadastro necessário"  
- "Resposta em minutos"
- "Gratuito"

### Seção de Impacto
Nova seção destacando o impacto positivo na economia local, sustentabilidade e geração de empregos.