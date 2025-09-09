// src/components/dashboard/TopItems.tsx
// SRP: Top 5 simples para lojista (tabela + toggle)

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Info } from 'lucide-react';
import { formatBRL, formatPct, formatNumber } from '../../utils/formatters';

export interface TopItemMeu {
  nome: string;
  conversas: number;           // usamos "conversas" como proxy de popularidade
  meuPreco?: number | null;
  mediana?: number | null;     // mediana estimada para cidade (pode vir nula)
  diffPct?: number | null;     // (meu - mediana)/mediana
}

export interface TopItemGeral {
  nome: string;
  mediana?: number | null;     // mediana consolidada
  lojas: number;               // base para tooltip (n de lojas)
  hasMine: boolean;
}

type Props = {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (nome: string) => void;
  onViewInStock: (nome: string) => void;
  onAddItem: (nome: string) => void;
};

const DiffBadge = ({
  value,
  meuPreco,
  mediana,
}: {
  value?: number | null;
  meuPreco?: number | null;
  mediana?: number | null;
}) => {
  let v = value;
  if (v == null && meuPreco != null && mediana != null && mediana > 0) {
    v = (meuPreco - mediana) / mediana;
  }
  if (v == null) return <span className="text-gray-400">—</span>;
  const up = v > 0;
  const cls = up ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
      {up ? '↑' : '↓'} {formatPct(Math.abs(v), false)}
    </span>
  );
};

const MedianCell = ({
  valor,
  lojas,
}: {
  valor?: number | null;
  lojas?: number;
}) => {
  if (valor == null || !lojas || lojas < 5) return <span>—</span>;
  const min = Math.max(0, valor * 0.85);
  const max = valor * 1.15;
  return (
    <div className="relative group inline-flex items-center gap-1 justify-center">
      <span>{formatBRL(valor)}</span>
      <Info className="w-4 h-4 text-gray-400" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
        Baseado em {lojas} lojas · Faixa {formatBRL(min)} – {formatBRL(max)}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};

export const TopItems: React.FC<Props> = ({
  meus,
  geral,
  onAddPrice,
  onViewInStock,
  onAddItem,
}) => {
  const [tab, setTab] = useState<'meus' | 'geral'>('meus');

  // Map para achar "lojas" do item na cidade quando estivermos na aba "meus"
  const metaCidade = useMemo(() => {
    const m = new Map<string, { mediana?: number | null; lojas?: number }>();
    geral.forEach((g) => m.set(g.nome, { mediana: g.mediana, lojas: g.lojas }));
    return m;
  }, [geral]);

  // Top 5 (curto e direto)
  const topMeus = useMemo(
    () => [...meus].sort((a, b) => b.conversas - a.conversas).slice(0, 5),
    [meus]
  );
  const topGeral = useMemo(
    () => [...geral].sort((a, b) => b.lojas - a.lojas).slice(0, 5),
    [geral]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top 5 itens</h3>
          <p className="text-sm text-gray-500">
            {tab === 'meus'
              ? 'Itens mais buscados na sua loja. Compare seu preço com a média da cidade.'
              : 'Itens mais populares na cidade. Veja oportunidades de completar seu estoque.'}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-1">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'meus' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTab('meus')}
          >
            Minha Loja
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'geral' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTab('geral')}
          >
            Cidade
          </button>
        </div>
      </div>

      {tab === 'geral' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-3">Produto</th>
                <th className="text-center py-2 px-3">Média Cidade</th>
                <th className="text-center py-2 px-3">Lojas (n)</th>
                <th className="text-center py-2 px-3">Ação</th>
              </tr>
            </thead>
            <tbody>
              {topGeral.map((it, i) => (
                <motion.tr
                  key={it.nome}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b"
                >
                  <td className="py-2 px-3 font-medium">{it.nome}</td>
                  <td className="py-2 px-3 text-center">
                    <MedianCell valor={it.mediana} lojas={it.lojas} />
                  </td>
                  <td className="py-2 px-3 text-center">{it.lojas}</td>
                  <td className="py-2 px-3 text-center">
                    {it.hasMine ? (
                      <button
                        onClick={() => onViewInStock(it.nome)}
                        className="inline-flex items-center gap-1 text-blue-600 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver no estoque
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddItem(it.nome)}
                        className="inline-flex items-center gap-1 text-emerald-600 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {topGeral.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Sem dados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-2 px-3">Produto</th>
                <th className="text-center py-2 px-3">Buscas Loja</th>
                <th className="text-center py-2 px-3">Média Cidade</th>
                <th className="text-center py-2 px-3">Comparativo</th>
                <th className="text-center py-2 px-3">Preço Loja</th>
              </tr>
            </thead>
            <tbody>
              {topMeus.map((it, i) => {
                const meta = metaCidade.get(it.nome); // p/ tooltip (n de lojas)
                return (
                  <motion.tr
                    key={it.nome}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b"
                  >
                    <td className="py-2 px-3 font-medium">{it.nome}</td>
                    <td className="py-2 px-3 text-center">{formatNumber(it.conversas)}</td>
                    <td className="py-2 px-3 text-center">
                      <MedianCell valor={it.mediana} lojas={meta?.lojas} />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <DiffBadge value={it.diffPct} meuPreco={it.meuPreco} mediana={it.mediana} />
                    </td>
                    <td className="py-2 px-3 text-center">
                      {it.meuPreco != null ? (
                        formatBRL(it.meuPreco)
                      ) : (
                        <button onClick={() => onAddPrice(it.nome)} className="text-emerald-600 text-sm underline">
                          adicionar preço
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
              {topMeus.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Sem dados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopItems;
