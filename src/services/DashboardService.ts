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

// --- SIMULAÇÃO DO BANCO DE DADOS ---

// 1. Perfil da Loja do Usuário Logado
const mockStoreProfile = {
  id: 'loja-do-usuario',
  name: 'Casa das Ferramentas',
  categories: ['Ferramentas', 'Casa e Construção'],
  inventory: [
    { nome: 'Furadeira 500W', preco: 189.90 },
    { nome: 'Martelo pena', preco: 45.50 },
    { nome: 'Serra Tico-Tico', preco: 250.00 },
  ]
};

// 2. Outras Lojas na Cidade (nosso "universo de dados")
const outrasLojas = [
  { id: 'loja-b', name: 'Rei das Tintas', categories: ['Tintas', 'Casa e Construção'], inventory: [{ nome: 'Tinta Spray Vermelha', preco: 22.00 }, { nome: 'Verniz Marítimo', preco: 55.00 }] },
  { id: 'loja-c', name: 'ConstruTudo', categories: ['Materiais de Construção', 'Casa e Construção'], inventory: [{ nome: 'Cimento 50kg', preco: 28.00 }, { nome: 'Furadeira 500W', preco: 175.00 }] },
  { id: 'loja-d', name: 'Auto Peças Veloz', categories: ['Automotivo'], inventory: [{ nome: 'WD-40 300ml', preco: 35.00 }, { nome: 'Pneu Aro 15', preco: 450.00 }] },
  { id: 'loja-e', name: 'Faz-Tudo do Bairro', categories: ['Ferramentas'], inventory: [{ nome: 'Parafusadeira', preco: 320.00 }, { nome: 'Furadeira 500W', preco: 199.00 }] },
];

// 3. Buscas sem resultado na plataforma
const buscasSemResultado = [
  { termo: 'furadeira de impacto', qtd: 25 },
  { termo: 'serrote', qtd: 18 },
  { termo: 'cola epóxi', qtd: 12 },
  { termo: 'filtro de óleo', qtd: 9 }, // Menos relevante para a loja do usuário
];

// --- FIM DA SIMULAÇÃO ---


const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const calcDiffPct = (meu?: number | null, mediana?: number | null): number | null => {
  if (meu == null || mediana == null || mediana <= 0) return null;
  return (meu - mediana) / mediana;
};

export function createDashboardService() {
  type Period = '7d' | '30d';
  
  const getDashboardData = (periodo: Period, storeProfile: typeof mockStoreProfile) => {
    // --- LÓGICA PRINCIPAL ---

    // 1. Encontrar lojas "vizinhas" (com pelo menos uma categoria em comum)
    const lojasVizinhas = outrasLojas.filter(loja => 
      loja.categories.some(cat => storeProfile.categories.includes(cat))
    );

    // 2. Agregar todos os produtos das lojas vizinhas para análise de mercado
    const mercadoRelevante: { [key: string]: { precos: number[], lojas: number } } = {};
    lojasVizinhas.forEach(loja => {
      loja.inventory.forEach(item => {
        if (!mercadoRelevante[item.nome]) {
          mercadoRelevante[item.nome] = { precos: [], lojas: 0 };
        }
        if(item.preco) mercadoRelevante[item.nome].precos.push(item.preco);
        mercadoRelevante[item.nome].lojas++;
      });
    });

    // 3. Calcular "Top 5 Geral" com base no mercado relevante
    const topGeral: TopItemGeral[] = Object.entries(mercadoRelevante)
      .map(([nome, data]) => {
        const meuItem = storeProfile.inventory.find(i => i.nome === nome);
        const precosOrdenados = [...data.precos].sort((a, b) => a - b);
        const mediana = precosOrdenados.length > 0 ? precosOrdenados[Math.floor(precosOrdenados.length / 2)] : null;
        
        return {
          nome,
          interesses: rndInt(10, 200), // Simulação de interesse
          mediana,
          lojas: data.lojas,
          hasMine: !!meuItem,
          meuPreco: meuItem?.preco ?? null,
          diffPct: calcDiffPct(meuItem?.preco, mediana)
        };
      })
      .sort((a, b) => b.interesses - a.interesses)
      .slice(0, 5);

    // 4. Calcular "Top 5 Meu" com base no inventário da própria loja
    const topMeus: TopItemMeu[] = storeProfile.inventory
      .map(item => {
        const itemMercado = mercadoRelevante[item.nome];
        const mediana = itemMercado ? topGeral.find(i => i.nome === item.nome)?.mediana ?? null : null;
        return {
          nome: item.nome,
          interesses: rndInt(10, 200),
          meuPreco: item.preco,
          mediana,
          lojas: itemMercado?.lojas ?? 1,
          diffPct: calcDiffPct(item.preco, mediana)
        };
      })
      .sort((a, b) => b.interesses - a.interesses)
      .slice(0, 5);
      
    // --- Dados Genéricos (KPIs, Gráficos) ---
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

    const activities: AtividadeRecente[] = Array.from({ length: 8 }).map(() => ({
        tipo: ['WPP', 'MAPA'][rndInt(0, 1)] as 'WPP' | 'MAPA',
        ts: new Date(Date.now() - rndInt(1, 48) * 3600 * 1000)
    })).sort((a, b) => b.ts.getTime() - a.ts.getTime());
    
    // As dicas são simplesmente as buscas sem resultado, sem filtro de categoria
    const tips = buscasSemResultado.sort((a, b) => b.qtd - a.qtd).slice(0, 5);

    return { kpis, serie, topMeus, topGeral, activities, tips, storeProfile };
  }

  return { getDashboardData, mockStoreProfile }; // Exporta o mock para ser usado na página
}

export * from './DashboardService';