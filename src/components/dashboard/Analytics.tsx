import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  MapPin, 
  Eye, 
  TrendingUp,
  Clock,
  Search,
  AlertTriangle
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-emerald-50 rounded-xl p-3">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">{title}</p>
          <span className={`text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        </div>
        <p className="text-xs text-gray-500">Atualizado agora</p>
      </div>
    </motion.div>
  );
};

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  // Mock data que muda baseado no período
  const getMetrics = (period: '7d' | '30d') => {
    if (period === '7d') {
      return [
        {
          title: 'Contatos (WhatsApp)',
          value: '47',
          change: '+12%',
          changeType: 'positive' as const,
          icon: MessageCircle
        },
        {
          title: 'Cliques no Mapa',
          value: '89',
          change: '+8%',
          changeType: 'positive' as const,
          icon: MapPin
        },
        {
          title: 'Impressões',
          value: '1.2k',
          change: '+15%',
          changeType: 'positive' as const,
          icon: Eye
        },
        {
          title: 'CTR (%)',
          value: '3.9%',
          change: '-2%',
          changeType: 'negative' as const,
          icon: TrendingUp
        }
      ];
    } else {
      return [
        {
          title: 'Contatos (WhatsApp)',
          value: '203',
          change: '+18%',
          changeType: 'positive' as const,
          icon: MessageCircle
        },
        {
          title: 'Cliques no Mapa',
          value: '387',
          change: '+22%',
          changeType: 'positive' as const,
          icon: MapPin
        },
        {
          title: 'Impressões',
          value: '5.1k',
          change: '+25%',
          changeType: 'positive' as const,
          icon: Eye
        },
        {
          title: 'CTR (%)',
          value: '4.2%',
          change: '+5%',
          changeType: 'positive' as const,
          icon: TrendingUp
        }
      ];
    }
  };

  const metrics = getMetrics(period);

  const topSearchTerms = [
    { term: 'tinta spray', count: 45, percentage: 100 },
    { term: 'parafuso', count: 38, percentage: 84 },
    { term: 'wd-40', count: 32, percentage: 71 },
    { term: 'martelo', count: 28, percentage: 62 },
    { term: 'furadeira', count: 24, percentage: 53 },
    { term: 'chave de fenda', count: 21, percentage: 47 },
    { term: 'fita isolante', count: 18, percentage: 40 },
    { term: 'cola', count: 15, percentage: 33 },
    { term: 'prego', count: 12, percentage: 27 },
    { term: 'lixa', count: 9, percentage: 20 }
  ];

  const noResultTerms = [
    'tinta fosforescente',
    'parafuso titanio',
    'martelo pneumático',
    'furadeira laser',
    'chave inglesa 50mm',
    'fita dupla face industrial',
    'cola epóxi transparente',
    'prego galvanizado 10cm',
    'lixa d\'água 2000',
    'verniz marítimo'
  ];

  const recentActivity = [
    { id: 1, action: 'Cliente clicou no WhatsApp', time: '2 min atrás', type: 'contact' },
    { id: 2, action: 'Busca por "tinta spray vermelha"', time: '5 min atrás', type: 'search' },
    { id: 3, action: 'Cliente visualizou no mapa', time: '8 min atrás', type: 'view' },
    { id: 4, action: 'Busca por "parafuso phillips"', time: '12 min atrás', type: 'search' },
    { id: 5, action: 'Cliente clicou no WhatsApp', time: '15 min atrás', type: 'contact' },
    { id: 6, action: 'Busca por "wd-40 300ml"', time: '18 min atrás', type: 'search' },
    { id: 7, action: 'Cliente visualizou no mapa', time: '22 min atrás', type: 'view' },
    { id: 8, action: 'Busca por "martelo 500g"', time: '25 min atrás', type: 'search' },
    { id: 9, action: 'Cliente clicou no WhatsApp', time: '28 min atrás', type: 'contact' },
    { id: 10, action: 'Busca por "furadeira bosch"', time: '32 min atrás', type: 'search' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'search': return <Search className="w-4 h-4 text-blue-500" />;
      case 'view': return <Eye className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Acompanhe o desempenho da sua loja</p>
        </div>
        
        {/* Period Toggle */}
        <div className="bg-gray-100 rounded-xl p-1 flex self-start sm:self-auto">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === '7d' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === '30d' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            30 dias
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>

      {/* Seções de Dados */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Termos mais buscados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Termos mais buscados</h3>
          
          <div className="space-y-3 sm:space-y-4">
            {topSearchTerms.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                className="flex items-center space-x-3"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{item.term}</span>
                    <span className="text-xs text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: 0.6 + index * 0.05 }}
                      className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sem resultado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Sem resultado</h3>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {noResultTerms.map((term, index) => (
              <motion.div
                key={term}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 leading-relaxed">{term}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xs text-orange-700">
              <strong>Dica:</strong> Considere adicionar estes produtos ao seu estoque para capturar mais vendas.
            </p>
          </div>
        </motion.div>

        {/* Atividade Recente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Atividade recente</h3>
          
          <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};