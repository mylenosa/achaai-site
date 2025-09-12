// src/components/dashboard/RecentActivity.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AtividadeRecente } from '../../services/DashboardService';
import { formatRelTime } from '../../utils/formatters';
import { MessageCircle, MapPin } from 'lucide-react';

type Props = {
  activities: AtividadeRecente[];
};

const activityConfig = {
  WPP: {
    icon: MessageCircle,
    text: "Novo contato via WhatsApp",
    color: "text-green-600",
    bg: "bg-green-50"
  },
  MAPA: {
    icon: MapPin,
    text: "Cliente traçou rota para a loja",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
};

export const RecentActivity: React.FC<Props> = ({ activities }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acontecimentos Importantes</h3>
      <div className="space-y-3 flex-1 overflow-y-auto min-h-[200px] pr-2">
        {activities.length > 0 ? (
          activities.map((activity, i) => {
            const config = activityConfig[activity.tipo];
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 text-sm p-2 rounded-lg"
              >
                <div className={`mt-0.5 p-2 rounded-full ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
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
            Nenhuma atividade recente.
          </div>
        )}
      </div>
    </div>
  );
};