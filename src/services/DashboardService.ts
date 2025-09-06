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

// calcula diff % com safety
const calcDiffPct = (meu?: number | null, mediana?: number | null): number | null => {
  if (meu == null || mediana == null || mediana <= 0) return null;
  return (meu - mediana) / mediana;
};

// ==== Factory do service ====
export function createDashboardService() {
  type Period = '7d' | '30d';

  // dados estáticos de exemplo
  const termosBase = [
    'Furadeira 500W', 'Parafusadeira', 'Martelo pena', 'Chave Phillips 3x20',
    'Serra Tico-Tico', 'Trena 5m', 'Broca Aço 8mm', 'WD-40 300ml',
  ];

  return {
    getKPIs(periodo: Period): KPIData {
      void periodo;
      const impressoes = rndInt(400, 2400);
      const whatsapp = rndInt(30, 250);
      const mapa = rndInt(20, 180);
      const ctr = (whatsapp + mapa) / Math.max(impressoes, 1);

      // deltas de exemplo
      const delta = {
        whatsapp: (Math.random() - 0.5) * 0.4,   // -20%..+20%
        mapa:     (Math.random() - 0.5) * 0.4,
        impressoes:(Math.random() - 0.5) * 0.3,
        ctr:      (Math.random() - 0.5) * 0.2,
      };

      return { whatsapp, mapa, impressoes, ctr, deltaKpis: delta };
    },

    getSerieImpressoes(periodo: '7d' | '30d'): { labels: string[]; values: number[] } {
      void periodo;
      if (periodo === '7d') {
        const labels = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
        const values = Array.from({length: 7}, () => Math.floor(Math.random()*401)+50);
        return { labels, values };
      }
      const labels = ['Semana 1','Semana 2','Semana 3','Semana 4'];
      const values = Array.from({length: 4}, () => Math.floor(Math.random()*2201)+400);
      return { labels, values };
    },

    // Mantido para compat com componentes que ainda usam apenas um array
    getBarrasSemana(): number[] {
      // 7 valores DOM..SÁB
      return Array.from({ length: 7 }, () => rndInt(50, 450));
    },

    getTopItensMeus(periodo: Period): TopItemMeu[] {
      void periodo;
      const base = termosBase.map((nome) => {
        const exibicoes = rndInt(40, 900);
        const conversas = rndInt(3, Math.max(5, Math.floor(exibicoes * 0.25)));
        const ctr = conversas / Math.max(exibicoes, 1);

        // 60% dos itens têm preço próprio
        const hasMeu = Math.random() < 0.6;
        const mediana = Math.random() < 0.75 ? rndInt(15, 350) : null; // às vezes não há base suficiente
        const meuPreco = hasMeu ? rndInt(10, 400) : null;

        return {
          nome,
          exibicoes,
          conversas,
          ctr,
          meuPreco,
          mediana,
          diffPct: calcDiffPct(meuPreco, mediana),
        } as TopItemMeu;
      });

      // ordena por conversas desc (default no dashboard)
      return base.sort((a, b) => b.conversas - a.conversas);
    },

    getTopItensGeral(periodo: Period): TopItemGeral[] {
      void periodo;
      return termosBase
        .map((nome) => {
          const lojas = rndInt(2, 15);
          const mediana = rndInt(15, 350);
          const hasMine = Math.random() < 0.5; // simula se a loja já tem esse item
          return { nome, mediana, lojas, hasMine };
        })
        .sort((a, b) => b.lojas - a.lojas);
    },

    getAtividadeRecente(periodo: Period): AtividadeRecente[] {
      void periodo;
      const agora = Date.now();
      const eventos: AtividadeRecente[] = [];
      for (let i = 0; i < 12; i++) {
        const tipo: AtividadeRecente['tipo'] =
          ['BUSCA', 'MOSTRADO', 'WPP', 'MAPA'][rndInt(0, 3)] as any;
        const termo = ['furadeira', 'wd-40', 'parafuso', 'trena', 'broca'][rndInt(0, 4)];
        const ts = new Date(agora - rndInt(1, 72) * 3600 * 1000); // últimas 72h
        eventos.push({ tipo, termo, ts });
      }
      // mais recente primeiro
      return eventos.sort((a, b) => b.ts.getTime() - a.ts.getTime());
    },

    getTipsSemResultado(periodo: Period): TipSemResultado[] {
      void periodo;
      const termos = ['furadeira de impacto', 'serrote', 'broca 12mm', 'cola epóxi', 'serra circular'];
      const lista = termos.map((termo) => ({ termo, qtd: rndInt(2, 24) }));
      // top 5 por quantidade
      return lista.sort((a, b) => b.qtd - a.qtd).slice(0, 5);
    },
  };
}