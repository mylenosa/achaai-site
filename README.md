# 🔍 AchaAí - Encontre Produtos em Ariquemes via WhatsApp

> **Conecte consumidores e lojistas em Ariquemes-RO através do WhatsApp de forma simples e direta**

## ✨ Funcionalidades Principais

### Para Consumidores
- 🔍 **Busca via WhatsApp** - Encontre produtos sem sair do app
- 📱 **100% Responsivo** - Funciona em todos os dispositivos
- ⚡ **Respostas Rápidas** - Encontre produtos em minutos
- 🎯 **Busca Inteligente** - Sistema encontra exatamente o que você precisa

### Para Lojistas
- 🏪 **Portal Completo** - Dashboard para gerenciar sua loja
- 📊 **Analytics Detalhados** - Acompanhe visualizações e cliques
- 📦 **Gestão de Estoque** - Adicione produtos manualmente ou via planilha
- 💬 **Pedidos Qualificados** - Receba apenas clientes interessados
- ⏰ **Horários Flexíveis** - Configure horários de funcionamento
- 📍 **Localização Automática** - Busca de CEP integrada

## 🚀 Começar Rapidamente

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar o projeto
```bash
npm run dev
```

### 3. Configurar Supabase (Para Portal do Lojista)
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas credenciais do Supabase
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Nota**: O portal do lojista (`/login` e `/dashboard`) requer configuração do Supabase. O site principal funciona normalmente sem essas variáveis.

### 4. Abrir no navegador
O projeto abrirá automaticamente em `http://localhost:5173`

### 5. Para produção
```bash
npm run build
```

## 🎯 O que é o AchaAí?

Uma plataforma inovadora que permite:

### 👥 **Para Consumidores**
- Encontrar produtos em lojas físicas via WhatsApp
- Receber lista de lojas que têm o produto disponível
- Contato direto com o lojista
- Sem necessidade de cadastro ou download de app

### 🏪 **Para Lojistas**
- Receber pedidos qualificados via WhatsApp
- Dashboard completo para gestão
- Analytics de performance
- Gestão de estoque simplificada
- Perfil da loja editável

### 🌍 **Para a Cidade**
- Fortalecer o comércio local de Ariquemes-RO
- Conectar oferta e demanda
- Reduzir tempo de busca por produtos
- Aumentar vendas das lojas locais

## 🏪 Portal do Lojista

### 🔐 Funcionalidades de Autenticação
- **Login seguro** via email/senha ou Google
- **Magic Link** para login sem senha
- **Reset de senha** via email
- **Dashboard protegido** com informações da loja

### 📊 Dashboard Completo
- **Analytics em tempo real** - Visualizações, cliques, conversões
- **Gestão de estoque** - Adicionar produtos manual ou via CSV/Excel
- **Perfil da loja** - Nome, descrição, categorias, horários
- **Configurações** - Personalização da conta

### 🛣️ Rotas Disponíveis
- `/` - Site principal (público)
- `/login` - Login do lojista
- `/dashboard` - Dashboard do lojista (protegido)
- `/reset-password` - Redefinição de senha

### 🗄️ Estrutura do Banco (Supabase)

#### Tabela de Perfis das Lojas
```sql
CREATE TABLE store_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  whatsapp text NOT NULL,
  categories text[] DEFAULT '{}',
  cep text NOT NULL,
  street text NOT NULL,
  number text NOT NULL,
  neighborhood text NOT NULL,
  city text DEFAULT 'Ariquemes',
  state text DEFAULT 'RO',
  address text NOT NULL,
  opening_hours text DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE store_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can read own profile"
  ON store_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON store_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON store_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## 📦 Gestão de Estoque

### 📝 Adicionar Produtos Manualmente
- Formulário simples com título, quantidade e preço
- Validação automática de dados
- Feedback visual de sucesso/erro

### 📊 Importação via Planilha
- **Formatos suportados**: CSV e Excel (.xlsx, .xls)
- **Template disponível**: Download do modelo com exemplos
- **Validação prévia**: Dry-run antes da importação final
- **Mapeamento flexível**: Aceita diferentes nomes de colunas

#### Colunas Aceitas na Planilha:
- `external_id` ou `sku` - Código do produto
- `titulo` ou `nome` - Nome do produto
- `preco` ou `valor` - Preço (aceita vírgula ou ponto)
- `quantidade` ou `qtd` - Quantidade em estoque
- `ativo` - Se o produto está ativo (true/false)
- `attrs` - Atributos extras em JSON

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
    whatsappUrl: 'http://chat.arikeme.com', // ← Seu link do WhatsApp
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
- ✅ **Animações suaves** - Transições profissionais com Framer Motion
- ✅ **SEO otimizado** - Meta tags configuradas
- ✅ **PWA Ready** - Manifest e ícones configurados

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **React Router** - Roteamento

### Backend/Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados
- **Real-time** - Atualizações em tempo real

### Ferramentas
- **Vite** - Build tool e dev server
- **ESLint** - Linting de código
- **Papa Parse** - Processamento de CSV
- **XLSX** - Processamento de Excel

## 🌐 Colocar no Ar (Deploy)

### Cloudflare Pages (Recomendado)
1. Conecte seu repositório GitHub ao [Cloudflare Pages](https://pages.cloudflare.com)
2. Configure:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (deixe vazio)
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GA_MEASUREMENT_ID`
4. Deploy automático a cada push!

