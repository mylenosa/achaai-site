// Single Responsibility: Componente específico para tabela de top itens
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Plus } from 'lucide-react';

interface AtividadeRecente {
  tipo: 'BUSCA' | 'MOSTRADO' | 'WPP' | 'MAPA';
  ts: Date;
  termo: string;
}

interface TopItemMeu {
  nome: string;
  exibicoes: number;
  conversas: number;
  ctr: number;
  meuPreco?: number | null;
  mediana: number;
  diffPct?: number | null;
}

interface TopItemGeral {
  nome: string;
  mediana: number;
  lojas: number;
}

interface TopItemsProps {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  mediana?: number | null;
  onViewInStock: (itemName: string) => void;
  onAddItem: (itemName: string) => void;
  onAddPrice: (itemName: string) => void;
}

type SortField = 'nome' | 'exibicoes' | 'conversas' | 'ctr' | 'meuPreco' | 'mediana';
type SortDirection = 'asc' | 'desc';

const TopItems: React.FC<TopItemsProps> = ({ 
  meus, 
  geral, 
  onViewInStock, 
  onAddItem, 
  onAddPrice 
}) => {
  const [activeTab, setActiveTab] = useState<'meus' | 'geral'>('meus');
  const [sortField, setSortField] = useState<SortField>('exibicoes');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatBRL = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPct = (value: number, showSign: boolean = true): string => {
    const formatted = (value * 100).toFixed(1) + '%';
    return showSign && value > 0 ? '+' + formatted : formatted;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const sortedMeus = [...meus].sort((a, b) => {
    let aVal: number, bVal: number;
    
    switch (sortField) {
      case 'nome':
        return sortDirection === 'asc' 
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome);
      case 'exibicoes':
        aVal = a.exibicoes;
        bVal = b.exibicoes;
        break;
      case 'conversas':
        aVal = a.conversas;
        bVal = b.conversas;
        break;
      case 'ctr':
        aVal = a.ctr;
        bVal = b.ctr;
        break;
      case 'meuPreco':
        aVal = a.meuPreco ?? -1;
        bVal = b.meuPreco ?? -1;
        break;
      case 'mediana':
        aVal = a.mediana ?? -1;
        bVal = b.mediana ?? -1;
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getDiffBadge = (diffPct: number | null) => {
    if (diffPct === null) return null;
    
    const isPositive = diffPct > 0;
    const color = isPositive ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
    const icon = isPositive ? '↑' : '↓';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon} {formatPct(Math.abs(diffPct), false)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Itens</h3>
        
        {/* Segmented Control */}
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab('meus')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'meus' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Meus
          </button>
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'geral' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Geral
          </button>
        </div>
      </div>

      {activeTab === 'meus' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('nome')}
                >
                  <div className="flex items-center gap-1">
                    Item
                    {getSortIcon('nome')}
                  </div>
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('exibicoes')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Exibições
                    {getSortIcon('exibicoes')}
                  </div>
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('conversas')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Conversas
                    {getSortIcon('conversas')}
                  </div>
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('ctr')}
                >
                  <div className="flex items-center justify-center gap-1">
                    CTR
                    {getSortIcon('ctr')}
                  </div>
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('meuPreco')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Seu preço
                    {getSortIcon('meuPreco')}
                  </div>
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('mediana')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Mediana (cidade)
                    {getSortIcon('mediana')}
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Dif.</th>
              </tr>
            </thead>
            <tbody>
              {sortedMeus.map((item, index) => (
                <motion.tr
                  key={item.nome}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{item.nome}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatNumber(item.exibicoes)}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatNumber(item.conversas)}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatPct(item.ctr, false)}</td>
                  <td className="py-3 px-4 text-center">
                    {item.meuPreco ? (
                      <span className="text-gray-900">{formatBRL(item.meuPreco)}</span>
                    ) : (
                      <button
                        onClick={() => onAddPrice(item.nome)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm underline"
                      >
                        adicionar preço
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatBRL(item.mediana)}</td>
                  <td className="py-3 px-4 text-center">{getDiffBadge(item.diffPct)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {sortedMeus.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum item encontrado
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Mediana (cidade)</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Lojas (n)</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Ação</th>
              </tr>
            </thead>
            <tbody>
              {geral.map((item, index) => (
                <motion.tr
                  key={item.nome}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{item.nome}</td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {formatBRL(item.mediana)}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{item.lojas}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewInStock(item.nome)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver em estoque
                      </button>
                      <button
                        onClick={() => onAddItem(item.nome)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar item
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {geral.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum item encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopItems;