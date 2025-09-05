// Single Responsibility: Componente específico para tabela do inventário
// Liskov Substitution: Pode ser substituído por outros tipos de visualização
import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { InventoryItem } from '../../services/InventoryService';

export type SortField = 'title' | 'price' | 'verifiedAt';
export type SortDirection = 'asc' | 'desc';

interface InventoryTableProps {
  items: InventoryItem[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onToggleAvailable: (id: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number | null) => string;
  getVerificationStatus: (item: InventoryItem) => {
    color: string;
    bg: string;
    label: string;
  };
  formatRelativeTime: (days: number) => string;
  ageInDays: (date: string) => number;
}

// Interface Segregation: Props específicas para a tabela
export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  sortField,
  sortDirection,
  onSort,
  onToggleAvailable,
  onEdit,
  onDelete,
  formatCurrency,
  getVerificationStatus,
  formatRelativeTime,
  ageInDays
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center gap-1">
                  Item
                  {getSortIcon('title')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('price')}
              >
                <div className="flex items-center gap-1">
                  Preço
                  {getSortIcon('price')}
                </div>
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Tem agora?</th>
              <th 
                className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onSort('verifiedAt')}
              >
                <div className="flex items-center justify-center gap-1">
                  Última confirmação
                  {getSortIcon('verifiedAt')}
                </div>
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const daysOld = item.verifiedAt ? ageInDays(item.verifiedAt) : null;
              const verificationStatus = getVerificationStatus(item);
              
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      {item.title}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{formatCurrency(item.price)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleAvailable(item.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        item.available ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.available ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {daysOld !== null ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="text-center">
                          <div className="relative group">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.color} ${verificationStatus.bg}`}>
                              {verificationStatus.label}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              {verificationStatus.label === 'OK' ? 'Confirmado recentemente' :
                               verificationStatus.label === 'A revisar' ? 'Sem confirmação recente (ex.: 60+ dias)' :
                               'Precisa de atenção (ex.: 120+ dias)'}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{formatRelativeTime(daysOld)}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {items.map((item, index) => {
          const daysOld = item.verifiedAt ? ageInDays(item.verifiedAt) : null;
          const verificationStatus = getVerificationStatus(item);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.title}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(item.price)}
                  </div>
                </div>
                <button
                  onClick={() => onToggleAvailable(item.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    item.available ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.available ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {daysOld !== null ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.color} ${verificationStatus.bg}`}>
                        {verificationStatus.label}
                      </span>
                      <span className="text-xs text-gray-500">{formatRelativeTime(daysOld)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Não confirmado</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};