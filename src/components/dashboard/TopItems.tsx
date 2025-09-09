// src/components/dashboard/TopItems.tsx
// Componente: Top Itens (UX simplificada)
// Princípios SOLID: SRP (apenas UI), DIP (tipos de dados via props), OCP (fácil evoluir)

import React, { useState } from 'react';
import { Info, Plus, Eye } from 'lucide-react';
import { formatBRL, formatNumber, formatPct } from '../../utils/formatters';

export interface TopItemMeu {
  nome: string;
  conversas: number;        // proxy de “buscas”/popularidade na loja
  meuPreco?: number | null;
  mediana?: number | null;  // média cidade (quando disponível)
  diffPct?: number | null;  // (meu - média)/média
}
export interface TopItemGeral {
  nome: string;
  mediana?: number | null;
  lojas: number;            // base da média
  hasMine: boolean;         // se já tenho no estoque
}

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (nome: string) => void;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
};

const DiffBadge: React.FC<{ value?: number | null; meu?: number | null; med?: number | null }> = ({ value, meu, med }) => {
  let v = value;
  if (v == null && meu != null && med != null && med > 0) v = (meu - med) / med;
  if (v == null) return <span className="text-gray-400 text-xs">Adicione preço</span>;
  const up = v > 0;
  const cls = up ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {up ? '↑' : '↓'} {formatPct(Math.abs(v), false)}
    </span>
  );
};

const MediaChip: React.FC<{ mediana?: number | null; lojas?: number }> = ({ mediana, lojas }) => {
  if (mediana == null) return <span className="text-xs text-gray-500">Coletando</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-700">
      {formatBRL(mediana)}
      {typeof lojas === 'number' && (
        <span
          title={`${lojas} lojas na base`}
          className="ml-1 inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600"
        >
          {lojas} lojas
        </span>
      )}
    </span>
  );
};

const RowLoja: React.FC<{
  item: TopItemMeu;
  onAddPrice: (nome: string) => void;
}> = ({ item, onAddPrice }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      {/* Esquerda: nome + chips */}
      <div className="min-w-0">
        <div className="font-medium text-gray-900 truncate">{item.nome}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs">
            Buscas {formatNumber(item.conversas)}
          </span>
          <span className="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
            Média <span className="mx-1"><MediaChip mediana={item.mediana} /></span>
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </span>
        </div>
      </div>

      {/* Direita: preço & comparativo */}
      <div className="text-right shrink-0">
        {item.meuPreco != null ? (
          <div className="text-gray-900 font-medium">{formatBRL(item.meuPreco)}</div>
        ) : (
          <button
            onClick={() => onAddPrice(item.nome)}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            + Adicionar preço
          </button>
        )}
        <div className="mt-1">
          <DiffBadge value={item.diffPct} meu={item.meuPreco ?? null} med={item.mediana ?? null} />
        </div>
      </div>
    </div>
  );
};

const RowCidade: React.FC<{
  item: TopItemGeral;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
}> = ({ item, onViewInStock, onAddItem }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      {/* Esquerda */}
      <div className="min-w-0">
        <div className="font-medium text-gray-900 truncate">{item.nome}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
            Média <span className="mx-1"><MediaChip mediana={item.mediana} lojas={item.lojas} /></span>
            <Info className="w-3.5 h-3.5 text-gray-400" />
          </span>
        </div>
      </div>

      {/* Direita: Ação */}
      <div className="shrink-0">
        {item.hasMine ? (
          <button
            onClick={() => onViewInStock(item.nome)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="w-4 h-4" /> Ver no estoque
          </button>
        ) : (
          <button
            onClick={() => onAddItem(item.nome)}
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Adicionar ao estoque
          </button>
        )}
      </div>
    </div>
  );
};

const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'loja' | 'cidade'>('loja');
  const header = tab === 'loja'
    ? 'Top 5 Itens mais buscados — Minha loja'
    : 'Top 5 Itens mais buscados — Cidade';
  const sub = tab === 'loja'
    ? 'Produto → Buscas Loja → Média Cidade → Preço & Comparativo.'
    : 'Produto → Média Cidade → Ação.';

  const itensLoja = [...meus].sort((a, b) => b.conversas - a.conversas).slice(0, 5);
  const itensCidade = geral.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{header}</h3>
          <p className="text-sm text-gray-500">{sub}</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            onClick={() => setTab('loja')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'loja' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Minha loja
          </button>
          <button
            onClick={() => setTab('cidade')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'cidade' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Cidade
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-gray-100">
        {tab === 'loja'
          ? itensLoja.map((it) => <RowLoja key={it.nome} item={it} onAddPrice={onAddPrice} />)
          : itensCidade.map((it) => (
              <RowCidade
                key={it.nome}
                item={it}
                onViewInStock={onViewInStock}
                onAddItem={onAddItem}
              />
            ))}
      </div>
    </div>
  );
};

export default TopItems;
