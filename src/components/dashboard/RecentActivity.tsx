// src/components/dashboard/RecentActivity.tsx
import React from 'react';
import { AtividadeRecente } from '../../services/DashboardService';
import { MessageCircle, MapPin, Eye } from 'lucide-react';

type Props = {
  activities: AtividadeRecente[];
  maxHeight?: number;      // px
};

const iconFor = (tipo: AtividadeRecente['tipo']) => {
  const cls = 'w-4 h-4';
  switch (tipo) {
    case 'WPP': return <MessageCircle className={cls} />;
    case 'MAPA': return <MapPin className={cls} />;
    default: return <Eye className={cls} />;
  }
};

export const RecentActivity: React.FC<Props> = ({ activities, maxHeight = 320 }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
      <div className="space-y-3" style={{ maxHeight, overflowY: 'auto' }}>
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <div className="mt-0.5 text-gray-600">{iconFor(a.tipo)}</div>
            <div className="min-w-0">
              <div className="text-gray-800">
                {a.tipo === 'WPP' && 'Cliente abriu WhatsApp'}
                {a.tipo === 'MAPA' && 'Cliente abriu Mapa'}
                {a.tipo === 'BUSCA' && <>Você apareceu para <span className="font-medium">‘{a.termo}’</span></>}
                {a.tipo === 'MOSTRADO' && 'Seu item foi mostrado'}
                {a.tipo === 'BUSCA_ZERO' && <>Sem resultado para <span className="font-medium">‘{a.termo}’</span></>}
              </div>
              <div className="text-xs text-gray-500">há algumas horas</div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-sm text-gray-500">Sem atividades no período.</div>
        )}
      </div>
    </div>
  );
};
