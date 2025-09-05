// Single Responsibility: Serviço dedicado para dados do dashboard
// Open/Closed: Extensível para diferentes fontes de dados
export interface KPIData {
  whatsapp: number;
  mapa: number;
  impressoes: number;
  ctr: number;
  deltaKpis: {
    whatsapp: number;
    mapa: number;
    impressoes: number;
    ctr: number;
  };
}

export interface TopItemMeu {
  nome: string;
  exibicoes: number;
  conversas: number;
  ctr: number;
  meuPreco: number | null;
  mediana: number | null;
  diffPct: number | null;
}

export interface TopItemGeral {
  nome: string;
  mediana: number | null;
  n: number;
  hasMine: boolean;
}

export interface AtividadeRecente {
  id: string;
  tipo: 'CLIQUE_WHATSAPP' | 'CLIQUE_MAPA' | 'BUSCA_EXECUTADA' | 'RESULTADO_MOSTRADO';
  texto: string;
  tempo: Date;
  termo?: string;
  posicao?: number;
}

export interface TipSemResultado {
  termo: string;
}

// Interface Segregation: Interface específica para cada tipo de dado
export interface DashboardDataProvider {
  getKPIs(periodo: '7d' | '30d'): KPIData;
  getBarrasSemana(): number[];
  getTopItensMeus(periodo: '7d' | '30d'): TopItemMeu[];
  getTopItensGeral(periodo: '7d' | '30d'): TopItemGeral[];
  getAtividadeRecente(periodo: '7d' | '30d'): AtividadeRecente[];
  getTipsSemResultado(periodo: '7d' | '30d'): TipSemResultado[];
}

// Liskov Substitution: Implementação mock que pode ser substituída por implementação real
export class MockDashboardProvider implements DashboardDataProvider {
  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  getKPIs(periodo: '7d' | '30d'): KPIData {
    const multiplier = periodo === '30d' ? 4 : 1;
    
    const whatsapp = this.random(20, 80) * multiplier;
    const mapa = this.random(30, 120) * multiplier;
    const impressoes = this.random(800, 2000) * multiplier;
    const ctr = ((whatsapp + mapa) / Math.max(impressoes, 1)) * 100;

    // Deltas simulados
    const deltaKpis = {
      whatsapp: this.randomFloat(-20, 25),
      mapa: this.randomFloat(-15, 30),
      impressoes: this.randomFloat(-10, 20),
      ctr: this.randomFloat(-5, 15)
    };

    return { whatsapp, mapa, impressoes, ctr, deltaKpis };
  }

  getBarrasSemana(): number[] {
    return Array.from({ length: 7 }, () => this.random(80, 300));
  }

  getTopItensMeus(periodo: '7d' | '30d'): TopItemMeu[] {
    const items = [
      'Tinta Spray Vermelha 400ml',
      'WD-40 300ml',
      'Parafuso Phillips 3x20',
      'Martelo 500g',
      'Furadeira Bosch',
      'Chave de Fenda',
      'Fita Isolante',
      'Cola Branca',
      'Prego 2x10',
      'Lixa d\'água'
    ];

    const multiplier = periodo === '30d' ? 4 : 1;

    return items.slice(0, 10).map(nome => {
      const exibicoes = this.random(10, 100) * multiplier;
      const conversas = this.random(1, Math.floor(exibicoes * 0.3));
      const ctr = (conversas / Math.max(exibicoes, 1)) * 100;
      const meuPreco = Math.random() > 0.3 ? this.randomFloat(5, 200) : null;
      const mediana = Math.random() > 0.2 ? this.randomFloat(8, 180) : null;
      
      let diffPct = null;
      if (meuPreco && mediana) {
        diffPct = ((meuPreco - mediana) / mediana) * 100;
      }

      return { nome, exibicoes, conversas, ctr, meuPreco, mediana, diffPct };
    }).sort((a, b) => b.conversas - a.conversas);
  }

