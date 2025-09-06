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

export interface AtividadeRecente {
  tipo: 'BUSCA' | 'MOSTRADO' | 'WPP' | 'MAPA' | 'BUSCA_ZERO';
  ts: Date;
  termo?: string;
  count?: number;
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
// Calcula diferença percentual com segurança
const calcDiffPct = (myPrice?: number | null, median?: number | null): number | null => {
  if (myPrice == null || median == null || median <= 0) return null;
  return (myPrice - median) / median;
};

const rndInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ==== Alias de período ====
type Period = '7d' | '30d';

// ==== Cache simples por período ====
const cache = {
  kpis: new Map<Period, KPIData>(),
  barras: new Map<Period, number[]>(),
  meus: new Map<Period, TopItemMeu[]>(),
  geral: new Map<Period, TopItemGeral[]>(),
  atividade: new Map<Period, AtividadeRecente[]>(),
  tips: new Map<Period, TipSemResultado[]>(),
};

// ==== Factory do service ====
export function createDashboardService() {
  const termosBase = [
    'Furadeira 500W', 'Parafusadeira', 'Martelo pena', 'Chave Phillips 3x20',
    'Serra Tico-Tico', 'Trena 5m', 'Broca Aço 8mm', 'WD-40 300ml',
  ];

  return {
    getKPIs(periodo: Period): KPIData {
      const hit = cache.kpis.get(periodo);
      if (hit) return hit;

      const impressoes = rndInt(400, 2400);
      const whatsapp = rndInt(30, 250);
      const mapa = rndInt(20, 180);
      const ctr = Number(((whatsapp + mapa) / Math.max(impressoes, 1)).toFixed(3));

      const delta = {
        whatsapp: (Math.random() - 0.5) * 0.4,
        mapa:     (Math.random() - 0.5) * 0.4,
        impressoes:(Math.random() - 0.5) * 0.3,
        ctr:      (Math.random() - 0.5) * 0.2,
      };

      const out = { whatsapp, mapa, impressoes, ctr, deltaKpis: delta };
      cache.kpis.set(periodo, out);
      return out;
    },

    getBarrasSemana(): number[] {
      // barras podem ser independentes de período; se quiser cachear por '7d/30d':
      const p: Period = '7d';
      const hit = cache.barras.get(p);
      if (hit) return hit;
      const out = Array.from({ length: 7 }, () => rndInt(50, 450));
      cache.barras.set(p, out);
      return out;
    },

    getTopItensMeus(periodo: Period): TopItemMeu[] {
      const hit = cache.meus.get(periodo);
      if (hit) return hit;
      const out = termosBase.map((nome) => {
        const exibicoes = rndInt(40, 900);
        const conversas = rndInt(3, Math.max(5, Math.floor(exibicoes * 0.25)));
        const ctr = Number((conversas / Math.max(exibicoes, 1)).toFixed(3));
        const hasMeu = Math.random() < 0.6;
        const myPrice = hasMeu ? rndInt(10, 400) : null;
        const median = Math.random() < 0.75 ? rndInt(15, 350) : null;

        return {
          nome,
          exibicoes,
          conversas,
          ctr,
          meuPreco: myPrice,
          mediana: median,
          diffPct: calcDiffPct(myPrice, median),
        };
      }).sort((a, b) => b.conversas - a.conversas);
      cache.meus.set(periodo, out);
      return out;
    },

    getTopItensGeral(periodo: Period): TopItemGeral[] {
      const hit = cache.geral.get(periodo);
      if (hit) return hit;
      const out = termosBase.map((nome) => {
        const lojas = rndInt(2, 15);
        const mediana = rndInt(15, 350);
        const hasMine = Math.random() < 0.5;
        return { nome, mediana, lojas, hasMine };
      }).sort((a, b) => b.lojas - a.lojas);
      cache.geral.set(periodo, out);
      return out;
    },

    getAtividadeRecente(periodo: Period): AtividadeRecente[] {
      const hit = cache.atividade.get(periodo);
      if (hit) return hit;
      const agora = Date.now();
      const eventos: AtividadeRecente[] = [];
      for (let i = 0; i < 12; i++) {
        const tipo: AtividadeRecente['tipo'] = ['BUSCA', 'MOSTRADO', 'WPP', 'MAPA'][rndInt(0, 3)] as any;
        const termo = ['furadeira', 'wd-40', 'parafuso', 'trena', 'broca'][rndInt(0, 4)];
        const ts = new Date(agora - rndInt(1, 72) * 3600 * 1000);
        eventos.push({ tipo, termo, ts });
      }
      const out = eventos.sort((a, b) => b.ts.getTime() - a.ts.getTime());
      cache.atividade.set(periodo, out);
      return out;
    },

    getTipsSemResultado(periodo: Period): TipSemResultado[] {
      const hit = cache.tips.get(periodo);
      if (hit) return hit;
      const termos = ['furadeira de impacto', 'serrote', 'broca 12mm', 'cola epóxi', 'serra circular'];
      const lista = termos.map((termo) => ({ termo, qtd: rndInt(2, 24) }));
      const out = lista.sort((a, b) => b.qtd - a.qtd).slice(0, 5);
      cache.tips.set(periodo, out);
      return out;
    },
  };
}
