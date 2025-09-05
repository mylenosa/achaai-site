import { PricingPlan } from './types';
import { config } from './config';
import * as XLSX from 'xlsx';

// Inventory Item Type
export type Item = {
  id: string;
  title: string;
  price: number | null;
  available: boolean;
  verifiedAt?: string;
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

// Helper for case-insensitive title comparison
export function toTitleKey(title: string): string {
  return title.toLowerCase().trim();
}

// Generate Excel template for inventory
export function generateInventoryTemplate(): void {
  const data = [
    ['Item', 'Preço (opcional)'],
    ['Tinta Spray Vermelha 400ml', '15,90'],
    ['WD-40 300ml', '25.50'],
    ['Parafuso Phillips 3x20', '']
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
  
  // Set column widths
  ws['!cols'] = [
    { width: 30 }, // Item column
    { width: 15 }  // Price column
  ];
  
  XLSX.writeFile(wb, 'modelo_estoque.xlsx');
}

// Parse Excel file for inventory import
export function parseInventoryExcel(file: File): Promise<{ title: string; price: number | null }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and process data
        const rows = jsonData.slice(1) as string[][];
        const items = rows
          .filter(row => row[0] && row[0].toString().trim()) // Has title
          .map(row => ({
            title: row[0].toString().trim(),
            price: row[1] ? parseCurrency(row[1].toString()) : null
          }));
        
        resolve(items);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}