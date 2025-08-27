# 🔍 AchaAí - Encontre Produtos em Ariquemes via WhatsApp

> **Conecte consumidores e lojistas em Ariquemes-RO através do WhatsApp de forma simples e direta**

## ✨ Funcionalidades Principais

- 🔍 **Busca via WhatsApp** - Encontre produtos sem sair do app
- 🏪 **Para Lojistas** - Receba pedidos qualificados
- 📧 **E-mails Pré-formatados** - Botões geram contatos automáticos
- 📱 **100% Responsivo** - Funciona em todos os dispositivos
- 🎨 **Design Moderno** - Interface limpa e profissional
- 🚀 **Performance Otimizada** - Carregamento rápido
- 🔍 **SEO Completo** - Meta tags otimizadas
- 📊 **Analytics Integrado** - Rastreamento de conversões

## 🚀 Começar Rapidamente

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar o projeto
```bash
npm run dev
```

### 3. Abrir no navegador
O projeto abrirá automaticamente em `http://localhost:5173`

### 4. Para produção
```bash
npm run build
```

## 🎯 O que é o AchaAí?

Uma plataforma que permite:
- **Consumidores**: Encontrar produtos em lojas físicas via WhatsApp
- **Lojistas**: Receber pedidos qualificados e gerenciar estoque
- **Cidade**: Fortalecer o comércio local de Ariquemes-RO

## ⚙️ Personalizar para Sua Cidade

### 🏙️ Alterar Informações Básicas
Edite `src/lib/config.ts`:

```typescript
export const config = {
  app: {
    name: 'AchaAí',                    // Nome da plataforma
    teamName: 'Arikeme',               // Nome do seu grupo/empresa
    city: 'Ariquemes',                 // ← Sua cidade aqui
    state: 'RO',                       // ← Seu estado aqui
    domain: 'achai.arikeme.com',       // ← Seu domínio aqui
    whatsappUrl: 'https://bit.ly/AchaAi', // ← Seu link do WhatsApp
    contactEmail: 'contato@arikeme.com',  // ← Seu e-mail aqui
  }
}
```

### 💰 Configurar Planos de Preço
Edite `src/data/plans.ts`:

```typescript
export const pricingPlans = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',                    // ← Altere o preço
    period: '/mês',
    description: 'Ideal para começar', // ← Altere a descrição
    features: [
      'Até 50 itens no catálogo',     // ← Altere as funcionalidades
      'Receber pedidos via WhatsApp',
      // Adicione mais features aqui
    ],
    ctaText: 'Começar Grátis',        // ← Altere o texto do botão
    ctaType: 'contact'                // 'contact' = e-mail | 'whatsapp' = WhatsApp
  }
  // Adicione mais planos copiando a estrutura acima
]
```

### ❓ Editar Perguntas Frequentes
Edite `src/data/faqs.ts`:

```typescript
export const faqs = [
  {
    id: '1',
    question: 'Preciso baixar algum app?',        // ← Sua pergunta
    answer: 'Não! Tudo funciona 100% pelo WhatsApp...' // ← Sua resposta
  },
  // Adicione mais FAQs copiando a estrutura acima
]
```

### 📊 Atualizar Números/Métricas
Edite `src/data/kpis.ts`:

```typescript
export const kpis = [
  {
    id: '1',
    value: '+5 mil',           // ← Seu número aqui
    label: 'buscas realizadas', // ← Sua descrição aqui
    icon: 'search'             // Ícones: search, clock, store, target
  }
  // Adicione mais métricas copiando a estrutura acima
]
```

### 💬 Modificar Depoimentos
Edite `src/data/testimonials.ts`:

```typescript
export const testimonials = [
  {
    id: '1',
    name: 'Daniel',                    // ← Nome da pessoa
    location: 'Jardim Europa',         // ← Bairro ou nome da loja
    content: 'Achei WD-40 em 2 minutos...', // ← Depoimento
    type: 'customer'                   // 'customer' = cliente | 'store' = loja
  }
  // Adicione mais depoimentos copiando a estrutura acima
]
```

### 🎨 Alterar Cores do Site
No `src/lib/config.ts`, seção theme:

```typescript
theme: {
  primary: 'emerald',    // Verde principal (emerald, blue, purple, red, etc.)
  secondary: 'blue',     // Cor secundária
  accent: 'green',       // Cor de destaque
}
```

## 📱 Como Funciona o Site

### Seções Principais:
1. **Hero** - Apresentação inicial com botão do WhatsApp
2. **Como Funciona** - 3 passos simples
3. **Métricas (KPIs)** - Números de sucesso
4. **Para Lojas** - Benefícios para lojistas
5. **Planos** - Preços e funcionalidades
6. **Depoimentos** - Feedback de usuários
7. **FAQ** - Perguntas frequentes
8. **CTA Final** - Último chamado para ação

