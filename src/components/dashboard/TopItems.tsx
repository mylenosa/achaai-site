import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown } from 'lucide-react';
import { formatBRL, formatPct, getDeltaColor } from '../../utils/formatters';
import { TopItemMeu, TopItemGeral } from '../../services/DashboardService';

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddItem: (nome: string) => void;
};

// Mini-componente para a análise expandida
const ExpandedAnalysis: React.FC<{ item: TopItemMeu | TopItemGeral }> = ({ item }) => {
  const diff = item.diffPct ?? null;
  const media = item.mediana ?? null;
  const lojas = item.lojas ?? null;
  const meuPreco = item.meuPreco ?? null;

  const color = diff !== null ? getDeltaColor(-diff) : 'text-gray-600';
  const text = diff !== null ? (diff > 0 ? `acima da média` : `abaixo da média`) : '';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="mt-2 pl-10 pr-4 pt-3 pb-2 bg-slate-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700">Análise de Competitividade</h4>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Seu Preço</p>
            <p className="font-bold text-gray-800">{meuPreco !== null ? formatBRL(meuPreco) : '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Média na Cidade</p>
            <p className="font-bold text-gray-800">{media !== null ? `${formatBRL(media)}` : '-'}</p>
            {lojas && <p className="text-xs text-gray-400">em {lojas} lojas</p>}
          </div>
        </div>
        {diff !== null && (
          <div className="mt-3 text-center p-2 rounded-md bg-white">
            <p className={`font-bold text-lg ${color}`}>{formatPct(Math.abs(diff * 100))}</p>
            <p className={`text-xs font-medium ${color}`}>{text}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TopItems: React.FC<Props> = ({ meus, geral, onAddItem }) => {
  const [tab, setTab] = useState<'loja' | 'cidade'>('loja');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const handleToggle = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  const data = tab === 'loja' ? meus : geral;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Itens em Destaque</h3>
        <div className="bg-gray-100 rounded-xl p-1 flex self-start sm:self-auto">
          <button onClick={() => setTab('loja')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors w-1/2 sm:w-auto ${tab === 'loja' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Minha Loja</button>
          <button onClick={() => setTab('cidade')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors w-1/2 sm:w-auto ${tab === 'cidade' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Cidade</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <ul className="divide-y divide-gray-100">
          {data.slice(0, 5).map((item, index) => (
            <li key={item.nome} className="py-2">
              <div className="flex items-center justify-between gap-4 cursor-pointer" onClick={() => handleToggle(item.nome)}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="text-lg font-bold text-gray-400 w-4 text-center">{index + 1}</div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{item.nome}</p>
                    {/* Linha Corrigida: removi a exibição da categoria */}
                    <p className="text-xs text-gray-500">
                      {item.interesses} interesses {tab === 'cidade' ? 'na cidade' : 'de clientes'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {('hasMine' in item && !item.hasMine) ? (
                     <button onClick={(e) => { e.stopPropagation(); onAddItem(item.nome); }} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                        <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                        <p className="hidden md:block text-sm font-semibold text-right">{formatBRL(item.meuPreco ?? null)}</p>
                        <ChevronDown className={`w-5 h-5 transition-transform ${expandedItem === item.nome ? 'rotate-180' : ''}`} />
                    </div>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {expandedItem === item.nome && <ExpandedAnalysis item={item} />}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};