// src/components/dashboard/WeekChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatNumber, formatPct, getDeltaColor } from '../../utils/formatters';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export interface WeekChartProps {
  title: string;
  labels: string[];
  values: number[];
  total: number;
  prevTotal: number;
  delta: number;
}

const DeltaIcon: React.FC<{ delta: number }> = ({ delta }) => {
  const className = "w-5 h-5 inline-block";
  if (delta > 0.001) return <TrendingUp className={className} />;
  if (delta < -0.001) return <TrendingDown className={className} />;
  return <ArrowRight className={className} />;
};

export const WeekChart: React.FC<WeekChartProps> = ({ title, labels, values, total, prevTotal, delta }) => {
  const data = labels.map((label, index) => ({
    name: label,
    Impressões: values[index],
  }));

  const isEmpty = values.every((v) => v === 0);
  const deltaColor = getDeltaColor(delta);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 h-full flex flex-col">
      {/* Cabeçalho com Resumo Comparativo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-baseline gap-3 mt-1">
          <p className="text-3xl font-bold text-gray-800">{formatNumber(total)}</p>
          <div className={`flex items-center text-md font-semibold ${deltaColor}`}>
            <DeltaIcon delta={delta} />
            <span>{formatPct(Math.abs(delta))}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          vs. {formatNumber(prevTotal)} no período anterior
        </p>
      </div>

      {/* Gráfico */}
      <div className="flex-1 mt-4 min-h-[200px]">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Sem dados no período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="Impressões" barSize={20} radius={[4, 4, 0, 0]}>
                {/* CORREÇÃO APLICADA AQUI: removi 'entry' que não estava sendo usado */}
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#10b981" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};