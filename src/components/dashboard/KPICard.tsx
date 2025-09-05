// Single Responsibility: Componente específico para card de KPI
// Interface Segregation: Props específicas e enxutas
import React from 'react';
import { motion } from 'framer-motion';
import { formatNumber, formatPct, getDeltaColor, getDeltaIcon } from '../../utils/formatters';

interface KPICardProps {
  title: string;
  value: number;
  delta: number;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, delta, icon: Icon, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-emerald-50 rounded-xl p-3">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
        <div className={`text-sm font-medium flex items-center gap-1 ${getDeltaColor(delta)}`}>
          <span>{getDeltaIcon(delta)}</span>
          <span>{formatPct(Math.abs(delta), false)}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-gray-900">
          {title === 'CTR' ? formatPct(value, false) : formatNumber(value)}
        </h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </motion.div>
  );
};