  getTopItensGeral(periodo: '7d' | '30d'): TopItemGeral[] {
    const items = [
      'Tinta Spray Azul 400ml',
      'Parafuso Fenda 4x30',
      'Martelo 300g',
      'Chave Inglesa 10"',
      'Fita Dupla Face',
      'Cola Epóxi',
      'Prego 3x15',
      'Lixa Ferro 120',
      'Broca 6mm',
      'Abraçadeira Plástica'
    ];

    return items.slice(0, 10).map(nome => {
      const n = this.random(3, 15);
      const mediana = n >= 5 ? this.randomFloat(10, 150) : null;
      const hasMine = Math.random() > 0.6;

      return { nome, mediana, n, hasMine };
    });
  }

  getAtividadeRecente(periodo: '7d' | '30d'): AtividadeRecente[] {
    const tipos: AtividadeRecente['tipo'][] = [
      'CLIQUE_WHATSAPP',
      'CLIQUE_MAPA', 
      'BUSCA_EXECUTADA',
      'RESULTADO_MOSTRADO'
    ];

    const termos = [
      'tinta spray',
      'parafuso',
      'martelo',
      'wd-40',
      'furadeira',
      'chave de fenda'
    ];

    const atividades: AtividadeRecente[] = [];
    const maxItems = periodo === '30d' ? 20 : 15;

    for (let i = 0; i < maxItems; i++) {
      const tipo = tipos[this.random(0, tipos.length - 1)];
      const tempo = new Date(Date.now() - this.random(1, periodo === '30d' ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));
      
      let texto = '';
      let termo: string | undefined;
      let posicao: number | undefined;

      switch (tipo) {
        case 'CLIQUE_WHATSAPP':
          texto = 'Cliente abriu WhatsApp';
          break;
        case 'CLIQUE_MAPA':
          texto = 'Cliente abriu mapa';
          break;
        case 'BUSCA_EXECUTADA':
          termo = termos[this.random(0, termos.length - 1)];
          texto = `Busca por '${termo}'`;
          break;
        case 'RESULTADO_MOSTRADO':
          termo = termos[this.random(0, termos.length - 1)];
          posicao = this.random(1, 3);
          texto = `Você apareceu para '${termo}' (pos. ${posicao})`;
          break;
      }

      atividades.push({
        id: `${i}`,
        tipo,
        texto,
        tempo,
        termo,
        posicao
      });
    }

    return atividades.sort((a, b) => b.tempo.getTime() - a.tempo.getTime());
  }

  getTipsSemResultado(periodo: '7d' | '30d'): TipSemResultado[] {
    const termos = [
      'tinta fosforescente',
      'parafuso titanio',
      'martelo pneumático',
      'furadeira laser',
      'chave inglesa 50mm'
    ];

    const maxItems = Math.min(5, this.random(2, 5));
    return termos.slice(0, maxItems).map(termo => ({ termo }));
  }
}

// Dependency Inversion: Serviço que depende de abstração
export class DashboardService {
  constructor(private provider: DashboardDataProvider) {}

  getKPIs(periodo: '7d' | '30d'): KPIData {
    return this.provider.getKPIs(periodo);
  }

  getBarrasSemana(): number[] {
    return this.provider.getBarrasSemana();
  }

  getTopItensMeus(periodo: '7d' | '30d'): TopItemMeu[] {
    return this.provider.getTopItensMeus(periodo);
  }

  getTopItensGeral(periodo: '7d' | '30d'): TopItemGeral[] {
    return this.provider.getTopItensGeral(periodo);
  }

  getAtividadeRecente(periodo: '7d' | '30d'): AtividadeRecente[] {
    return this.provider.getAtividadeRecente(periodo);
  }

  getTipsSemResultado(periodo: '7d' | '30d'): TipSemResultado[] {
    return this.provider.getTipsSemResultado(periodo);
  }
}

// Factory para criar instância configurada
export const createDashboardService = (): DashboardService => {
  return new DashboardService(new MockDashboardProvider());
};