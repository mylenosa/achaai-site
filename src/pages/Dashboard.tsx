// Single Responsibility: Página principal do dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createDashboardService,
  KPIData,
  TopItemMeu,
  TopItemGeral,
  AtividadeRecente,
  TipSemResultado,
} from '../services/DashboardService';
import { KPICard } from '../components/dashboard/KPICard';
import { WeekChart } from '../components/dashboard/WeekChart';
import TopItems from '../components/dashboard/TopItems';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { NoResultTips } from '../components/dashboard/NoResultTips';

// Dependency Inversion: Usa abstração do serviço
const dashboardService = createDashboardService();

// chaves fortes para acessar KPIData sem casts
type KPIKey = 'whatsapp' | 'mapa' | 'impressoes' | 'ctr';
type KPITitle = 'WhatsApp' | 'Mapa' | 'Impressões' | 'CTR';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Estado do período
  const [periodo, setPeriodo] = useState<'7d' | '30d'>('7d');

  // Estados dos dados
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [serie, setSerie] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });
  const [topMeus, setTopMeus] = useState<TopItemMeu[]>([]);
  const [topGeral, setTopGeral] = useState<TopItemGeral[]>([]);
  const [activities, setActivities] = useState<AtividadeRecente[]>([]);
  const [tips, setTips] = useState<TipSemResultado[]>([]);

  // Carregar dados quando período muda
  useEffect(() => {
    setKpis(dashboardService.getKPIs(periodo));
    setSerie(dashboardService.getSerieImpressoes(periodo));
    setTopMeus(dashboardService.getTopItensMeus(periodo));
    setTopGeral(dashboardService.getTopItensGeral(periodo));
    setActivities(dashboardService.getAtividadeRecente(periodo));
    setTips(dashboardService.getTipsSemResultado(periodo));
  }, [periodo]);

  // Handlers para navegação
  const handleAddPrice = (itemName: string) => {
    navigate(`/portal/estoque?search=${encodeURIComponent(itemName)}`);
  };

  const handleViewInStock = (itemName: string) => {
    navigate(`/portal/estoque?search=${encodeURIComponent(itemName)}`);
  };

  const handleAddItem = (itemName: string) => {
    navigate(`/portal/estoque?add=${encodeURIComponent(itemName)}`);
  };

  // KPIs configuration (tipado)
  const kpiConfigs: { key: KPIKey; title: KPITitle }[] = [
    { key: 'whatsapp', title: 'WhatsApp' },
    { key: 'mapa', title: 'Mapa' },
    { key: 'impressoes', title: 'Impressões' },
    { key: 'ctr', title: 'CTR' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Acompanhe o desempenho da sua loja.</p>
          <p className="text-xs text-gray-500 mt-1">Última atualização: agora</p>
        </div>

        {/* Period Toggle */}
        <div className="bg-gray-100 rounded-xl p-1 flex self-start sm:self-auto flex-shrink-0">
          <button
            onClick={() => setPeriodo('7d')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              periodo === '7d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriodo('30d')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              periodo === '30d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            30 dias
          </button>
        </div>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {kpiConfigs.map((config, index) => (
            <KPICard
              key={config.key}
              title={config.title}
              value={kpis[config.key]}
              delta={kpis.deltaKpis[config.key]}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Row: Top Itens (esq) + Atividade/Tips (dir) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <div className="xl:col-span-8">
          <TopItems
            meus={topMeus}
            geral={topGeral}
            onAddPrice={handleAddPrice}
            onViewInStock={handleViewInStock}
            onAddItem={handleAddItem}
          />
        </div>
        <div className="xl:col-span-4 space-y-4">
          <RecentActivity activities={activities} />
          <NoResultTips tips={tips} onAddItem={handleAddItem} />
        </div>
      </div>

      {/* Gráfico abaixo (usa série conforme período) */}
      <WeekChart period={periodo} labels={serie.labels} values={serie.values} />
    </div>
  );
};
