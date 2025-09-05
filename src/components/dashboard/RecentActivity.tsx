// Single Responsibility: Componente específico para atividade recente
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Search, Eye } from 'lucide-react';
import { AtividadeRecente } from '../../services/DashboardService';
import { formatRelTime } from '../../utils/formatters';

interface RecentActivityProps {
  activities: AtividadeRecente[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (tipo: AtividadeRecente['tipo']) => {
    switch (tipo) {
      case 'CLIQUE_WHATSAPP':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'CLIQUE_MAPA':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'BUSCA_EXECUTADA':
        return <Search className="w-4 h-4 text-purple-500" />;
      case 'RESULTADO_MOSTRADO':
        return <Eye className="w-4 h-4 text-orange-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Atividade Recente
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
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
                {activity.texto}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatRelTime(activity.tempo)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma atividade recente
        </div>
      )}
    </div>
  );
};