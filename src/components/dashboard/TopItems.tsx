// src/components/dashboard/TopItems.tsx
// Single Responsibility: Componente específico para tabela de top itens

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye } from 'lucide-react';
import { formatBRL, formatPct, formatNumber } from '../../utils/formatters';

export interface TopItemMeu { nome: string; conversas: number; meuPreco?: number|null; mediana?: number|null; diffPct?: number|null; }
export interface TopItemGeral { nome: string; mediana?: number|null; lojas: number; hasMine: boolean; }

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (nome: string) => void;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
};

const DiffBadge = ({ value, meuPreco, mediana }: { value?: number|null; meuPreco?: number|null; mediana?: number|null }) => {
  let v = value;
  if (v == null && meuPreco != null && mediana != null && mediana > 0) v = (meuPreco - mediana) / mediana;
  if (v == null) return <span className="text-gray-400">—</span>;
  const up = v > 0;
  const cls = up ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{up ? '↑' : '↓'} {formatPct(Math.abs(v), false)}</span>;
};

export const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'meus'|'geral'>('meus');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top itens</h3>
          <p className="text-sm text-gray-500">
            {tab==='meus' ? 'Itens mais procurados na sua loja e comparação de preço (anônimo).' : 'Itens mais procurados na cidade: mediana e nº de lojas.'}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-1">
          <button className={`px-3 py-1.5 rounded-lg text-sm ${tab==='meus'?'bg-white shadow-sm':''}`} onClick={()=>setTab('meus')}>Meus</button>
          <button className={`px-3 py-1.5 rounded-lg text-sm ${tab==='geral'?'bg-white shadow-sm':''}`} onClick={()=>setTab('geral')}>Geral</button>
        </div>
      </div>

      {tab==='geral' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-3">Item</th>
                <th className="text-center py-2 px-3">Mediana (cidade)</th>
                <th className="text-center py-2 px-3">Lojas</th>
                <th className="text-center py-2 px-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {geral.slice(0,8).map((it, i)=>(
                <motion.tr key={it.nome} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} className="border-b">
                  <td className="py-2 px-3 font-medium">{it.nome}</td>
                  <td className="py-2 px-3 text-center">{it.mediana!=null && it.lojas>=5 ? formatBRL(it.mediana) : '—'}</td>
                  <td className="py-2 px-3 text-center">{it.lojas}</td>
                  <td className="py-2 px-3 text-center">
                    {it.hasMine ? (
                      <button onClick={()=>onViewInStock(it.nome)} className="inline-flex items-center gap-1 text-blue-600 text-sm"><Eye className="w-4 h-4"/>Ver no estoque</button>
                    ) : (
                      <button onClick={()=>onAddItem(it.nome)} className="inline-flex items-center gap-1 text-emerald-600 text-sm"><Plus className="w-4 h-4"/>Adicionar</button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-3">Item</th>
                <th className="text-center py-2 px-3">Popularidade</th>
                <th className="text-center py-2 px-3">Dif.%</th>
                <th className="text-center py-2 px-3">Preço</th>
              </tr>
            </thead>
            <tbody>
              {meus.slice(0,8).map((it,i)=>(
                <motion.tr key={it.nome} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}} className="border-b">
                  <td className="py-2 px-3 font-medium">{it.nome}</td>
                  <td className="py-2 px-3 text-center">{formatNumber(it.conversas)}</td>
                  <td className="py-2 px-3 text-center"><DiffBadge value={it.diffPct} meuPreco={it.meuPreco} mediana={it.mediana}/></td>
                  <td className="py-2 px-3 text-center">
                    {it.meuPreco!=null ? formatBRL(it.meuPreco) : (
                      <button onClick={()=>onAddPrice(it.nome)} className="text-emerald-600 text-sm underline">adicionar preço</button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopItems;
