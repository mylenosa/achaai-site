// src/components/dashboard/TopItems.tsx
import React, { useState } from 'react';
// CORREÇÃO 1: Adicionado 'AnimatePresence' à importação
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Award, ShoppingBag, CheckCircle, Gift } from 'lucide-react';
import { formatBRL, formatPct, getDeltaColor } from '../../utils/formatters';
import { TopItemMeu, TopItemGeral } from '../../services/DashboardService';

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (nome: string) => void;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
};

const PriceComparison: React.FC<{ diff: number | null }> = ({ diff }) => {
    if (diff === null || diff === undefined) return null; // Não renderiza se não houver dados
    const color = getDeltaColor(-diff); // Invertido: abaixo da média é bom (verde)
    const text = diff > 0 ? `acima da média` : `abaixo da média`;
    if (Math.abs(diff) < 0.01) return <div className="text-xs text-gray-500 mt-0.5">Na média</div>;
    return (
        <div className={`text-xs font-semibold mt-0.5 ${color}`}>
            {formatPct(Math.abs(diff * 100))} {text}
        </div>
    );
};

export const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'loja' | 'cidade'>('loja');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
      {/* Cabeçalho com Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Destaques e Oportunidades</h3>
        <div className="bg-gray-100 rounded-xl p-1 flex self-start sm:self-auto">
          <button
            onClick={() => setTab('loja')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-1/2 sm:w-auto ${tab === 'loja' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center justify-center gap-2"><Award className="w-4 h-4" /> Seus Destaques</div>
          </button>
          <button
            onClick={() => setTab('cidade')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors w-1/2 sm:w-auto ${tab === 'cidade' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
             <div className="flex items-center justify-center gap-2"><ShoppingBag className="w-4 h-4" /> Oportunidades</div>
          </button>
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.ul
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-gray-100"
          >
            {tab === 'loja' && meus.slice(0, 5).map((item, index) => (
              <li key={index} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-gray-400 font-bold">{index + 1}</div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.nome}</p>
                    <p className="text-xs text-gray-500">{item.conversas} contatos recebidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        {item.meuPreco != null ? (
                            <>
                                <p className="font-semibold text-gray-800">{formatBRL(item.meuPreco)}</p>
                                {/* CORREÇÃO 2: Garantimos que o valor nunca será 'undefined' */}
                                <PriceComparison diff={item.diffPct ?? null} />
                            </>
                        ) : (
                            <button onClick={() => onAddPrice(item.nome)} className="text-xs text-emerald-600 font-semibold">Adicionar preço</button>
                        )}
                    </div>
                    <button onClick={() => onViewInStock(item.nome)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
              </li>
            ))}

            {tab === 'cidade' && geral.slice(0, 5).map((item, index) => (
              <li key={index} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {item.hasMine ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Gift className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.nome}</p>
                    <p className="text-xs text-gray-500">Média de {formatBRL(item.mediana)} em {item.lojas} lojas</p>
                  </div>
                </div>
                {item.hasMine ? (
                    <div className="text-sm font-semibold text-green-600">Você já vende</div>
                ) : (
                    <button onClick={() => onAddItem(item.nome)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                        <Plus className="w-4 h-4" /> Vender
                    </button>
                )}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
};