// src/services/DashboardService.ts
export interface KPIData {
  whatsapp: number;
  mapa: number;
  impressoes: number;
  ctr: number;
  deltaKpis: { whatsapp: number; mapa: number; impressoes: number; ctr: number; };
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
  tipo: 'WPP' | 'MAPA';
  ts: Date;
  termo?: string;
}
export interface TipSemResultado {
  termo: string;
  qtd: number;
}
export interface TopItemMeu {
  nome: string;
  interesses: number;
  meuPreco?: number | null;
  mediana?: number | null;
  diffPct?: number | null;
  lojas?: number;
}
export interface TopItemGeral {
  nome: string;
  interesses: number;
  mediana: number | null;
  lojas: number;
  hasMine: boolean;
  meuPreco?: number | null;
  diffPct?: number | null;
}

const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const calcDiffPct = (meu?: number | null, mediana?: number | null): number | null => {
  if (meu == null || mediana == null || mediana <= 0) return null;
  return (meu - mediana) / mediana;
};

export function createDashboardService() {
  type Period = '7d' | '30d';

  const termosBase = [
    'Furadeira 500W', 'Parafusadeira', 'Martelo pena', 'Chave Phillips 3x20',
    'Serra Tico-Tico', 'Trena 5m', 'Broca Aço 8mm', 'WD-40 300ml',
  ];
  
  const getDashboardData = (periodo: Period) => {
    let serie: SerieData;
    if (periodo === '7d') {
      const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const values = Array.from({length: 7}, () => rndInt(50, 450));
      const total = values.reduce((sum, v) => sum + v, 0);
      const prevTotal = Math.floor(total * (1 - (Math.random() - 0.4) * 0.5));
      const delta = prevTotal > 0 ? (total - prevTotal) / prevTotal : 0;
      serie = { title: 'Suas Impressões na Semana', labels, values, total, prevTotal, delta };
    } else {
      const labels = ['Sem 1','Sem 2','Sem 3','Sem 4'];
      const values = Array.from({length: 4}, () => rndInt(400, 2201));
      const total = values.reduce((sum, v) => sum + v, 0);
      const prevTotal = Math.floor(total * (1 - (Math.random() - 0.4) * 0.5));
      const delta = prevTotal > 0 ? (total - prevTotal) / prevTotal : 0;
      serie = { title: 'Suas Impressões no Mês', labels, values, total, prevTotal, delta };
    }

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

    const unifiedItems = termosBase.map(nome => {
        const hasMeu = Math.random() < 0.8;
        const meuPreco = hasMeu && Math.random() < 0.7 ? rndInt(10, 400) : null;
        const lojas = rndInt(2, 15);
        const mediana = lojas > 1 ? rndInt(15, 350) : null;
        const diffPct = calcDiffPct(meuPreco, mediana);
        const interesses = rndInt(3, 160);
        return { nome, interesses, meuPreco, mediana, lojas, hasMine: hasMeu, diffPct };
    });

    const topMeus = [...unifiedItems].filter(p => p.hasMine).sort((a, b) => b.interesses - a.interesses);
    const topGeral = [...unifiedItems].sort((a, b) => b.interesses - a.interesses);

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

export * from './DashboardService';