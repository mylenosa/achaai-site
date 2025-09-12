// src/components/dashboard/RecentActivity.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AtividadeRecente } from '../../services/DashboardService';
import { formatRelTime } from '../../utils/formatters';
import { MessageCircle, MapPin, ArrowRight } from 'lucide-react';

type Props = {
  activities: AtividadeRecente[];
};

const activityConfig = {
  WPP: {
    icon: MessageCircle,
    text: "Novo contato via WhatsApp",
    color: "text-green-600",
    bg: "bg-green-100/70"
  },
  MAPA: {
    icon: MapPin,
    text: "Cliente traçou rota para a loja",
    color: "text-blue-600",
    bg: "bg-blue-100/70"
  },
};

export const RecentActivity: React.FC<Props> = ({ activities }) => {
  const displayedActivities = activities.slice(0, 5); // Garante que no máximo 5 itens sejam exibidos

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Últimos Contatos de Clientes</h3>
        <p className="text-sm text-gray-500">Leads gerados nos últimos dias.</p>
      </div>
      
      <div className="space-y-3 flex-1 mt-4 overflow-hidden">
        {displayedActivities.length > 0 ? (
          displayedActivities.map((activity, i) => {
            const config = activityConfig[activity.tipo];
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-sm p-2 rounded-lg"
              >
                <div className={`flex-shrink-0 p-2 rounded-full ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-800 font-medium">{config.text}</p>
                  <p className="text-xs text-gray-500">{formatRelTime(activity.ts)}</p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Nenhum contato recente.
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center justify-center gap-1">
            Ver histórico completo <ArrowRight className="w-4 h-4" />
          </a>
      </div>
    </div>
  );
};