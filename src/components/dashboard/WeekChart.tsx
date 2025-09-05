// Single Responsibility: Componente específico para gráfico da semana
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '../../utils/formatters';

interface WeekChartProps {
  data: number[];
}

export const WeekChart: React.FC<WeekChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const maxValue = Math.max(...data);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 relative group">
      <div className="relative">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Impressões por dia da semana (últimas 4 semanas)
        </h3>
        
        {/* Tooltip */}
        <div className="absolute -top-2 right-0 transform -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          Soma das impressões por dia da semana (últimas 4 semanas).
          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
        </h3>
        
        {/* Tooltip */}
        <div className="absolute -top-2 right-0 transform -translate-y-full bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          Soma das impressões por dia da semana (últimas 4 semanas).
          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
      
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((value, index) => {
          const height = (value / maxValue) * 100;
          const isHovered = hoveredIndex === index;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative flex-1 flex items-end w-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`w-full rounded-t-lg transition-colors cursor-pointer ${
                    isHovered ? 'bg-emerald-600' : 'bg-emerald-500'
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                
                {/* Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                  >
                    {formatNumber(value)}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </motion.div>
                )}
              </div>
              
              <div className="text-xs text-gray-600 mt-2 font-medium">
                {days[index]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};