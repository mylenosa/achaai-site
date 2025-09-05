// Single Responsibility: Componente específico para atividade recente
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Search, Eye } from 'lucide-react';
import { AtividadeRecente } from '../../services/DashboardService';
import { formatRelTime } from '../../utils/formatters';

interface RecentActivityProps {
  activities: AtividadeRecente[];
  maxItems?: number;
  showSeeAll?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  maxItems = 5, 
  showSeeAll = true 
}) => {
  const getActivityIcon = (tipo: AtividadeRecente['tipo']) => {
    switch (tipo) {
      case 'WPP':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'MAPA':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'BUSCA':
        return <Search className="w-4 h-4 text-purple-500" />;
      case 'MOSTRADO':
        return <Eye className="w-4 h-4 text-orange-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getActivityText = (activity: AtividadeRecente) => {
    switch (activity.tipo) {
      case 'MAPA':
        return 'Cliente abriu Mapa';
      case 'WPP':
        return 'Cliente abriu WhatsApp';
      case 'MOSTRADO':
        return `Você apareceu para '${activity.termo}'`;
      case 'BUSCA_ZERO':
        return `Sem resultado para '${activity.termo}' (${activity.count || 1})`;
      case 'BUSCA':
        return `Busca por '${activity.termo}'`;
      default:
        return 'Atividade desconhecida';
    }
  };

  const displayedActivities = activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Atividade Recente
      </h3>
      
      <div className="space-y-4 flex-1">
        {displayedActivities.map((activity, index) => (
          <motion.div
            key={`${activity.tipo}-${activity.ts.getTime()}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.tipo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 leading-relaxed">
                {getActivityText(activity)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                há {formatRelTime(activity.ts)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {displayedActivities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma atividade recente
        </div>
      )}
      
      {showSeeAll && hasMore && (
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            Ver tudo
          </button>
        </div>
      )}
    </div>
  );
};