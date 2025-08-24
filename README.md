# 🔍 AchaAí - Encontre Produtos em Ariquemes

> **Plataforma que conecta consumidores e lojistas em Ariquemes-RO via WhatsApp**

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar em desenvolvimento
```bash
npm run dev
```

### 3. Gerar build para produção
```bash
npm run build
```

## ⚙️ Como Personalizar

### 🏙️ Alterar Cidade e Links
Edite o arquivo `src/lib/config.ts`:

```typescript
export const config = {
  app: {
    name: 'AchaAí',
    city: 'SUA_CIDADE',           // ← Altere aqui
    state: 'SEU_ESTADO',          // ← Altere aqui
    domain: 'seu-dominio.com',    // ← Altere aqui
    whatsappUrl: 'SEU_LINK_WHATS', // ← Altere aqui
  }
}
```

### 💰 Editar Planos de Preços
Edite `src/data/plans.ts`:

```typescript
export const pricingPlans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',
    features: [
      'Até 50 itens',
      'WhatsApp básico',
      // Adicione mais features aqui
    ]
  }
  // Adicione mais planos aqui
]
```

### ❓ Adicionar/Editar FAQs
Edite `src/data/faqs.ts`:

```typescript
export const faqs = [
  {
    id: '1',
    question: 'Sua pergunta aqui?',
    answer: 'Sua resposta aqui...'
  }
  // Adicione mais FAQs aqui
]
```

### 📊 Atualizar Métricas (KPIs)
Edite `src/data/kpis.ts`:

```typescript
export const kpis = [
  {
    id: '1',
    value: '+10 mil',      // ← Altere o número
    label: 'buscas feitas', // ← Altere a descrição
    icon: 'search'
  }
  // Adicione mais métricas aqui
]
```

### 💬 Modificar Depoimentos
Edite `src/data/testimonials.ts`:

```typescript
export const testimonials = [
  {
    id: '1',
    name: 'Nome da Pessoa',
    location: 'Bairro/Loja',
    content: 'Depoimento aqui...',
    avatar: 'URL_DA_FOTO',
    type: 'customer' // ou 'store'
  }
]
```

## 🎨 Personalizar Cores

No arquivo `src/lib/config.ts`, altere as cores do tema:

```typescript
theme: {
  primary: 'emerald',    // Verde principal
  secondary: 'blue',     // Azul secundário
  accent: 'green',       // Verde de destaque
}
```

Cores disponíveis: `emerald`, `blue`, `green`, `purple`, `red`, `yellow`, `orange`, `pink`

## 📱 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes de interface
│   └── Pricing/        # Componentes de preços
├── data/               # Dados configuráveis
│   ├── plans.ts        # Planos de preço
│   ├── faqs.ts         # Perguntas frequentes
│   ├── kpis.ts         # Métricas
│   └── testimonials.ts # Depoimentos
├── hooks/              # Hooks customizados
├── lib/                # Configurações e tipos
│   ├── config.ts       # ← ARQUIVO PRINCIPAL DE CONFIG
│   └── types.ts        # Tipos TypeScript
└── pages/              # Páginas da aplicação
```

## 📈 Analytics

### Configurar Google Analytics
1. Substitua `GA_MEASUREMENT_ID` no `index.html` pelo seu ID real
2. Os botões já têm `data-cta` attributes para tracking

### Seletores para Tracking
- `data-cta="whatsapp-hero"` - Botão principal
- `data-cta="whatsapp-stores"` - Botão para lojistas
- `data-cta="ver-planos"` - Link para planos
- `data-cta="whatsapp-plan-{id}"` - Botões dos planos

## 🌐 Deploy

### Netlify (Recomendado)
1. Conecte seu repositório
2. Build command: `npm run build`
3. Publish directory: `dist`

### Outros Provedores
O projeto gera arquivos estáticos na pasta `dist/` após `npm run build`

## 🛠️ Tecnologias

- **React 18** + TypeScript
- **Tailwind CSS** para styling
- **Framer Motion** para animações
- **Lucide React** para ícones
- **Vite** para build rápido

## 📞 Suporte

Dúvidas? Entre em contato:
- WhatsApp: https://bit.ly/AchaAi
- Site: https://achai.arikeme.com

---

**Desenvolvido pelo Grupo Arikeme** 🏙️ Fortalecendo Ariquemes-RO