// Single Responsibility: Componente específico para dicas de sem resultado
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle } from 'lucide-react';
import { TipSemResultado } from '../../services/DashboardService';

interface NoResultTipsProps {
  tips: TipSemResultado[];
  onAddItem: (itemName: string) => void;
  limit?: number;
}

export const NoResultTips: React.FC<NoResultTipsProps> = ({ tips, onAddItem, limit = 5 }) => {
  const displayedTips = tips.slice(0, limit);
  
  if (displayedTips.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-4 relative group">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-orange-800">
          Sem resultado recentemente
        </h3>
        
        {/* Tooltip */}
        <div className="absolute -top-2 right-0 transform -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          Termos buscados que não encontraram itens seus.
          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
      
      <div className="space-y-2 flex-1">
        {displayedTips.map((tip, index) => (
          <motion.div
            key={tip.termo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
          >
            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-medium">"{tip.termo}"</div>
              <div className="text-gray-500 text-sm">{tip.qtd} buscas</div>
            </div>
            <button
              onClick={() => onAddItem(tip.termo)}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex-shrink-0 ml-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar item
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};