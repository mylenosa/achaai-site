// src/services/DashboardService.ts
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
  tipo: 'WPP' | 'MAPA'; // Foco apenas em eventos de alto valor
  ts: Date;
  termo?: string;
}

export interface TipSemResultado {
  termo: string;
  qtd: number;
}

export interface TopItemMeu {
  nome: string;
  exibicoes: number;
  conversas: number;
  ctr: number;
  meuPreco?: number | null;
  mediana?: number | null;
  diffPct?: number | null;
}

export interface TopItemGeral {
  nome: string;
  mediana: number;
  lojas: number;
  hasMine: boolean;
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
      impressoes: serie.delta,
      ctr:      (Math.random() - 0.5) * 0.2,
    };
    const kpis: KPIData = { whatsapp, mapa, impressoes, ctr, deltaKpis };

    // 3. Gera o resto dos dados
    const topMeus = termosBase.map((nome) => { // CORREÇÃO: A variável aqui se chama 'nome'
      const exibicoes = rndInt(40, 900);
      const conversas = rndInt(3, Math.max(5, Math.floor(exibicoes * 0.25)));
      const hasMeu = Math.random() < 0.6;
      const mediana = Math.random() < 0.75 ? rndInt(15, 350) : null;
      const meuPreco = hasMeu ? rndInt(10, 400) : null;
      // Usamos a variável 'nome' que já existe no escopo do map.
      const diff = calcDiffPct(meuPreco, mediana);

      return { nome, exibicoes, conversas, ctr: conversas / Math.max(exibicoes, 1), meuPreco, mediana, diffPct: diff };
    }).sort((a, b) => b.conversas - a.conversas);

    const topGeral = termosBase.map((nome) => ({
      nome,
      mediana: rndInt(15, 350),
      lojas: rndInt(2, 15),
      hasMine: Math.random() < 0.5
    })).sort((a, b) => b.lojas - a.lojas);

    const activities: AtividadeRecente[] = Array.from({ length: 8 }).map(() => ({
        tipo: ['WPP', 'MAPA'][rndInt(0, 1)] as 'WPP' | 'MAPA',
        ts: new Date(Date.now() - rndInt(1, 48) * 3600 * 1000)
    })).sort((a, b) => b.ts.getTime() - a.ts.getTime());
    
    const tips = ['furadeira de impacto', 'serrote', 'broca 12mm', 'cola epóxi', 'serra circular']
        .map((termo) => ({ termo, qtd: rndInt(2, 24) }))
        .sort((a, b) => b.qtd - a.qtd).slice(0, 5);

    return { kpis, serie, topMeus, topGeral, activities, tips };
  }

  return { getDashboardData };
}