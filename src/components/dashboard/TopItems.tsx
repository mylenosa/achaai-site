// src/components/dashboard/TopItems.tsx
import React, { useState } from 'react';
import { Plus, Eye, Award, ShoppingBag } from 'lucide-react';
import { formatBRL, formatPct } from '../../utils/formatters';

// Interfaces (podem vir de DashboardService)
export interface TopItemMeu {
  nome: string;
  conversas: number;
  meuPreco?: number | null;
  mediana?: number | null;
  diffPct?: number | null;
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

const PriceComparison: React.FC<{ diff: number | null }> = ({ diff }) => {
  if (diff === null || diff === undefined) {
    return <span className="text-gray-500">Compare com a cidade</span>;
  }
  if (Math.abs(diff) < 0.01) {
    return <span className="text-gray-600">Na média da cidade</span>;
  }
  if (diff > 0) {
    return <span className="text-red-600 font-medium">↑ {formatPct(diff * 100)} acima da média</span>;
  }
  return <span className="text-green-600 font-medium">↓ {formatPct(Math.abs(diff * 100))} abaixo da média</span>;
};


export const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'loja' | 'cidade'>('loja');

  const itensLoja = meus.slice(0, 5);
  const itensCidade = geral.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
      {/* Cabeçalho com Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Itens em Destaque</h3>
        <div className="bg-gray-100 rounded-xl p-1 flex self-start sm:self-auto">
          <button
            onClick={() => setTab('loja')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'loja' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2"><Award className="w-4 h-4" /> Seus Top 5</div>
          </button>
          <button
            onClick={() => setTab('cidade')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'cidade' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
             <div className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Top da Cidade</div>
          </button>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="flex-1">
        <ul className="divide-y divide-gray-100">
          {tab === 'loja' && itensLoja.map((item) => (
            <li key={item.nome} className="py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{item.nome}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.conversas} contatos iniciados</div>
                </div>
                <div className="text-right flex-shrink-0">
                  {item.meuPreco !== null && item.meuPreco !== undefined ? (
                    <>
                      <div className="font-semibold text-gray-800">{formatBRL(item.meuPreco)}</div>
                      <div className="text-xs mt-0.5"><PriceComparison diff={item.diffPct} /></div>
                    </>
                  ) : (
                    <button
                      onClick={() => onAddPrice(item.nome)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      + Adicionar preço
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}

          {tab === 'cidade' && itensCidade.map((item) => (
             <li key={item.nome} className={`py-3 ${!item.hasMine ? 'bg-emerald-50/50 rounded-lg px-2 -mx-2' : ''}`}>
               <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{item.nome}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Média de {formatBRL(item.mediana)} ({item.lojas} lojas)
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {item.hasMine ? (
                     <button
                       onClick={() => onViewInStock(item.nome)}
                       className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                     >
                       <Eye className="w-4 h-4" /> Ver
                     </button>
                  ) : (
                    <button
                      onClick={() => onAddItem(item.nome)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg"
                    >
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopItems;
