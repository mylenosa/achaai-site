import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Phone, 
  Star, 
  TrendingUp, 
  Users, 
  MessageCircle,
  Calendar,
  ShoppingBag
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
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-emerald-50 rounded-lg p-3">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${changeColors[changeType]}`}>
          {change}
        </span>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </motion.div>
  );
};

export const Analytics: React.FC = () => {
  const metrics = [
    {
      title: 'Visualizações de Perfil',
      value: '1,247',
      change: '+12% esta semana',
      changeType: 'positive' as const,
      icon: Eye
    },
    {
      title: 'Cliques no Contato',
      value: '89',
      change: '+5% esta semana',
      changeType: 'positive' as const,
      icon: Phone
    },
    {
      title: 'Novas Avaliações',
      value: '23',
      change: '+3 esta semana',
      changeType: 'positive' as const,
      icon: Star
    },
    {
      title: 'Taxa de Conversão',
      value: '7.1%',
      change: '-2% esta semana',
      changeType: 'negative' as const,
      icon: TrendingUp
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Novo cliente visualizou seu perfil', time: '2 min atrás', type: 'view' },
    { id: 2, action: 'Cliente clicou no WhatsApp', time: '15 min atrás', type: 'contact' },
    { id: 3, action: 'Nova avaliação recebida (5 estrelas)', time: '1 hora atrás', type: 'review' },
    { id: 4, action: 'Perfil apareceu em busca por "ferramentas"', time: '2 horas atrás', type: 'search' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'contact': return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'search': return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default: return <Calendar className="w-4 h-4 text-gray-500" />;
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
        <div className="bg-emerald-50 text-emerald-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium self-start sm:self-auto">
          Última atualização: agora
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

      {/* Gráfico Simples e Atividade Recente */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Gráfico de Visualizações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Visualizações dos Últimos 7 Dias</h3>
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% vs semana anterior
            </div>
          </div>
          
          {/* Gráfico Simples com Barras */}
          <div className="space-y-3">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
              const values = [45, 52, 38, 67, 89, 34, 28];
              const maxValue = Math.max(...values);
              const percentage = (values[index] / maxValue) * 100;
              
              return (
                <div key={day} className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 w-6 sm:w-8">{day}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 sm:h-3 relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 w-6 sm:w-8 text-right">
                    {values[index]}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Atividade Recente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Atividade Recente</h3>
          
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-900 leading-relaxed">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Cards de Ação Rápida */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Produtos em Destaque</h3>
            <ShoppingBag className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-emerald-100 text-xs sm:text-sm mb-3 sm:mb-4">
            Promova seus produtos mais vendidos
          </p>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            Gerenciar
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Horários Especiais</h3>
            <Calendar className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">
            Configure feriados e horários especiais
          </p>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            Configurar
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white md:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Suporte</h3>
            <Users className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-purple-100 text-xs sm:text-sm mb-3 sm:mb-4">
            Precisa de ajuda? Fale conosco
          </p>
          <button className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
            Contatar
          </button>
        </div>
      </motion.div>
    </div>
  );
};