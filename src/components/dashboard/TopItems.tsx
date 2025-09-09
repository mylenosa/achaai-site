// Single Responsibility: Componente específico para Top Itens
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Info } from 'lucide-react';
import { formatBRL, formatPct, formatNumber } from '../../utils/formatters';

export interface TopItemMeu {
  nome: string;
  conversas: number;            // “Buscas Loja”
  meuPreco?: number | null;     // Preço Loja
  mediana?: number | null;      // Mediana Cidade (se já calculada no service)
  diffPct?: number | null;      // (meuPreco - mediana) / mediana
}
export interface TopItemGeral {
  nome: string;
  mediana?: number | null;
  lojas: number;                // nº de lojas com o item
  hasMine: boolean;
  // opcional futuro: buscas?: number;
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

const InfoMediana = ({
  nome,
  mediana,
  lojas,
}: {
  nome: string;
  mediana?: number | null;
  lojas?: number | null;
}) => {
  if (mediana == null || !lojas || lojas < 5) return <span className="text-gray-400">—</span>;
  // faixa “típica” simples (±15%) — apenas indicativa até termos dados reais
  const min = Math.max(0, mediana * 0.85);
  const max = mediana * 0.15 + mediana;
  return (
    <div className="relative group inline-flex items-center justify-center">
      <span>{formatBRL(mediana)}</span>
      <button className="ml-1 text-gray-400 hover:text-gray-600" aria-label={`Mais detalhes de ${nome}`}>
        <Info className="w-4 h-4" />
      </button>
      {/* Tooltip */}
      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
        Baseado em {lojas} lojas · Faixa {formatBRL(min)} – {formatBRL(max)}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
      </div>
    </div>
  );
};

export const TopItems: React.FC<Props> = ({ meus, geral, onAddPrice, onViewInStock, onAddItem }) => {
  const [tab, setTab] = useState<'meus' | 'geral'>('meus');

  // helper para cruzar info da cidade quando estivermos na aba “Minha loja”
  const getGeralByNome = (nome: string) => geral.find((g) => g.nome === nome);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top itens</h3>
          <p className="text-sm text-gray-500">
            {tab === 'meus'
              ? 'Produtos mais buscados na sua loja. Compare seu preço com a média da cidade (anônimo).'
              : 'Produtos mais buscados na cidade: média de preço e nº de lojas com o item.'}
          </p>
        </div>
        <div className="bg-gray-100 rounded-xl p-1">
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'meus' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTab('meus')}
          >
            <span className="hidden sm:inline">Minha loja</span>
            <span className="sm:hidden">Loja</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === 'geral' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTab('geral')}
          >
            Cidade
          </button>
        </div>
      </div>

      {tab === 'meus' ? (
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
              {meus.slice(0, 8).map((it, i) => {
                const g = getGeralByNome(it.nome);
                const cityMedian = it.mediana ?? g?.mediana ?? null;
                const cityStores = g?.lojas ?? null;
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
                      <InfoMediana nome={it.nome} mediana={cityMedian ?? undefined} lojas={cityStores ?? undefined} />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <DiffBadge value={it.diffPct} meuPreco={it.meuPreco} mediana={cityMedian ?? undefined} />
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
            </tbody>
          </table>
        </div>
      ) : (
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
              {geral.slice(0, 8).map((it, i) => (
                <motion.tr
                  key={it.nome}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b"
                >
                  <td className="py-2 px-3 font-medium">{it.nome}</td>
                  <td className="py-2 px-3 text-center">
                    <InfoMediana nome={it.nome} mediana={it.mediana} lojas={it.lojas} />
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopItems;
