// Single Responsibility: Lista de atividade recente com scroll interno
import React from 'react';
import { AtividadeRecente } from '../../services/DashboardService';
import { MessageCircle, MapPin, Eye, Search } from 'lucide-react';

const iconByType: Record<AtividadeRecente['tipo'], React.ElementType> = {
  BUSCA: Search,
  MOSTRADO: Eye,
  WPP: MessageCircle,
  MAPA: MapPin,
  BUSCA_ZERO: Search,
};

type Props = { activities: AtividadeRecente[] };

export const RecentActivity: React.FC<Props> = ({ activities }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Atividade recente</h3>
      {/* Scroll interno, sem “ver mais” */}
      <div className="max-h-80 overflow-y-auto pr-1">
        <ul className="divide-y divide-gray-100">
          {activities.map((ev, i) => {
            const Icon = iconByType[ev.tipo];
            const when = new Date(ev.ts).toLocaleString();
            const label =
              ev.tipo === 'BUSCA'
                ? `Cliente buscou “${ev.termo ?? ''}”`
                : ev.tipo === 'BUSCA_ZERO'
                ? `Sem resultados para “${ev.termo ?? ''}”`
                : ev.tipo === 'WPP'
                ? `WhatsApp aberto`
                : ev.tipo === 'MAPA'
                ? `Mapa aberto`
                : `Item mostrado`;
            return (
              <li key={i} className="py-3 flex items-start gap-3">
                <div className="mt-0.5">
                  <Icon className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-900 truncate">{label}</div>
                  <div className="text-xs text-gray-500">{when}</div>
                </div>
              </li>
            );
          })}
          {activities.length === 0 && (
            <li className="py-6 text-sm text-gray-500 text-center">Sem atividade no período.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
