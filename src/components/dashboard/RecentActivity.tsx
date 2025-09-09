// Single Responsibility: Lista de atividades recentes (com scroll, sem “ver mais”)
import React from 'react';
import { MessageCircle, MapPin, Eye } from 'lucide-react';

export interface AtividadeRecente {
  tipo: 'BUSCA' | 'MOSTRADO' | 'WPP' | 'MAPA' | 'BUSCA_ZERO';
  ts: Date;
  termo?: string;
}

export const RecentActivity: React.FC<{ activities: AtividadeRecente[] }> = ({ activities }) => {
  const iconByType = (t: AtividadeRecente['tipo']) => {
    switch (t) {
      case 'WPP': return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'MAPA': return <MapPin className="w-4 h-4 text-blue-600" />;
      default: return <Eye className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Atividade Recente</h3>
      <div className="max-h-[420px] overflow-y-auto pr-2 divide-y divide-gray-100">
        {activities.slice(0, 50).map((a, i) => (
          <div key={i} className="py-3 flex items-start gap-3">
            <div className="mt-0.5">{iconByType(a.tipo)}</div>
            <div className="min-w-0">
              <div className="text-sm text-gray-900">
                {a.tipo === 'WPP' && <>Cliente abriu WhatsApp</>}
                {a.tipo === 'MAPA' && <>Cliente abriu Mapa</>}
                {a.tipo === 'MOSTRADO' && <>Você apareceu para ‘{a.termo}’</>}
                {a.tipo === 'BUSCA' && <>Busca por ‘{a.termo}’</>}
                {a.tipo === 'BUSCA_ZERO' && <>Sem resultado para ‘{a.termo}’</>}
              </div>
              <div className="text-xs text-gray-500">
                {new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(
                  Math.round((a.ts.getTime() - Date.now()) / (60 * 60 * 1000)),
                  'hour'
                )}
              </div>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="py-10 text-center text-gray-500 text-sm">Sem atividades no período</div>
        )}
      </div>
    </div>
  );
};
