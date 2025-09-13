// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { config } from '../lib/config';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  createDashboardService,
  KPIData,
  TopItemMeu,
  TopItemGeral,
  AtividadeRecente,
  SerieData,
} from '../services/DashboardService';
import { KPICard } from '../components/dashboard/KPICard';
import { WeekChart } from '../components/dashboard/WeekChart';
import { TopItems } from '../components/dashboard/TopItems';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { NoResultTips } from '../components/dashboard/NoResultTips';

const { getDashboardData } = createDashboardService();

type KPIKey = 'whatsapp' | 'mapa' | 'impressoes' | 'ctr';
type KPITitle = 'WhatsApp' | 'Mapa' | 'Impressões' | 'CTR';

// tipo local para “tips” (buscas sem resultado)
type Tip = { termo: string; qtd: number };

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);

  // Estados dos dados
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [serie, setSerie] = useState<SerieData | null>(null);
  const [topMeus, setTopMeus] = useState<TopItemMeu[]>([]);
  const [topGeral, setTopGeral] = useState<TopItemGeral[]>([]);
  const [activities, setActivities] = useState<AtividadeRecente[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getDashboardData(periodo);
        if (!alive) return;
        setKpis(data.kpis);
        setSerie(data.serie);
        setTopMeus(data.topMeus);
        setTopGeral(data.topGeral);
        setActivities(data.activities);
        setTips(data.tips);
      } catch (e) {
        console.error('Dashboard page error:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [periodo]);


  const handleAddItem = (itemName: string) =>
    navigate(`/portal/estoque?add=${encodeURIComponent(itemName)}`);

  const kpiConfigs: { key: KPIKey; title: KPITitle }[] = [
    { key: 'whatsapp', title: 'WhatsApp' },
    { key: 'mapa', title: 'Mapa' },
    { key: 'impressoes', title: 'Impressões' },
    { key: 'ctr', title: 'CTR' },
  ];

  if (loading || !kpis || !serie) {
    return <div className="text-center p-8">Carregando dados do dashboard...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Portal | {config.app.name}</title>
      </Helmet>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Acompanhe o desempenho da sua loja.
            </p>
          </div>
          <div className="bg-gray-100 rounded-xl p-1 flex self-start sm:self-auto flex-shrink-0">
            <button
              onClick={() => setPeriodo('7d')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                periodo === '7d'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setPeriodo('30d')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                periodo === '30d'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Últimos 30 dias
            </button>
          </div>
        </div>

        {/* KPIs */}
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

        {/* Gráfico e Atividade Recente */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2">
            <WeekChart {...serie} />
          </div>
          <div className="xl:col-span-1">
            <RecentActivity activities={activities} />
          </div>
        </div>

        {/* Insights e Oportunidades */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <TopItems
            meus={topMeus}
            geral={topGeral}
            onAddPrice={(name: string) =>
              navigate(`/portal/estoque?search=${encodeURIComponent(name)}`)
            }
            onViewInStock={(name: string) =>
              navigate(`/portal/estoque?search=${encodeURIComponent(name)}`)
            }
            onAddItem={handleAddItem}
          />
          <NoResultTips tips={tips} onAddItem={handleAddItem} />
        </div>
      </div>
    </>
  );
};
