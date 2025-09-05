// Single Responsibility: Utilitários de formatação
// Pure functions para formatação de dados

export const formatBRL = (value: number | null): string => {
  if (value === null || value === undefined) return '—';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPct = (value: number | null, showSign: boolean = false): string => {
  if (value === null || value === undefined) return '—';
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
  
  if (showSign && value > 0) {
    return `+${formatted}`;
  }
  
  return formatted;
};

export const formatNumber = (value: number | null): string => {
  if (value === null || value === undefined) return '—';
  
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatRelTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'agora';
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit' 
  });
};

export const getDeltaColor = (value: number): string => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getDeltaIcon = (value: number): string => {
  if (value > 0) return '↗';
  if (value < 0) return '↘';
  return '→';
};