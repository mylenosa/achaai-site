// Single Responsibility: gráfico simples de impressões (sem dependências extras)
import React from 'react';

export interface WeekChartProps {
  period: '7d' | '30d';
  labels: string[];
  values: number[];
}

export const WeekChart: React.FC<WeekChartProps> = ({ period, labels, values }) => {
  const max = Math.max(1, ...values);
  const title =
    period === '7d'
      ? 'Impressões por dia (últimos 7 dias)'
      : 'Impressões por semana (últimas 4 semanas)';

  const isEmpty = values.every((v) => v === 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {isEmpty ? (
        <div className="h-48 flex items-center justify-center text-gray-500">
          Sem dados no período
        </div>
      ) : (
        <div className="flex items-end justify-between h-56 gap-2">
          {values.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-emerald-500 rounded-t-lg"
                style={{ height: `${(v / max) * 100}%` }}
                title={`${labels[i]} — ${v.toLocaleString('pt-BR')}`}
              />
              <div className="text-xs text-gray-600 mt-2 font-medium">{labels[i]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
