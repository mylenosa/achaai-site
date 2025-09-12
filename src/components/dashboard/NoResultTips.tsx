// src/components/dashboard/NoResultTips.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Lightbulb } from 'lucide-react';
import { TipSemResultado } from '../../services/DashboardService';

interface NoResultTipsProps {
  tips: TipSemResultado[];
  onAddItem: (itemName: string) => void;
}

export const NoResultTips: React.FC<NoResultTipsProps> = ({ tips, onAddItem }) => {
  if (tips.length === 0) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Oportunidades de Estoque</h3>
                    <p className="text-sm text-gray-500">Termos buscados por clientes que você pode vender.</p>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500">Nenhuma oportunidade encontrada no período.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Oportunidades de Estoque</h3>
          <p className="text-sm text-gray-500">Termos buscados por clientes que você pode vender.</p>
        </div>
      </div>
      
      <div className="space-y-2 flex-1 mt-2 pr-2 overflow-y-auto">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.termo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-yellow-50/50 rounded-lg border border-yellow-200/60"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 font-medium truncate">"{tip.termo}"</div>
              <div className="text-gray-500 text-xs">{tip.qtd} buscas este mês</div>
            </div>
            <button
              onClick={() => onAddItem(tip.termo)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};