### Outras Opções
#### Netlify
1. Conecte seu repositório GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`

#### Vercel
1. Importe projeto do GitHub
2. Deploy automático configurado

## 📈 Analytics e Tracking

### Configurar Google Analytics
1. No `index.html`, substitua `%VITE_GA_MEASUREMENT_ID%` pelo seu ID real
2. Configure a variável `VITE_GA_MEASUREMENT_ID` no `.env`
3. Os botões já têm tracking automático configurado

### Eventos Rastreados:
- `whatsapp-hero` - Botão principal do topo
- `whatsapp-stores` - Botão para lojistas
- `whatsapp-final` - Botão do final da página
- `contact-plan-free` - Botão do plano gratuito
- `contact-plan-pro` - Botão do plano pro
- `contact-plan-enterprise` - Botão do plano enterprise

## 🛠️ Estrutura dos Arquivos

```
src/
├── components/              # Componentes da interface
│   ├── ui/                 # Botões e elementos básicos
│   │   ├── CTAButton.tsx   # Botão genérico para CTAs
│   │   └── WhatsAppButton.tsx # Botão específico do WhatsApp
│   ├── auth/               # Componentes de autenticação
│   │   └── ProtectedRoute.tsx # Proteção de rotas
│   ├── dashboard/          # Componentes do dashboard
│   │   ├── DashboardLayout.tsx # Layout principal do dashboard
│   │   ├── Analytics.tsx   # Métricas e gráficos
│   │   ├── StoreProfileForm.tsx # Formulário do perfil da loja
│   │   └── EstoqueTab.tsx  # Gestão de estoque
│   ├── Pricing/            # Seção de preços
│   │   ├── Pricing.tsx     # Container principal
│   │   └── PricingCard.tsx # Card individual de preço
│   ├── Header.tsx          # Cabeçalho
│   ├── Hero.tsx            # Seção principal
│   ├── HowItWorks.tsx      # Como funciona
│   ├── KPIs.tsx            # Métricas
│   ├── ForStores.tsx       # Para lojistas
│   ├── Testimonials.tsx    # Depoimentos
│   ├── FAQ.tsx             # Perguntas frequentes
│   ├── FinalCTA.tsx        # Chamada final
│   ├── Footer.tsx          # Rodapé
│   ├── LandingPage.tsx     # Página principal
│   ├── NotFound.tsx        # Página 404
│   └── ServerError.tsx     # Página de erro 500
├── contexts/               # Contextos React
│   └── AuthContext.tsx     # Contexto de autenticação
├── data/                   # ← ARQUIVOS PARA EDITAR
│   ├── plans.ts            # ← Planos de preço
│   ├── faqs.ts             # ← Perguntas frequentes
│   ├── kpis.ts             # ← Números/métricas
│   ├── testimonials.ts     # ← Depoimentos
│   └── steps.ts            # Passos do "como funciona"
├── hooks/                  # Hooks customizados
│   └── useAuth.ts          # Hook de autenticação
├── lib/                    # Bibliotecas e utilitários
│   ├── config.ts           # ← CONFIGURAÇÃO PRINCIPAL
│   ├── supabase.ts         # Cliente Supabase
│   ├── types.ts            # Tipos TypeScript
│   └── utils.ts            # Funções auxiliares
├── pages/                  # Páginas da aplicação
│   ├── Login.tsx           # Página de login
│   ├── ResetPassword.tsx   # Redefinição de senha
│   └── Dashboard.tsx       # Dashboard principal
├── services/               # Serviços de dados
│   └── StoreService.ts     # Operações da loja
└── App.tsx                 # Aplicação principal com roteamento
```

## 🎯 Funcionalidades Detalhadas

### 🔍 **Sistema de Busca**
- Busca inteligente via WhatsApp
- Matching de produtos por título e atributos
- Resposta automática com lojas disponíveis
- Links diretos para contato

### 📊 **Analytics Avançados**
- Visualizações de perfil em tempo real
- Cliques no WhatsApp rastreados
- Taxa de conversão calculada
- Gráficos de performance semanal
- Atividade recente detalhada

### 📦 **Gestão de Estoque Inteligente**
- **Adição manual**: Formulário simples e rápido
- **Importação em lote**: CSV e Excel suportados
- **Validação prévia**: Dry-run antes da importação
- **Template incluído**: Modelo pronto para download
- **Mapeamento flexível**: Aceita diferentes formatos de planilha

### ⏰ **Horários Flexíveis**
- Configuração por dia da semana
- Múltiplos horários por dia (ex: manhã e tarde)
- Fechamento em dias específicos
- Interface intuitiva de configuração

### 📍 **Localização Automática**
- Busca de CEP via API ViaCEP
- Preenchimento automático de endereço
- Validação de dados de localização
- Endereço completo formatado

## 🎨 Design System

### 🎨 **Cores Principais**
- **Primary**: Emerald (Verde) - `#10b981`
- **Secondary**: Blue (Azul) - `#3b82f6`
- **Success**: Green (Verde) - `#22c55e`
- **Warning**: Yellow (Amarelo) - `#f59e0b`
- **Error**: Red (Vermelho) - `#ef4444`