### Funcionalidades Especiais:
- ✅ **E-mails automáticos** - Botões dos planos geram e-mails pré-prontos
- ✅ **WhatsApp integrado** - Links diretos para conversas
- ✅ **Responsivo** - Funciona em celular, tablet e desktop
- ✅ **Animações suaves** - Transições profissionais
- ✅ **SEO otimizado** - Meta tags configuradas

## 🌐 Colocar no Ar (Deploy)

### Opção 1: Netlify (Mais Fácil)
1. Faça uma conta no [Netlify](https://netlify.com)
2. Conecte seu repositório GitHub
3. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Deploy automático a cada commit!

### Opção 2: Vercel
1. Faça uma conta no [Vercel](https://vercel.com)
2. Importe seu projeto do GitHub
3. Deploy automático configurado!

### Opção 3: Qualquer Hospedagem
1. Execute `npm run build`
2. Suba a pasta `dist/` para seu servidor
3. Configure domínio e SSL

## 📈 Analytics e Tracking

### Configurar Google Analytics
1. No `index.html`, substitua `GA_MEASUREMENT_ID` pelo seu ID real
2. Os botões já têm tracking automático configurado

### Botões que são Rastreados:
- `whatsapp-hero` - Botão principal do topo
- `whatsapp-stores` - Botão para lojistas
- `whatsapp-final` - Botão do final da página
- `contact-plan-free` - Botão do plano gratuito
- `contact-plan-pro` - Botão do plano pro
- `contact-plan-enterprise` - Botão do plano enterprise

## 🛠️ Estrutura dos Arquivos

```
src/
├── components/          # Componentes da interface
│   ├── ui/             # Botões e elementos básicos
│   ├── Pricing/        # Seção de preços
│   ├── Header.tsx      # Cabeçalho
│   ├── Hero.tsx        # Seção principal
│   ├── HowItWorks.tsx  # Como funciona
│   ├── KPIs.tsx        # Métricas
│   ├── ForStores.tsx   # Para lojistas
│   ├── Testimonials.tsx # Depoimentos
│   ├── FAQ.tsx         # Perguntas frequentes
│   ├── FinalCTA.tsx    # Chamada final
│   └── Footer.tsx      # Rodapé
├── data/               # ← ARQUIVOS PARA EDITAR
│   ├── plans.ts        # ← Planos de preço
│   ├── faqs.ts         # ← Perguntas frequentes
│   ├── kpis.ts         # ← Números/métricas
│   ├── testimonials.ts # ← Depoimentos
│   └── steps.ts        # Passos do "como funciona"
├── lib/
│   ├── config.ts       # ← CONFIGURAÇÃO PRINCIPAL
│   ├── types.ts        # Tipos do TypeScript
│   └── utils.ts        # Funções auxiliares
└── App.tsx             # Aplicação principal
```

## 🎯 Dicas Importantes

### ✅ Para Modificar Conteúdo:
- **Textos gerais**: `src/lib/config.ts`
- **Planos**: `src/data/plans.ts`
- **FAQs**: `src/data/faqs.ts`
- **Números**: `src/data/kpis.ts`
- **Depoimentos**: `src/data/testimonials.ts`

### ✅ Para Modificar Visual:
- **Cores**: `src/lib/config.ts` (seção theme)
- **Layout**: Arquivos em `src/components/`

### ✅ Para Adicionar Funcionalidades:
- Crie novos componentes em `src/components/`
- Adicione dados em `src/data/`
- Importe no `src/App.tsx`

## 🎨 Otimizações Implementadas

### 🌐 **Internacionalização**
- ✅ Idioma definido como `pt-BR` no HTML
- ✅ Meta tags em português brasileiro
- ✅ Locale correto para SEO

### 🎯 **UX/UI Melhorado**
- ✅ Sombras uniformizadas em todos os cards
- ✅ Transições suaves e consistentes
- ✅ Página 404 personalizada com imagem
- ✅ Botões com feedback visual

### 📧 **E-mails Profissionais**
- ✅ Links mailto com codificação %20 (não +)
- ✅ Corpo de e-mail estruturado e limpo
- ✅ Assuntos personalizados por plano

### 🔍 **SEO Otimizado**
- ✅ Meta tags atualizadas e específicas
- ✅ Descrições mais detalhadas
- ✅ Keywords regionais (Ariquemes, Rondônia)
- ✅ Open Graph e Twitter Cards

## 🆘 Problemas Comuns

### Site não abre?
```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erro de build?
```bash
# Verifique se todos os arquivos estão salvos
# Execute o build para testar
npm run build
```

### WhatsApp não funciona?
- Verifique se o `whatsappUrl` em `config.ts` está correto
- Teste o link manualmente no navegador

## 📞 Suporte

**Desenvolvido pelo Grupo Arikeme**
- 🌐 Site: https://achai.arikeme.com
- 📧 E-mail: contato@arikeme.com
- 💬 WhatsApp: https://bit.ly/AchaAi

---

**💡 Dica**: Comece editando apenas os arquivos da pasta `src/data/` e `src/lib/config.ts`. Eles contêm 90% do que você precisa personalizar!