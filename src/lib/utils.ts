import { PricingPlan } from './types';
import { config } from './config';

// Inventory Item Type
export type Item = {
  id: string;
  title: string;
  price: number | null;
  available: boolean;
  verifiedAt?: string;
  active: boolean;
  updatedAt: string;
};

// Currency parsing and formatting utilities
export function parseCurrency(str: string): number | null {
  if (!str || str.trim() === '') return null;
  
  // Remove currency symbols and spaces
  const cleaned = str.replace(/[R$\s]/g, '');
  
  // Handle Brazilian format (1.999,90) and US format (1,999.90)
  let normalized = cleaned;
  
  // If has both comma and dot, assume Brazilian format
  if (cleaned.includes(',') && cleaned.includes('.')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // If has only comma, assume it's decimal separator
  else if (cleaned.includes(',') && !cleaned.includes('.')) {
    normalized = cleaned.replace(',', '.');
  }
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : Math.max(0, parsed);
}

export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function ageInDays(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function cn(...inputs: (string | undefined)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// Single Responsibility: Função específica para criar links mailto dos planos
// Open/Closed: Extensível para diferentes tipos de e-mail
export function createPlanMailtoLink(plan: PricingPlan): string {
  const subject = `Interesse no Plano ${plan.name}`;
  
  const bodyLines = [
    'Olá,',
    '',
    `Tenho interesse no Plano ${plan.name} (${plan.price}${plan.period || ''}) com as seguintes funcionalidades:`,
    '',
    ...plan.features.map(feature => `• ${feature}`),
    '',
    'Gostaria de mais informações sobre:',
    '• Processo de cadastro',
    '• Forma de pagamento',
    '• Prazo para ativação',
    '',
    'Aguardo retorno.',
    '',
    'Atenciosamente.'
  ];
  
  const body = bodyLines.join('\n');
  
  const params = new URLSearchParams({
    subject,
    body
  });
  
  // Substituir + por %20 para melhor legibilidade no cliente de e-mail
  const encodedParams = params.toString().replace(/\+/g, '%20');
  
  return `mailto:${config.app.contactEmail}?${encodedParams}`;
}