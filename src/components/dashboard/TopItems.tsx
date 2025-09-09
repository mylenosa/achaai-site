// src/components/dashboard/TopItems.tsx
// Top Itens — lista simples e focada no valor para o lojista

import React, { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { formatBRL, formatNumber, formatPct } from '../../utils/formatters';

export interface TopItemMeu {
  nome: string;
  conversas: number;        // proxy de demanda na loja
  meuPreco?: number | null;
  mediana?: number | null;  // média cidade
  diffPct?: number | null;  // (meu - média)/média
}
export interface TopItemGeral {
  nome: string;
  mediana?: number | null;
  lojas: number;            // base da média
  hasMine: boolean;
}

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (nome: string) => void;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
};

// Frase de comparativo curta e clara
function comparePhrase(diff?: number | null) {
  if (diff == null) return null;
  if (diff > 0) return { text: `↑ ${formatPct(diff, false)} acima da média`, cls: 'text-red-600' };
  if (diff < 0) return { text: `↓ ${formatPct(Math.abs(diff), false)} abaixo da média`, cls: 'text-green-600' };
  return { text: 'na média', cls: 'text-gray-600' };
}

const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'loja' | 'cidade'>('loja');

  const header = tab === 'loja'
    ? 'Top 5 itens mais buscados — Minha loja'
    : 'Top 5 itens mais buscados — Cidade';

  const hint = tab === 'loja'
    ? 'Produto • Buscas na loja • Média cidade • Preço & comparativo'
    : 'Produto • Média cidade (base) • Ação';

  const itensLoja = [...meus].sort((a, b) => b.conversas - a.conversas).slice(0, 5);
  const itensCidade = geral.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      {/* Título + Tabs */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{header}</h3>
          <p className="text-sm text-gray-500">{hint}</p>
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
      <ul className="divide-y divide-gray-100">
        {tab === 'loja' && itensLoja.map((it) => {
          const comp = comparePhrase(it.diffPct ?? (it.meuPreco != null && it.mediana != null && it.mediana > 0
            ? (it.meuPreco - it.mediana) / it.mediana
            : null));

          return (
            <li key={it.nome} className="py-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
                {/* Produto */}
                <div className="sm:col-span-5 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{it.nome}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Buscas: <span className="font-medium text-gray-700">{formatNumber(it.conversas)}</span>
                    <span className="mx-2">•</span>
                    Média cidade: {it.mediana != null ? formatBRL(it.mediana) : 'Coletando'}
                  </div>
                </div>

                {/* Preço & comparativo (CTA quando sem preço) */}
                <div className="sm:col-span-7 sm:justify-self-end text-right">
                  {it.meuPreco != null ? (
                    <div className="text-gray-900 font-medium">{formatBRL(it.meuPreco)}</div>
                  ) : (
                    <button
                      onClick={() => onAddPrice(it.nome)}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" /> Adicionar preço
                    </button>
                  )}
                  <div className="text-xs mt-0.5">
                    {comp ? <span className={comp.cls}>{comp.text}</span> : <span className="text-gray-400">Defina seu preço para comparar</span>}
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {tab === 'cidade' && itensCidade.map((it) => (
          <li key={it.nome} className="py-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2">
              {/* Produto */}
              <div className="sm:col-span-7 min-w-0">
                <div className="font-medium text-gray-900 truncate">{it.nome}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Média cidade: {it.mediana != null ? (
                    <>
                      <span className="font-medium text-gray-700">{formatBRL(it.mediana)}</span>
                      {typeof it.lojas === 'number' && <span className="ml-2 text-gray-400">{it.lojas} lojas</span>}
                    </>
                  ) : 'Coletando'}
                </div>
              </div>

              {/* Ação */}
              <div className="sm:col-span-5 sm:justify-self-end">
                {it.hasMine ? (
                  <button
                    onClick={() => onViewInStock(it.nome)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" /> Ver no estoque
                  </button>
                ) : (
                  <button
                    onClick={() => onAddItem(it.nome)}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Adicionar ao estoque
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopItems;
