// Single Responsibility: Top itens (apresentação pura, sem acoplamento ao service)
import React, { useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { formatBRL, formatPct } from '../../utils/formatters';

export interface TopItemMeu {
  nome: string;
  conversas: number;            // “buscas”/conversas na loja
  meuPreco?: number | null;
  mediana?: number | null;      // média/mediana da cidade
  diffPct?: number | null;      // (meu - mediana)/mediana
}

export interface TopItemGeral {
  nome: string;
  mediana?: number | null;
  lojas: number;
  hasMine: boolean;
}

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (nome: string) => void;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
};

// calcula diff quando não vier pronto
const ensureDiff = (diff: number | null | undefined, meu?: number | null, mediana?: number | null) => {
  if (diff != null) return diff;
  if (meu == null || mediana == null || mediana <= 0) return null;
  return (meu - mediana) / mediana;
};

const DiffChip: React.FC<{ diff?: number | null }> = ({ diff }) => {
  if (diff == null) return <span className="text-xs text-gray-400">Adicione preço para ver</span>;
  const abs = Math.abs(diff);
  const up = diff > 0;
  const within = abs < 0.01; // ±1% = “na média”
  if (within) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-gray-600 bg-gray-100">
        Na média
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
        up ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50'
      }`}
      title={up ? 'Acima da média da cidade' : 'Abaixo da média da cidade'}
    >
      {up ? '↑' : '↓'} {formatPct(abs, false)}
    </span>
  );
};

const MercadoCell: React.FC<{ mediana?: number | null; lojas?: number }> = ({ mediana, lojas }) => {
  if (mediana == null) return <span className="text-sm text-gray-400">Coletando</span>;
  return (
    <div className="flex items-center gap-2 justify-center">
      <span className="text-sm text-gray-900">{formatBRL(mediana)}</span>
      {typeof lojas === 'number' && (
        <span className="text-[11px] text-gray-500 px-1.5 py-0.5 rounded-full bg-gray-100">
          {lojas} lojas
        </span>
      )}
    </div>
  );
};

const PriceCell: React.FC<{
  meuPreco?: number | null;
  mediana?: number | null;
  diffPct?: number | null;
  onAddPrice: () => void;
}> = ({ meuPreco, mediana, diffPct, onAddPrice }) => {
  const diff = ensureDiff(diffPct, meuPreco, mediana);
  if (meuPreco == null) {
    return (
      <button onClick={onAddPrice} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
        + Adicionar preço
      </button>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-gray-900">{formatBRL(meuPreco)}</span>
      <DiffChip diff={diff} />
    </div>
  );
};

const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'meus' | 'cidade'>('meus');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Top 5 Itens mais buscados — {tab === 'meus' ? 'Minha loja' : 'Cidade'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {tab === 'meus'
              ? 'Produto → Buscas Loja → Média Cidade → Sua posição.'
              : 'Produto → Média Cidade → Ação.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            onClick={() => setTab('meus')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'meus' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Minha loja
          </button>
          <button
            onClick={() => setTab('cidade')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'cidade' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cidade
          </button>
        </div>
      </div>

      {/* Tabela */}
      {tab === 'meus' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y">
              <tr className="text-sm text-gray-600">
                <th className="text-left py-3 px-4 font-medium">Produto</th>
                <th className="text-center py-3 px-4 font-medium">Mercado (média cidade)</th>
                <th className="text-center py-3 px-4 font-medium">Sua posição</th>
              </tr>
            </thead>
            <tbody>
              {meus.slice(0, 5).map((it) => (
                <tr key={it.nome} className="border-b last:border-0">
                  {/* Produto + buscas (badge) */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{it.nome}</span>
                      <span className="text-[11px] text-gray-500 mt-1">{it.conversas} buscas</span>
                    </div>
                  </td>

                  {/* Mercado */}
                  <td className="py-4 px-4 text-center">
                    <MercadoCell mediana={it.mediana} />
                  </td>

                  {/* Minha posição (preço + comparativo) */}
                  <td className="py-4 px-4 text-center">
                    <PriceCell
                      meuPreco={it.meuPreco}
                      mediana={it.mediana}
                      diffPct={it.diffPct}
                      onAddPrice={() => onAddPrice(it.nome)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y">
              <tr className="text-sm text-gray-600">
                <th className="text-left py-3 px-4 font-medium">Produto</th>
                <th className="text-center py-3 px-4 font-medium">Mercado (média cidade)</th>
                <th className="text-center py-3 px-4 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {geral.slice(0, 5).map((it) => (
                <tr key={it.nome} className="border-b last:border-0">
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-900">{it.nome}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <MercadoCell mediana={it.mediana} lojas={it.lojas} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    {it.hasMine ? (
                      <button
                        onClick={() => onViewInStock(it.nome)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Ver no estoque
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddItem(it.nome)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar ao estoque
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopItems;
