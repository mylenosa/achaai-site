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
  // Adicionado categoria
  categoria: string;
}
export interface TopItemMeu {
  nome: string;
  interesses: number;
  meuPreco?: number | null;
  mediana?: number | null;
  diffPct?: number | null;
  lojas?: number;
  // Adicionado categoria
  categoria: string;
}
export interface TopItemGeral {
  nome: string;
  interesses: number;
  mediana: number | null;
  lojas: number;
  hasMine: boolean;
  meuPreco?: number | null;
  diffPct?: number | null;
  // Adicionado categoria
  categoria: string;
}

// Simulação de Perfil de Loja com categorias
// No futuro, isso virá do seu AuthContext ou API
const mockStoreProfile = {
  categories: ['Ferramentas', 'Tintas', 'Materiais de Construção']
};


const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const calcDiffPct = (meu?: number | null, mediana?: number | null): number | null => {
  if (meu == null || mediana == null || mediana <= 0) return null;
  return (meu - mediana) / mediana;
};

export function createDashboardService() {
  type Period = '7d' | '30d';

  // Base de dados com categorias
  const termosBase = [
    { nome: 'Furadeira 500W', categoria: 'Ferramentas' },
    { nome: 'Parafusadeira', categoria: 'Ferramentas' },
    { nome: 'Martelo pena', categoria: 'Ferramentas' },
    { nome: 'Tinta Spray Vermelha', categoria: 'Tintas' },
    { nome: 'Serra Tico-Tico', categoria: 'Ferramentas' },
    { nome: 'Cimento 50kg', categoria: 'Materiais de Construção' },
    { nome: 'Broca Aço 8mm', categoria: 'Ferramentas' },
    { nome: 'WD-40 300ml', categoria: 'Automotivo' }, // Item fora da categoria da loja
  ];
  
  // A função agora pode receber as categorias da loja
  const getDashboardData = (periodo: Period, storeCategories: string[]) => {
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

    const unifiedItems = termosBase.map(item => {
        const hasMeu = Math.random() < 0.8;
        const meuPreco = hasMeu && Math.random() < 0.7 ? rndInt(10, 400) : null;
        const lojas = rndInt(2, 15);
        const mediana = lojas > 1 ? rndInt(15, 350) : null;
        const diffPct = calcDiffPct(meuPreco, mediana);
        const interesses = rndInt(3, 160);
        return { ...item, interesses, meuPreco, mediana, lojas, hasMine: hasMeu, diffPct };
    });

    // Filtra os itens com base nas categorias da loja
    const topMeus = [...unifiedItems].filter(p => p.hasMine && storeCategories.includes(p.categoria)).sort((a, b) => b.interesses - a.interesses);
    const topGeral = [...unifiedItems].filter(p => storeCategories.includes(p.categoria)).sort((a, b) => b.interesses - a.interesses);

    const activities: AtividadeRecente[] = Array.from({ length: 8 }).map(() => ({
        tipo: ['WPP', 'MAPA'][rndInt(0, 1)] as 'WPP' | 'MAPA',
        ts: new Date(Date.now() - rndInt(1, 48) * 3600 * 1000)
    })).sort((a, b) => b.ts.getTime() - a.ts.getTime());
    
    const tipsBase = [
        { termo: 'furadeira de impacto', categoria: 'Ferramentas' }, 
        { termo: 'serrote', categoria: 'Ferramentas' }, 
        { termo: 'broca 12mm', categoria: 'Ferramentas' }, 
        { termo: 'cola epóxi', categoria: 'Materiais de Construção' }, 
        { termo: 'verniz marítimo', categoria: 'Tintas' },
        { termo: 'pneu aro 15', categoria: 'Automotivo' } // Fora da categoria
      ];
      
    // Filtra as oportunidades com base nas categorias
    const tips = tipsBase
        .filter(tip => storeCategories.includes(tip.categoria))
        .map((tip) => ({ ...tip, qtd: rndInt(2, 24) }))
        .sort((a, b) => b.qtd - a.qtd).slice(0, 5);

    return { kpis, serie, topMeus, topGeral, activities, tips, storeProfile: mockStoreProfile };
  }

  return { getDashboardData };
}

export * from './DashboardService';