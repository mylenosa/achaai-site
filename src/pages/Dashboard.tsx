// Single Responsibility: Página principal do dashboard
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, MapPin, Eye, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createDashboardService, KPIData, TopItemMeu, TopItemGeral, AtividadeRecente, TipSemResultado } from '../services/DashboardService';
import { KPICard } from '../components/dashboard/KPICard';
import { WeekChart } from '../components/dashboard/WeekChart';
import { TopItems } from '../components/dashboard/TopItems';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { NoResultTips } from '../components/dashboard/NoResultTips';

// Dependency Inversion: Usa abstração do serviço
const dashboardService = createDashboardService();

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado do período
  const [periodo, setPeriodo] = useState<'7d' | '30d'>('7d');
  
  // Estados dos dados
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [weekData, setWeekData] = useState<number[]>([]);
  const [topMeus, setTopMeus] = useState<TopItemMeu[]>([]);
  const [topGeral, setTopGeral] = useState<TopItemGeral[]>([]);
  const [activities, setActivities] = useState<AtividadeRecente[]>([]);
  const [tips, setTips] = useState<TipSemResultado[]>([]);

  // Carregar dados quando período muda
  useEffect(() => {
    const loadData = () => {
      setKpis(dashboardService.getKPIs(periodo));
      setWeekData(dashboardService.getBarrasSemana());
      setTopMeus(dashboardService.getTopItensMeus(periodo));
      setTopGeral(dashboardService.getTopItensGeral(periodo));
      setActivities(dashboardService.getAtividadeRecente(periodo));
      setTips(dashboardService.getTipsSemResultado(periodo));
    };

    loadData();
  }, [periodo]);

  // Handlers para navegação
  const handleAddPrice = (itemName: string) => {
    // Navegar para estoque com filtro do item
    navigate(`/portal/estoque?search=${encodeURIComponent(itemName)}`);
  };

  const handleViewInStock = (itemName: string) => {
    // Navegar para estoque com filtro do item
    navigate(`/portal/estoque?search=${encodeURIComponent(itemName)}`);
  };

  const handleAddItem = (itemName: string) => {
    // Navegar para estoque e abrir modal de criação (simulado via query param)
    navigate(`/portal/estoque?add=${encodeURIComponent(itemName)}`);
  };

  // KPIs configuration
  const kpiConfigs = [
    { key: 'whatsapp', title: 'WhatsApp', icon: MessageCircle },
    { key: 'mapa', title: 'Mapa', icon: MapPin },
    { key: 'impressoes', title: 'Impressões', icon: Eye },
    { key: 'ctr', title: 'CTR', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Acompanhe o desempenho da sua loja
            <span className="ml-2 text-xs text-gray-500">
              (Últimos {periodo === '7d' ? '7 dias' : '30 dias'})
            </span>
          </p>
        </div>
        
        {/* Period Toggle */}
        <div className="bg-gray-100 rounded-xl p-1 flex self-start sm:self-auto">
          <button
            onClick={() => setPeriodo('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              periodo === '7d' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriodo('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              periodo === '30d' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            30 dias
          </button>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {kpiConfigs.map((config, index) => (
            <KPICard
              key={config.key}
              title={config.title}
              value={kpis[config.key as keyof KPIData] as number}
              delta={kpis.deltaKpis[config.key as keyof typeof kpis.deltaKpis]}
              icon={config.icon}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Week Chart */}
      <WeekChart data={weekData} />

      {/* Top Items */}
      <TopItems
        meus={topMeus}
        geral={topGeral}
        onAddPrice={handleAddPrice}
        onViewInStock={handleViewInStock}
        onAddItem={handleAddItem}
      />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        {/* No Result Tips */}
        <div>
          <NoResultTips tips={tips} onAddItem={handleAddItem} />
        </div>
      </div>
    </div>
  );
};