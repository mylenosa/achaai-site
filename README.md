# 🔍 AchaAí - Plataforma de Busca Local

> **Plataforma que conecta consumidores e lojistas via WhatsApp em Ariquemes-RO**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Arquitetura SOLID](#arquitetura-solid)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração](#configuração)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

O **AchaAí** é uma plataforma inovadora que permite aos consumidores encontrar produtos em lojas físicas de Ariquemes-RO através do WhatsApp. A solução conecta a demanda local com o estoque disponível, otimizando o comércio da cidade.

### Funcionalidades Principais:
- 🔍 **Busca via WhatsApp** - Interface familiar para todos os usuários
- 🏪 **Gestão de Estoque** - Lojas podem cadastrar e atualizar produtos
- 📊 **Analytics** - Relatórios de demanda e performance
- 💰 **Planos Flexíveis** - Desde gratuito até enterprise
- 📧 **E-mails Pré-formatados** - CTAs geram contatos estruturados

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Build Tool**: Vite
- **Deploy**: Vercel (automático)
- **Domínio**: `achai.arikeme.com` (configurado)

## 🏗️ Arquitetura SOLID

Este projeto segue rigorosamente os princípios SOLID para garantir código limpo, testável e extensível:

### **S** - Single Responsibility Principle
Cada componente tem uma responsabilidade específica:
```typescript
// ✅ Correto - Responsabilidade única
export const Hero: React.FC = () => { /* Apenas seção hero */ }
export const Pricing: React.FC = () => { /* Apenas seção de preços */ }
```

### **O** - Open/Closed Principle
Componentes extensíveis sem modificação:
```typescript
// ✅ Extensível via props e configuração
export const CTAButton: React.FC<CTAButtonProps> = ({ variant, size, ... })
```

### **L** - Liskov Substitution Principle
Interfaces consistentes:
```typescript
// ✅ WhatsAppButton implementa CTAButtonProps
export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ ... })
```

### **I** - Interface Segregation Principle
Interfaces específicas e enxutas:
```typescript
// ✅ Props específicas para cada contexto
interface PricingCardProps { plan: PricingPlan; index: number; }
interface WhatsAppButtonProps extends Omit<CTAButtonProps, 'href'> { ... }
```

### **D** - Dependency Inversion Principle
Configurações centralizadas e injetáveis:
```typescript
// ✅ Dependências abstraídas em config
import { config } from '../lib/config';
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd achai-platform

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Scripts Disponíveis
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Verificação de código
```

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes React (SRP)
│   ├── ui/                 # Componentes base reutilizáveis
│   │   ├── CTAButton.tsx   # Botão genérico para CTAs
│   │   └── WhatsAppButton.tsx # Botão específico WhatsApp
│   ├── Pricing/            # Módulo de preços
│   │   ├── Pricing.tsx     # Container principal
│   │   └── PricingCard.tsx # Card individual
│   ├── Header.tsx          # Cabeçalho da aplicação
│   ├── Hero.tsx           # Seção principal
│   ├── HowItWorks.tsx     # Como funciona
│   ├── KPIs.tsx           # Métricas e números
│   ├── ForStores.tsx      # Seção para lojistas
│   ├── Testimonials.tsx   # Depoimentos
│   ├── FAQ.tsx            # Perguntas frequentes
│   ├── FinalCTA.tsx       # CTA final
│   └── Footer.tsx         # Rodapé
├── data/                   # Dados configuráveis (OCP)
│   ├── plans.ts           # Planos de preço
│   ├── faqs.ts            # Perguntas frequentes
│   ├── kpis.ts            # Métricas
│   ├── testimonials.ts    # Depoimentos
│   └── steps.ts           # Passos do "como funciona"
├── lib/                    # Utilitários e configurações
│   ├── config.ts          # Configuração central (DIP)
│   ├── types.ts           # Interfaces TypeScript (ISP)
│   └── utils.ts           # Funções utilitárias (SRP)
├── App.tsx                # Componente raiz
├── main.tsx              # Entry point
└── index.css             # Estilos globais
```

## ⚙️ Configuração

### Configuração Principal
Edite `src/lib/config.ts` para personalizar:

```typescript
export const config = {
  app: {
    name: 'AchaAí',                    // Nome da plataforma
    city: 'Ariquemes',                 // Sua cidade
    state: 'RO',                       // Seu estado
    whatsappUrl: 'https://bit.ly/AchaAi', // Link do WhatsApp
    contactEmail: 'contato@arikeme.com',   // E-mail de contato
  },
  seo: {
    title: 'AchaAí - Plataforma de Busca Local via WhatsApp',
    description: 'Encontre produtos em lojas físicas...',
    keywords: 'busca local, produtos, Ariquemes, WhatsApp',
  }
}
```

### Favicon
1. Adicione `favicon.ico` na pasta `public/`
2. Formatos suportados: `.ico`, `.svg`, `.png`
3. Tamanhos recomendados: 16x16, 32x32, 48x48 pixels

## 🔧 Desenvolvimento

### Adicionando Novos Componentes

1. **Crie o componente** seguindo SRP:
```typescript
// src/components/NovoComponente.tsx
// Single Responsibility: [Descreva a responsabilidade]
import React from 'react';

export const NovoComponente: React.FC = () => {
  return (
    <section className="py-20">
      {/* Conteúdo do componente */}
    </section>
  );
};
```

2. **Adicione ao App.tsx**:
```typescript
import { NovoComponente } from './components/NovoComponente';

// No JSX
<NovoComponente />
```

### Adicionando Dados Configuráveis

1. **Crie arquivo de dados** em `src/data/`:
```typescript
// src/data/novos-dados.ts
export const novosDados = [
  {
    id: '1',
    titulo: 'Exemplo',
    descricao: 'Descrição do exemplo'
  }
];
```

2. **Importe no componente**:
```typescript
import { novosDados } from '../data/novos-dados';
```

### Adicionando Novas Interfaces

1. **Defina tipos** em `src/lib/types.ts`:
```typescript
export interface NovoTipo {
  id: string;
  titulo: string;
  descricao: string;
}
```

### Padrões de Código

- **Componentes**: PascalCase (`MeuComponente.tsx`)
- **Arquivos de dados**: kebab-case (`meus-dados.ts`)
- **Interfaces**: PascalCase (`MinhaInterface`)
- **Funções**: camelCase (`minhaFuncao`)

### Convenções de Comentários
```typescript
// Single Responsibility: [Descreva a responsabilidade única]
// Open/Closed: [Como é extensível]
// Liskov Substitution: [Como implementa interfaces]
// Interface Segregation: [Interfaces específicas]
// Dependency Inversion: [Dependências abstraídas]
```

## 🚀 Deploy

### Deploy Automático (Vercel)

O projeto está configurado para deploy automático:

1. **Push para main** → Deploy automático
2. **Pull Requests** → Preview deployments
3. **Domínio**: `achai.arikeme.com` (já configurado)

### Configuração Manual (se necessário)

```bash
# Build local
npm run build

# Preview do build
npm run preview
```

### Variáveis de Ambiente (Produção)

No painel do Vercel, configure:
```
GA_MEASUREMENT_ID=seu-google-analytics-id
FB_PIXEL_ID=seu-facebook-pixel-id
```

## 🤝 Contribuição

### Fluxo de Desenvolvimento

1. **Clone e configure**:
```bash
git clone <repository-url>
cd achai-platform
npm install
```

2. **Crie uma branch**:
```bash
git checkout -b feature/nova-funcionalidade
```

3. **Desenvolva seguindo SOLID**:
   - Uma responsabilidade por componente
   - Dados configuráveis em `src/data/`
   - Tipos em `src/lib/types.ts`
   - Configurações em `src/lib/config.ts`

4. **Teste localmente**:
```bash
npm run dev
npm run build  # Verificar se builda sem erros
```

5. **Commit e push**:
```bash
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push origin feature/nova-funcionalidade
```

6. **Abra Pull Request** para `main`

### Diretrizes de Código

- ✅ **Siga os princípios SOLID**
- ✅ **Mantenha componentes < 200 linhas**
- ✅ **Use TypeScript rigorosamente**
- ✅ **Adicione comentários SOLID**
- ✅ **Teste responsividade**
- ✅ **Verifique acessibilidade**

### Adicionando Funcionalidades

#### Nova Seção na Landing Page:
1. Crie componente em `src/components/`
2. Adicione dados em `src/data/` (se necessário)
3. Importe no `src/App.tsx`
4. Adicione link no `src/components/Header.tsx`

#### Novo Plano de Preço:
1. Adicione objeto em `src/data/plans.ts`
2. O componente `PricingCard` renderiza automaticamente

#### Nova Pergunta FAQ:
1. Adicione objeto em `src/data/faqs.ts`
2. O componente `FAQ` renderiza automaticamente

## 📊 Analytics e Tracking

### Eventos Rastreados:
- `whatsapp-hero` - Botão principal do topo
- `whatsapp-final` - Botão do CTA final
- `contact-plan-free` - Plano gratuito
- `contact-plan-pro` - Plano pro
- `contact-plan-enterprise` - Plano enterprise
- `contact-stores` - Contato para lojistas

### Configuração:
Substitua os IDs no `index.html`:
- `GA_MEASUREMENT_ID` → Seu Google Analytics ID
- `FB_PIXEL_ID` → Seu Facebook Pixel ID

## 🆘 Troubleshooting

### Erro de Build
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro de Desenvolvimento
```bash
# Verificar sintaxe TypeScript
npm run lint

# Reiniciar servidor
npm run dev
```

### Favicon não Aparece
1. Verifique se `favicon.ico` está em `public/`
2. Limpe cache do browser (Ctrl+F5)
3. Verifique console do browser por erros

## 📞 Suporte

**Desenvolvido pelo Grupo Arikeme**
- 🌐 **Site**: https://achai.arikeme.com
- 📧 **E-mail**: contato@arikeme.com
- 💬 **WhatsApp**: https://bit.ly/AchaAi

---

## 📄 Licença

Este projeto é propriedade do Grupo Arikeme. Todos os direitos reservados.

---

**💡 Para Desenvolvedores**: Comece explorando `src/lib/config.ts` e `src/data/` para entender a estrutura de dados. Todos os componentes seguem SOLID e são facilmente extensíveis.