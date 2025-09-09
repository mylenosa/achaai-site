// Single Responsibility: Componente Top Itens (Minha loja | Cidade)
import React, { useState } from 'react';
import { Plus, Eye, Info } from 'lucide-react';
import { formatBRL, formatPct, formatNumber } from '../../utils/formatters';

export interface TopItemMeu {
  nome: string;
  conversas: number;          // “Buscas Loja”
  meuPreco?: number | null;
  mediana?: number | null;    // média/mediana cidade
  diffPct?: number | null;    // (meu - mediana)/mediana
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

const DiffBadge: React.FC<{ value?: number | null }> = ({ value }) => {
  if (value == null) return <span className="text-gray-400">—</span>;
  const up = value > 0;
  const cls = up ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {up ? '↑' : '↓'} {formatPct(Math.abs(value), false)}
    </span>
  );
};

const Row: React.FC<{ left: React.ReactNode; right: React.ReactNode; sub?: React.ReactNode }> = ({ left, right, sub }) => (
  <li className="py-3 border-b border-gray-100">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 truncate">{left}</div>
        {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
      </div>
      <div className="flex items-center gap-3">{right}</div>
    </div>
  </li>
);

const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'minha' | 'cidade'>('minha');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top Itens</h3>
          <p className="text-sm text-gray-500">
            {tab === 'minha'
              ? 'Mais buscados na sua loja e comparação com a cidade.'
              : 'Mais buscados na cidade — veja oportunidades.'}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-1">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'minha' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTab('minha')}
          >
            Minha loja
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'cidade' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTab('cidade')}
          >
            Cidade
          </button>
        </div>
      </div>

      {/* Sem scroll: mostra top 5/6 itens no máximo */}
      {tab === 'minha' ? (
        <ul className="divide-y-0">
          {meus.slice(0, 6).map((it) => (
            <Row
              key={it.nome}
              left={
                <div className="flex items-center gap-2">
                  <span>{it.nome}</span>
                </div>
              }
              sub={
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-600">Buscas Loja: <strong className="text-gray-800">{formatNumber(it.conversas)}</strong></span>
                  <span className="text-gray-600 inline-flex items-center gap-1">
                    Média Cidade: <strong className="text-gray-800">
                      {it.mediana != null ? formatBRL(it.mediana) : '—'}
                    </strong>
                    <span className="text-gray-400" title="Preço mediano na cidade (anônimo)">
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </div>
              }
              right={
                <>
                  <DiffBadge value={it.diffPct ?? (it.meuPreco != null && it.mediana ? (it.meuPreco - it.mediana) / it.mediana : null)} />
                  {it.meuPreco != null ? (
                    <span className="text-sm text-gray-900">{formatBRL(it.meuPreco)}</span>
                  ) : (
                    <button
                      onClick={() => onAddPrice(it.nome)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm underline"
                    >
                      adicionar preço
                    </button>
                  )}
                </>
              }
            />
          ))}
        </ul>
      ) : (
        <ul className="divide-y-0">
          {geral.slice(0, 6).map((it) => (
            <Row
              key={it.nome}
              left={
                <div className="flex items-center gap-2">
                  <span>{it.nome}</span>
                </div>
              }
              sub={
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-600 inline-flex items-center gap-1">
                    Média Cidade: <strong className="text-gray-800">
                      {it.lojas >= 5 && it.mediana != null ? formatBRL(it.mediana) : '—'}
                    </strong>
                    <span className="text-gray-400" title="Mostra quando há base suficiente (n≥5)">
                      <Info className="w-3.5 h-3.5" />
                    </span>
                  </span>
                  <span className="text-gray-600">Lojas: <strong className="text-gray-800">{it.lojas}</strong></span>
                </div>
              }
              right={
                it.hasMine ? (
                  <button
                    onClick={() => onViewInStock(it.nome)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Eye className="w-4 h-4" /> Ver no estoque
                  </button>
                ) : (
                  <button
                    onClick={() => onAddItem(it.nome)}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                )
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TopItems;
