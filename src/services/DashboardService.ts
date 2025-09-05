// Single Responsibility: Componente específico para tabela de top itens
import React, { useState } from 'react';
import { motion } from 'framer-motion';
    return termos.slice(0, maxItems).map(termo => ({ 
      termo, 
      qtd: this.random(2, 8) 
    }));
  tipo: 'BUSCA' | 'MOSTRADO' | 'WPP' | 'MAPA';
import { TopItemMeu, TopItemGeral } from '../../services/DashboardService';
  ts: Date;
interface TopItemsProps {
  geral: TopItemGeral[];
  mediana?: number | null;
  onViewInStock: (itemName: string) => void;
  onAddItem: (itemName: string) => void;
  qtd: number;
}

type SortField = 'nome' | 'exibicoes' | 'conversas' | 'ctr' | 'meuPreco' | 'mediana';
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
    const tipos: AtividadeRecente['tipo'][] = ['BUSCA', 'MOSTRADO', 'WPP', 'MAPA'];
              Nenhum item encontrado
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
      const ts = new Date(Date.now() - this.random(1, periodo === '30d' ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000));
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{item.nome}</td>
        case 'WPP':
                  <td className="py-3 px-4 text-center text-gray-700">
          texto = 'Cliente abriu conversa no WhatsApp';
        case 'MAPA':
                  <td className="py-3 px-4 text-center">
          texto = 'Cliente abriu rota no mapa';
                        onClick={() => onViewInStock(item.nome)}
        case 'BUSCA':
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
          texto = `Busca por "${termo}"`;
                        <Eye className="w-4 h-4" />
        case 'MOSTRADO':
          texto = `Sua loja apareceu para "${termo}"`;
                      </button>
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar item
        ts,
                      </button>
        termo
              ))}
            </tbody>
          </table>
    return atividades.sort((a, b) => b.ts.getTime() - a.ts.getTime());
          
            <div className="text-center py-8 text-gray-500">
              Nenhum item encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
};