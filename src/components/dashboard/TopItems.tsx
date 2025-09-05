// Single Responsibility: Componente específico para tabela de top itens
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Plus, Eye, Info } from 'lucide-react';
import { TopItemMeu, TopItemGeral } from '../../services/DashboardService';
import { formatNumber, formatPct, formatBRL } from '../../utils/formatters';

interface TopItemsProps {
  meus: TopItemMeu[];
  geral: TopItemGeral[];
  onAddPrice: (itemName: string) => void;
  onViewInStock: (itemName: string) => void;
  onAddItem: (itemName: string) => void;
}

type SortField = 'nome' | 'exibicoes' | 'conversas' | 'diffPct';
type SortDirection = 'asc' | 'desc';

export const TopItems: React.FC<TopItemsProps> = ({ 
  meus, 
  geral, 
  onAddPrice, 
  onViewInStock, 
  onAddItem 
}) => {
  const [activeTab, setActiveTab] = useState<'meus' | 'geral'>('meus');
  const [sortField, setSortField] = useState<SortField>('conversas');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showAll, setShowAll] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const sortedMeus = [...meus].sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortField) {
      case 'nome':
        aVal = a.nome.toLowerCase();
        bVal = b.nome.toLowerCase();
        break;
      case 'exibicoes':
        aVal = a.exibicoes;
        bVal = b.exibicoes;
        break;
      case 'conversas':
        aVal = a.conversas;
        bVal = b.conversas;
        break;
      case 'diffPct':
        aVal = a.diffPct ?? -999;
        bVal = b.diffPct ?? -999;
        break;
      default:
        return 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const displayedMeus = showAll ? sortedMeus : sortedMeus.slice(0, 5);
  const displayedGeral = showAll ? geral : geral.slice(0, 5);

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
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
                   {/* Tooltip */}
                   <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                     Cada vez que seu item apareceu para um cliente.
                     <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
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
                   {/* Tooltip */}
                   <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                     Aberturas de WhatsApp ou Mapa.
                     <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                   </div>
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors relative group"
                  onClick={() => handleSort('diffPct')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Dif.%
                    {getSortIcon('diffPct')}
                  </div>
                   {/* Tooltip */}
                   <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                     Diferença entre seu preço e a mediana da cidade (anônimo).
                     <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                   </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedMeus.map((item, index) => (
                <motion.tr
                  key={item.nome}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors relative"
                  onMouseEnter={() => setHoveredRow(item.nome)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="py-3 px-4 font-medium text-gray-900 relative">
                    <div className="flex items-center gap-2">
                      {item.nome}
                      <button className="text-gray-400 hover:text-gray-600">
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Popover com detalhes */}
                    {hoveredRow === item.nome && (
                      <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-20">
                        <div><strong>Seu preço:</strong> {item.meuPreco ? formatBRL(item.meuPreco) : '—'}</div>
                        <div><strong>Mediana (cidade):</strong> {item.mediana ? formatBRL(item.mediana) : '—'}</div>
                        <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatNumber(item.exibicoes)}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{formatNumber(item.conversas)}</td>
                  <td className="py-3 px-4 text-center">
                    {item.diffPct !== null ? getDiffBadge(item.diffPct) : <span className="text-gray-400">—</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {displayedMeus.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum item encontrado
            </div>
          )}
          
          {/* Ver todos link */}
          {sortedMeus.length > 5 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                {showAll ? 'Ver menos' : 'Ver todos'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700 relative group">
                  Mediana (cidade)
                  {/* Tooltip */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    Dados insuficientes na cidade.
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Lojas (n)</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Ação</th>
              </tr>
            </thead>
            <tbody>
              {displayedGeral.map((item, index) => (
                <motion.tr
                  key={item.nome}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{item.nome}</td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {item.n >= 5 ? formatBRL(item.mediana) : '—'}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">{item.n}</td>
                  <td className="py-3 px-4 text-center">
                    {item.hasMine ? (
                      <button
                        onClick={() => onViewInStock(item.nome)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver no meu estoque
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddItem(item.nome)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar item
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {displayedGeral.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum item encontrado
            </div>
          )}
          
          {/* Ver todos link */}
          {geral.length > 5 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                {showAll ? 'Ver menos' : 'Ver todos'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};