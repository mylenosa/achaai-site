// src/components/dashboard/KPICard.tsx
// Single Responsibility: Componente específico para card de KPI
// Interface Segregation: Props específicas e enxutas
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Eye, TrendingUp } from 'lucide-react';
import { formatNumber, formatPct, getDeltaColor, getDeltaIcon } from '../../utils/formatters';

type Title = 'WhatsApp' | 'Mapa' | 'Impressões' | 'CTR';

const iconMap: Record<Title, React.ComponentType<{ className?: string }>> = {
  WhatsApp: MessageCircle,
  Mapa: MapPin,
  Impressões: Eye,
  CTR: TrendingUp,
};

const tooltipMap: Record<Title, string> = {
  WhatsApp: 'Conversas iniciadas',
  Mapa: 'Rotas abertas',
  Impressões: 'Exibições da loja',
  CTR: 'Taxa de conversão',
};

interface KPICardProps {
  title: Title;
  value: number;
  delta?: number;
  index?: number;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, delta = 0, index = 0 }) => {
  const Icon = iconMap[title];
  const tooltip = tooltipMap[title];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow relative group"
    >
      {/* Tooltip */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="bg-emerald-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
        </div>
        <div className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>{getDeltaIcon(delta)}</span>
          <span>{formatPct(Math.abs(delta), false)}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {title === 'CTR' ? formatPct(value, false) : formatNumber(value)}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">{title}</p>
      </div>
    </motion.div>
  );
};