### 📱 **Responsividade**
- **Mobile First**: Design otimizado para celular
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Botões com tamanho mínimo de 44px
- **Navegação Adaptativa**: Menu hambúrguer no mobile

### ✨ **Animações**
- **Framer Motion**: Animações suaves e profissionais
- **Micro-interações**: Hover states e feedback visual
- **Loading States**: Indicadores de carregamento
- **Transições**: Mudanças de estado suaves

## 🔧 Configurações Avançadas

### 🌐 **SEO Otimizado**
- Meta tags dinâmicas
- Open Graph configurado
- Twitter Cards
- Sitemap.xml incluído
- Robots.txt configurado

### 🚀 **Performance**
- Code splitting automático
- Lazy loading de componentes
- Otimização de imagens
- Cache headers configurados
- Bundle size otimizado

### 🔒 **Segurança**
- Row Level Security no Supabase
- Validação de dados no frontend e backend
- Headers de segurança configurados
- Sanitização de inputs
- Proteção contra XSS

## 🆘 Problemas Comuns

### Site não abre?
```bash
# Limpe e reinstale
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Erro de módulos?
```bash
# Limpe cache do Vite
rm -rf node_modules/.vite
npm run dev
```

### Erro de build?
```bash
# Verifique se todos os arquivos estão salvos
npm run build
```

### WhatsApp não funciona?
- Verifique se o `whatsappUrl` em `config.ts` está correto
- Teste o link manualmente no navegador

### Dashboard não carrega?
- Verifique se as variáveis do Supabase estão configuradas no `.env`
- Confirme se o projeto Supabase está ativo
- Verifique se as tabelas foram criadas corretamente

## 📞 Suporte e Desenvolvimento

**Desenvolvido pelo Grupo Arikeme**
- 🌐 Site: https://achai.arikeme.com
- 📧 E-mail: contato@arikeme.com
- 💬 WhatsApp: http://chat.arikeme.com

### 🔧 **Para Desenvolvedores**
- Arquitetura modular e escalável
- Princípios SOLID aplicados
- Testes unitários configurados
- TypeScript para type safety
- ESLint para qualidade de código

### 🚀 **Roadmap**
- [ ] Sistema de avaliações
- [ ] Chat integrado
- [ ] Notificações push
- [ ] App mobile nativo
- [ ] Expansão para outras cidades

---

**💡 Dica**: Comece editando apenas os arquivos da pasta `src/data/` e `src/lib/config.ts`. Eles contêm 90% do que você precisa personalizar!