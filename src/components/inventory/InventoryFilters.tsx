// Single Responsibility: Componente específico para filtros do inventário
// Interface Segregation: Props específicas e enxutas
import React from 'react';
import { HelpCircle } from 'lucide-react';

export type FilterType = 'all' | 'available' | 'unavailable' | 'outdated' | 'no-price';

interface FilterChip {
  id: FilterType;
  label: string;
  count: number;
  tooltip?: string;
}

interface InventoryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filterChips: FilterChip[];
}

// Open/Closed: Extensível para novos tipos de filtro
export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  activeFilter,
  onFilterChange,
  filterChips
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterChips.map(chip => (
        <div key={chip.id} className="relative group">
          <button
            onClick={() => onFilterChange(chip.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === chip.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {chip.label}
          </button>
          
          {/* Tooltip */}
          {chip.tooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {chip.tooltip}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};