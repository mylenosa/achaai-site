// src/components/dashboard/KPICard.tsx (versão aprimorada)
import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  MapPin, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight 
} from 'lucide-react';
import { formatNumber, formatPct, getDeltaColor } from '../../utils/formatters';

type Title = 'WhatsApp' | 'Mapa' | 'Impressões' | 'CTR';

const iconMap: Record<Title, React.ComponentType<{ className?: string }>> = {
  WhatsApp: MessageCircle,
  Mapa: MapPin,
  Impressões: Eye,
  CTR: TrendingUp,
};

// Nova descrição curta para cada card
const descriptionMap: Record<Title, string> = {
  WhatsApp: 'Conversas iniciadas',
  Mapa: 'Cliques no mapa',
  Impressões: 'Aparições em buscas',
  CTR: 'Cliques por visualização',
};

interface KPICardProps {
  title: Title;
  value: number;
  delta?: number;
  index?: number;
}

// Componente interno para o ícone de variação
const DeltaIcon: React.FC<{ delta: number }> = ({ delta }) => {
  const className = "w-4 h-4";
  if (delta > 0.001) return <TrendingUp className={className} />;
  if (delta < -0.001) return <TrendingDown className={className} />;
  return <ArrowRight className={className} />;
};


export const KPICard: React.FC<KPICardProps> = ({ title, value, delta = 0, index = 0 }) => {
  const Icon = iconMap[title];
  const description = descriptionMap[title];
  const deltaColor = getDeltaColor(delta);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow flex flex-col justify-between h-full"
    >
      {/* Seção Superior: Ícone e Título */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 rounded-lg p-2">
            <Icon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Valor e Variação */}
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl lg:text-4xl font-bold text-gray-900">
          {title === 'CTR' ? formatPct(value) : formatNumber(value)}
        </p>
        <div className={`flex items-center gap-1 text-sm font-medium ${deltaColor}`}>
          <DeltaIcon delta={delta} />
          <span>{formatPct(Math.abs(delta))}</span>
        </div>
      </div>
    </motion.div>
  );
};