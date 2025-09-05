// Single Responsibility: Componente específico para dicas de sem resultado
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle } from 'lucide-react';
import { TipSemResultado } from '../../services/DashboardService';

interface NoResultTipsProps {
  tips: TipSemResultado[];
  onAddItem: (itemName: string) => void;
}

export const NoResultTips: React.FC<NoResultTipsProps> = ({ tips, onAddItem }) => {
  if (tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-50 border border-orange-200 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-orange-800">
          Sem resultado recentemente
        </h3>
      </div>
      
      <p className="text-orange-700 text-sm mb-4">
        Estes termos foram buscados mas não retornaram resultados. Considere adicionar estes itens ao seu estoque:
      </p>
      
      <div className="space-y-2">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.termo}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
          >
            <span className="text-gray-900 font-medium">"{tip.termo}"</span>
            <button
              onClick={() => onAddItem(tip.termo)}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Adicionar item
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};