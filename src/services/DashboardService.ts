// src/services/DashboardService.ts (versão com dados consistentes)
// Single Responsibility: Serviço de dados do Dashboard (sem JSX/React)
// Open/Closed: Fácil de trocar mocks por chamadas reais depois
// Dependency Inversion: Página consome a interface (factory) e não detalhes

// ==== Tipos expostos (usados pela página e componentes) ====
export interface KPIData {
  whatsapp: number;
  mapa: number;
  impressoes: number;
  ctr: number; // 0..1
  deltaKpis: {
    whatsapp: number;
    mapa: number;
    impressoes: number;
    ctr: number;
  };
}

export interface SerieData {
  title: string;
  labels: string[];
  values: number[];
  total: number;
  prevTotal: number;
  delta: number;
}

export interface AtividadeRecente {
  tipo: 'BUSCA' | 'MOSTRADO' | 'WPP' | 'MAPA' | 'BUSCA_ZERO';
  ts: Date;             // quando ocorrer backend real, pode virar string ISO
  termo?: string;
  count?: number;       // para BUSCA_ZERO
}

export interface TipSemResultado {
  termo: string;
  qtd: number;
}

export interface TopItemMeu {
  nome: string;
  exibicoes: number;
  conversas: number;
  ctr: number;               // 0..1
  meuPreco?: number | null;  // opcional
  mediana?: number | null;   // mediana na cidade (pode faltar)
  diffPct?: number | null;   // (meuPreco - mediana) / mediana
}

export interface TopItemGeral {
  nome: string;
  mediana: number;
  lojas: number;
  hasMine: boolean;          // se eu tenho esse item no meu estoque
}

// ==== Helpers (mock) ====
const rndInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const calcDiffPct = (meu?: number | null, mediana?: number | null): number | null => {
  if (meu == null || mediana == null || mediana <= 0) return null;
  return (meu - mediana) / mediana;
};

// ==== Factory do service ====
export function createDashboardService() {
  type Period = '7d' | '30d';

  const termosBase = [
    'Furadeira 500W', 'Parafusadeira', 'Martelo pena', 'Chave Phillips 3x20',
    'Serra Tico-Tico', 'Trena 5m', 'Broca Aço 8mm', 'WD-40 300ml',
  ];
  
  // Função unificada para gerar todos os dados do dashboard de forma consistente
  const getDashboardData = (periodo: Period) => {
    // 1. Gera a série de impressões primeiro (Fonte da Verdade)
    let serie: SerieData;
    if (periodo === '7d') {
      const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const values = Array.from({length: 7}, () => Math.floor(Math.random()*401)+50);
      const total = values.reduce((sum, v) => sum + v, 0);
      const prevTotal = Math.floor(total * (1 - (Math.random() - 0.4) * 0.5));
      const delta = prevTotal > 0 ? (total - prevTotal) / prevTotal : 0;
      serie = { title: 'Suas Impressões na Semana', labels, values, total, prevTotal, delta };
    } else {
      const labels = ['Sem 1','Sem 2','Sem 3','Sem 4'];
      const values = Array.from({length: 4}, () => Math.floor(Math.random()*2201)+400);
      const total = values.reduce((sum, v) => sum + v, 0);
      const prevTotal = Math.floor(total * (1 - (Math.random() - 0.4) * 0.5));
      const delta = prevTotal > 0 ? (total - prevTotal) / prevTotal : 0;
      serie = { title: 'Suas Impressões no Mês', labels, values, total, prevTotal, delta };
    }

    // 2. Gera os KPIs USANDO o total de impressões da série
    const impressoes = serie.total;
    const whatsapp = rndInt(Math.floor(impressoes * 0.05), Math.floor(impressoes * 0.15));
    const mapa = rndInt(Math.floor(impressoes * 0.03), Math.floor(impressoes * 0.10));
    const ctr = (whatsapp + mapa) / Math.max(impressoes, 1);
    const deltaKpis = {
      whatsapp: (Math.random() - 0.5) * 0.4,
      mapa:     (Math.random() - 0.5) * 0.4,
      impressoes: serie.delta, // Garante que a variação seja a mesma do gráfico
      ctr:      (Math.random() - 0.5) * 0.2,
    };
    const kpis: KPIData = { whatsapp, mapa, impressoes, ctr, deltaKpis };

    // 3. Gera o resto dos dados (eles não precisam de consistência com os KPIs)
    const topMeus = termosBase.map((nome) => {
      const exibicoes = rndInt(40, 900);
      const conversas = rndInt(3, Math.max(5, Math.floor(exibicoes * 0.25)));
      const ctr = conversas / Math.max(exibicoes, 1);
      const hasMeu = Math.random() < 0.6;
      const mediana = Math.random() < 0.75 ? rndInt(15, 350) : null;
      const meuPreco = hasMeu ? rndInt(10, 400) : null;
      return { nome, exibicoes, conversas, ctr, meuPreco, mediana, diffPct: calcDiffPct(meuPreco, mediana) };
    }).sort((a, b) => b.conversas - a.conversas);

    const topGeral = termosBase.map((nome) => {
      const lojas = rndInt(2, 15);
      const mediana = rndInt(15, 350);
      const hasMine = Math.random() < 0.5;
      return { nome, mediana, lojas, hasMine };
    }).sort((a, b) => b.lojas - a.lojas);

    const activities = Array.from({ length: 12 }).map(() => {
        const tipo: AtividadeRecente['tipo'] = ['BUSCA', 'MOSTRADO', 'WPP', 'MAPA'][rndInt(0, 3)] as any;
        const termo = ['furadeira', 'wd-40', 'parafuso', 'trena', 'broca'][rndInt(0, 4)];
        const ts = new Date(Date.now() - rndInt(1, 72) * 3600 * 1000);
        return { tipo, termo, ts };
    }).sort((a, b) => b.ts.getTime() - a.ts.getTime());
    
    const tips = ['furadeira de impacto', 'serrote', 'broca 12mm', 'cola epóxi', 'serra circular']
        .map((termo) => ({ termo, qtd: rndInt(2, 24) }))
        .sort((a, b) => b.qtd - a.qtd).slice(0, 5);

    // 4. Retorna um único objeto com todos os dados consistentes
    return { kpis, serie, topMeus, topGeral, activities, tips };
  }

  return { getDashboardData };
}